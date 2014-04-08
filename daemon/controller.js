var moment = require("moment");
var _ = require("lodash");
var async = require("async");

var cacheHandler = require("./cacheHandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");
var savedItems = require("./savedItems");
var favourites = require("./favourites");

// runtime variables managing state

var rescheduleTimer;
var cycleRunning = false;

// restricted to run only once.
var hookCycleListeners = _.once(function() {
  rssHandler.on("fetched", function() {
    cacheHandler.save();
    linkParser.getUploadedLinks();
  });
  linkParser.on("fetched", function() {
    cacheHandler.save();
    scheduleFetchCycle();
    cycleRunning = false;
  });

  rssHandler.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:hookCycleListeners got rssHandler error: " + err);
    cycleRunning = false;
  });

  linkParser.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:hookCycleListeners got linkParser error: " + err);
    cycleRunning = false;
  });
});

// startup execute - create bindings to cacheHandler, but wait until NW responds
(function startup() {

  console.log("controller:startup");

  // check for debug flag...
  try {
    var pjson = require("../package.json");
    process.NWAPP_DEBUG = (_.isUndefined(pjson.NWAPP_DEBUG) === false) ? pjson.NWAPP_DEBUG : false;
  } catch (e) {
    process.NWAPP_DEBUG = false;
  }

  // start by loading old items into our cache
  cacheHandler.once("loaded", startCycle);

  cacheHandler.on("error", function(err) {
    // cacheHandler error? what to do?
    console.error("controller:startup got cacheHandler error: " + err);
  });

}());

// starts a cycle.
function startCycle() {
  hookCycleListeners();
  cycleRunning = true;
  rssHandler.fetch();
}

function scheduleFetchCycle() {
  rescheduleTimer = setTimeout(function() {
    startCycle();
  }, config.rescheduleMS);
  console.log("controller:scheduleFetchCycle next cycle will execute at " +
    moment().add('milliseconds', config.rescheduleMS).toDate());
}

function runFetchCycleNow() {
  if (cycleRunning === false) {
    console.log("controller:runFetchCycleNow (executing)");
    clearTimeout(rescheduleTimer);
    startCycle();
    printDynamicContentNW();
  } else {
    console.log("controller: runFetchCycleNow (not executing, already running)");
  }
}

// EXPORTED immediately run a new cycle now
module.exports.runFetchCycleNow = runFetchCycleNow;


// ---
// EXPORTED node-webkit ONLY
// ---

var nextFetchTime = false;

var NWAPP;
module.exports.NWReady = function() {
  console.log("controller:NWReady");

  // we need the window object within here, hence check for it
  if (_.isUndefined(window) === true) {
    console.error("controller:NWReady undefined window object!");
    return;
  }

  // sets the link to the clientApp.
  NWAPP = window.NWAPP;

  // initial set on page load...
  NWAPP.hookStaticBindings();

  // if daemons cycle already running, tell client instantly
  if (cycleRunning === true) {
    NWAPP.startCycle();
  }

  // link the cacheHandler with NW provided localStorage object
  cacheHandler.linkLocalStorage(window.localStorage);

  // manage node-webkit listeners
  hookNWListeners();

  // print the dynamic output initially...
  printDynamicContentNW();
};

// restricted to run only once.
var hookNWListeners = _.once(function() {
  rssHandler.on("start", cycleStartsNW);
  linkParser.on("fetched", cycleDoneNW);

  rssHandler.on("progress", cycleProgressNW);
  linkParser.on("progress", cycleProgressNW);
  linkParser.on("progress", cycleProgressNWUpdateUI);

  linkParser.on("error", cycleErrorNW);
  rssHandler.on("error", cycleErrorNW);
  cacheHandler.on("error", cycleErrorNW);

  cacheHandler.load(); // start cacheing now that localStorage is available.
});


function cycleStartsNW() {
  nextFetchTime = false;
  NWAPP.startCycle();
}

function cycleDoneNW() {
  NWAPP.endCycle();
  nextFetchTime = moment().add('milliseconds', config.rescheduleMS).format(config.format.clock);
  printDynamicContentNW();
}

function cycleErrorNW(e, suppressDefault) {
  NWAPP.printErrorMessage({
    errorMessage: e.toString(),
    suppressDefault: suppressDefault
  });
  cycleDoneNW();
}

function cycleProgressNW(progressCount) {
  nextFetchTime = false;
  NWAPP.updateProgress(progressCount);
}

function cycleProgressNWUpdateUI(processCount) {
  printDynamicContentNW(true);
}

var searchString = "";
var keywordString = "";

// set clients dynamic content
function printDynamicContentNW(suppressLoading) {
  var allItems = [];
  var favouriteItems = [];
  var favouriteKeywords = [];
  var totalCount = 0;

  async.series({
      printLoading: function(callback) {
        _.defer(function(callback) {
          if (!suppressLoading) {
            NWAPP.printLoading();
          }
          callback(null);
        }, callback);
      },
      computeFavourites: function(callback) {
        _.defer(function(callback) {
          favourites.each(function(fav) {
            var favCount = 0;
            savedItems.each(function(item) {
              if (item.stringMatchesTitle(fav.get("keyword"))) {
                favCount += 1;
                totalCount += 1;
              }
            });
            favouriteKeywords.push({
              keyword: fav.get("keyword"),
              count: favCount,
              selected: (keywordString === fav.get("keyword")) ? true : false
            });
          });
          callback(null);
        }, callback);
      },
      printFavouriteKeywords: function(callback) {
        _.defer(function(callback) {
          NWAPP.printFavouriteKeywords({
            favourites: favouriteKeywords,
            noFilter: (keywordString === "") ? true : false,
            totalCount: totalCount
          });
          callback(null);
        }, callback);
      },
      computeItems: function(callback) {
        _.defer(function(callback) {
          savedItems.each(function(item) {
            if (item.stringMatchesTitle(searchString)) {
              allItems.push(item.getPrintable());
            }
            if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
              favouriteItems.push(item.getPrintable());
            }
          });
          callback(null);
        }, callback);
      },
      printFavouriteItems: function(callback) {
        _.defer(function(callback) {
          NWAPP.printFavouriteItems({
            items: favouriteItems
          });
          callback(null);
        }, callback);
      },
      printAllItems: function(callback) {
        _.defer(function(callback) {
          NWAPP.printAllItems({
            items: allItems
          });
          callback(null);
        }, callback);
      },
      printSettings: function(callback) {
        _.defer(function(callback) {
          NWAPP.printSettings({
            nextFetchTime: nextFetchTime,
            interval: config.rescheduleMS / 1000 / 60,
            fetchOnlyFavourites: config.fetchOnlyFavourites,
            maxLinkRefetchRetrys: config.maxLinkRefetchRetrys,
            requestTimeoutSec: config.requestTimeoutMS / 1000,
            publicCoin: config.publicCoin,
            mail: config.mail
          });
          callback(null);
        }, callback);
      },
      hookDynamicBindings: function(callback) {
        _.defer(function(callback) {
          NWAPP.hookDynamicBindings();
          callback(null);
        }, callback);
      }
    },
    function(err, results) {
      if (err) {
        console.error("ASYNC: GOT ERROR!");
      } else {
        console.log("ASYNC: DONE!");
      }
    }
  );
}

// set search content
module.exports.NWupdateSearchString = function(str) {
  searchString = _.unescape(str).toLowerCase();
  printDynamicContentNW();
};

function NWupdateKeywordString(str) {
  keywordString = _.unescape(str).toLowerCase();
  printDynamicContentNW();
}

module.exports.NWupdateKeywordString = NWupdateKeywordString;

// add a keyword
module.exports.NWaddCurrentKeyword = function() {

  // only add it if it is new!
  if (_.isUndefined(favourites.findWhere({
    keyword: searchString
  })) === true) {
    favourites.add({
      keyword: searchString
    });
    cacheHandler.save();
  }

  // searchString to keyword string...
  NWupdateKeywordString(searchString);

  runFetchCycleNow();
};

// add a keyword
module.exports.NWremoveKeyword = function(keyword) {

  favourites.remove(favourites.findWhere({
    keyword: keyword
  }));

  // save because it was removed
  cacheHandler.save();

  // no keyword selected anymore
  keywordString = "";

  printDynamicContentNW();
};

module.exports.NWmarkItemAsDownloaded = function(uuid) {
  var updateItem = savedItems.findWhere({
    uuid: uuid
  });

  if (_.isUndefined(updateItem) === false) {
    updateItem.set("userClickedFilehosterLink", true);

    // save because it was updated
    cacheHandler.save();

    printDynamicContentNW(true);
  } else {
    // error item with uuid not found!
    console.error("controller.NWmarkItemAsDownloaded item with uuid " + uuid + " not found!");
    cycleErrorNW("controller.NWmarkItemAsDownloaded item with uuid " + uuid + " not found!", true);
  }
};

// settings, reset everything.
module.exports.clearCacheReset = function() {
  cacheHandler.clear();
  savedItems.reset();
  favourites.reset();

  searchString = "";
  keywordString = "";

  printDynamicContentNW();
  runFetchCycleNow();
};
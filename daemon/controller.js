var moment = require("moment");
var _ = require("lodash");

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
  });

  linkParser.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:hookCycleListeners got linkParser error: " + err);
  });
});

// startup execute - create bindings to cacheHandler, but wait until NW responds
(function startup() {
  // start by loading old items into our cache
  cacheHandler.once("loaded", startCycle);

  cacheHandler.on("error", function(err) {
    // stop cycle immediately?
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
  linkParser.on("start", cycleStartsNW);
  rssHandler.on("fetched", cycleDoneNW);
  linkParser.on("fetched", cycleDoneNW);
  rssHandler.on("progress", cycleProgressNW);
  linkParser.on("progress", cycleProgressNW);

  cacheHandler.load(); // start cacheing now that localStorage is available.
});


function cycleStartsNW() {
  nextFetchTime = false;
  NWAPP.startCycle();
}

function cycleDoneNW() {
  NWAPP.endCycle();
  nextFetchTime = moment().add('milliseconds', config.rescheduleMS).format("HH:mm:ss");
  printDynamicContentNW();
}

function cycleProgressNW(progressCount) {
  nextFetchTime = false;
  NWAPP.updateProgress(progressCount);
}

var searchString = "";
var keywordString = "";

// set clients dynamic content
function printDynamicContentNW() {
  var allItems = [];
  var favouriteItems = [];
  var favouriteKeywords = [];
  var totalCount = 0;

  savedItems.each(function(item) {
    if (item.stringMatchesTitle(searchString)) {
      allItems.push(item.getPrintable());
    }
    if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
      favouriteItems.push(item.getPrintable());
    }
  });

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

  NWAPP.printFavouriteItems({
    items: favouriteItems
  });

  NWAPP.printAllItems({
    items: allItems
  });

  NWAPP.printFavouriteKeywords({
    favourites: favouriteKeywords,
    noFilter: (keywordString === "") ? true : false,
    totalCount: totalCount
  });

  NWAPP.printSettings({
    nextFetchTime: nextFetchTime,
    interval: config.rescheduleMS/1000/60
  });

  // tell client to hook its listeners to the dynamic content
  NWAPP.hookDynamicBindings();
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
  favourites.add({
    keyword: searchString
  });
  cacheHandler.save();

  // searchString to keyword string...
  NWupdateKeywordString(searchString);

  printDynamicContentNW();
  runFetchCycleNow();
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
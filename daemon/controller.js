var moment = require("moment");
var _ = require("lodash");

var cacheHandler = require("./cacheHandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");
var savedItems = require("./savedItems");

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

// startup execute
(function startup() {
  // start by loading old items into our cache
  cacheHandler.once("loaded", startCycle);

  cacheHandler.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:startup got cacheHandler error: " + err);
  });

  if (config.cache.preferLocalStorage === false) {
    cacheHandler.load(); // load immediately if normal file caching enabled, else wait for NW-localstorage
  }
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


// EXPORTED immediately run a new cycle now
module.exports.runFetchCycleNow = function() {
  if (cycleRunning === false) {
    console.log("controller:runFetchCycleNow (executing)");
    clearTimeout(rescheduleTimer);
    startCycle();
  } else {
    console.log("controller: runFetchCycleNow (not executing, already running)");
  }
};


// ---
// EXPORTED node-webkit ONLY
// ---

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

  if (config.cache.preferLocalStorage === true) {
    cacheHandler.load(); // start cacheing now that localStorage is available.
  }
});


function cycleStartsNW() {
  NWAPP.startCycle();
}

function cycleDoneNW() {
  NWAPP.endCycle();
  printDynamicContentNW();
}

function cycleProgressNW(progressCount) {
  printDynamicContentNW();
  NWAPP.updateProgress(progressCount);
}

var searchString = "";

// set clients dynamic content
function printDynamicContentNW() {
  var all = [];
  var favourites = [];

  savedItems.each(function(item) {
    if (item.stringMatchesTitle(searchString)) {
      all.push(item.getPrintable());
      if (item.isFavourite() === true) {
        favourites.push(item.getPrintable());
      }
    }
  });

  NWAPP.printFavourites({
    items: favourites
  });

  NWAPP.printAll({
    items: all
  });

  // tell client to hook its listeners to the dynamic content
  NWAPP.hookDynamicBindings();
}

// set search content
module.exports.NWupdateSearchString = function (str) {
  searchString = _.unescape(str);
  printDynamicContentNW();
};

module.exports.clearCacheReset = function () {
  cacheHandler.clear();
  savedItems.reset();
  printDynamicContentNW();
};
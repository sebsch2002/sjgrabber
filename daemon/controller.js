var moment = require("moment");
var _ = require("lodash");

var cacheHandler = require("./cacheHandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");
var output = require("./output");

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

module.exports.nodeWindowReady = function() {
  console.log("controller:nodeWindowReady");

  // call CLIENT exported methods...
  //window.setNWClipboardBinding();
  window.setNWButtonBinding();
  window.toggleNWRefetchButtonAvailable(!cycleRunning);

  // is a cycle currently running? - start progress.
  if (cycleRunning === true) {
    window.NProgress.start();
  }

  cacheHandler.linkLocalStorage(window.localStorage);

  // manage node-webkit listeners
  hookNWListeners();

  // print the output...
  printOutputNW();
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
  window.NProgress.start();
  window.toggleNWRefetchButtonAvailable(false);
}

function cycleDoneNW() {
  window.NProgress.done();
  printOutputNW();
  window.toggleNWRefetchButtonAvailable(true);
}

function cycleProgressNW(progressCount) {
  window.NProgress.set(progressCount);
}

function printOutputNW() {
  console.log("controller:printOutputNW updating output");

  // add output to containers
  var appContainer = window.document.getElementById('appContainer');
  appContainer.innerHTML = output.getPlainHTML();

  window.setNWClipboardBinding();
}
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

  // rssHandler.on("error", function(err) {
  //   // stop cycle immediately?
  //   console.log("controller:hookCycleListeners catched rssHandler error!");
  // });

  // linkParser.on("error", function(err) {
  //   // stop cycle immediately?
  //   console.log("controller:hookCycleListeners catched linkParser error!");
  // });
});

// startup execute
(function startup() {
  // start by loading old items into our cache
  cacheHandler.once("loaded", startCycle);
  // cacheHandler.on("error", function(err) {
  //   // stop cycle immediately?
  //   console.log("controller:startup catched cacheHandler error!");
  // });
  if (config.cacheViaLocalStorageOnly === false) {
    cacheHandler.load(); // load immediately if file caching enabled, else wait for NW-localstorage
  }
}());

// starts a cycle.
function startCycle() {
  hookCycleListeners();
  rssHandler.fetch();
  cycleRunning = true;
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
  window.setNWClipboardBinding();
  window.setNWButtonBinding();
  window.toggleNWRefetchButtonAvailable(!cycleRunning);

  // is a cycle currently running? - start progress.
  if (cycleRunning === true) {
    window.NProgress.start();
  }

  cacheHandler.linkLocalStorage(window.localStorage);

  // manage node-webkit listeners
  hookNWListeners();

  // add output to containers
  var appContainer = window.document.getElementById('appContainer');
  appContainer.innerHTML = output.getPlainHTML();
};

// restricted to run only once.
var hookNWListeners = _.once(function() {

  if (config.cacheViaLocalStorageOnly === true) {
    cacheHandler.load();
  }

  rssHandler.on("start", reloadNWWindowOnly);
  rssHandler.on("fetched", cycleDoneReloadNWWindow);
  linkParser.on("fetched", cycleDoneReloadNWWindow);
  cacheHandler.on("loaded", cycleDoneReloadNWWindow);
  rssHandler.on("progress", updateNWProgress);
  linkParser.on("progress", updateNWProgress);
});


function reloadNWWindowOnly() {
  window.document.location.reload(true);
}

function cycleDoneReloadNWWindow() {
  window.NProgress.done();
  window.document.location.reload(true);
}

function updateNWProgress(progressCount) {
  window.NProgress.set(progressCount);
}
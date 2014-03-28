var moment = require("moment");

var cacheHandler = require("./cachehandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");
var output = require("./output");

var rescheduler;

(function startup() {
  // start by loading old items into our cache
  cacheHandler.once("loaded", cacheLoaded);
  cacheHandler.load();
}());


function cacheLoaded() {
  setListeners();
  startCycle();
}

var cycleRunning = false;

function startCycle() {
  rssHandler.fetch();
  cycleRunning = true;
}

function setListeners() {
  rssHandler.on("fetched", function() {
    cacheHandler.save();
    linkParser.getUploadedLinks();
  });

  linkParser.on("fetched", function() {
    cacheHandler.save();
    scheduleFetchCycle();
    cycleRunning = false;
  });
}

function scheduleFetchCycle() {
  rescheduler = setTimeout(function() {
    startCycle();
  }, config.rescheduleMS);
  console.log("controller:scheduleFetchCycle next cycle will execute at " + moment().add('milliseconds', config.rescheduleMS).toDate());
}



module.exports.runFetchCycleNow = function () {
  if(cycleRunning === false) {
    console.log("controller:runFetchCycleNow (executing)");
    clearTimeout(rescheduler);
    startCycle();
  } else {
    console.log("controller: runFetchCycleNow (not executing, already running)");
  }
};


// ---
// node-webkit ONLY
// ---

var hookedListenersToWindow = false;

module.exports.nodeWindowReady = function () {
  console.log("controller:nodeWindowReady");

  var appContainer = window.document.getElementById('appContainer');

  //window.document.write(output.getPlainHTML());

  appContainer.innerHTML = output.getPlainHTML();

  window.setNWClipboardBinding();
  window.setNWButtonBinding();
  window.toggleNWRefetchButtonAvailable(!cycleRunning);

  if(cycleRunning === true) {
    window.NProgress.start();
  }
  
  if(hookedListenersToWindow === false) {

    rssHandler.on("start", function() {
      window.document.location.reload(true);
    });

    rssHandler.on("fetched", function() {
      window.NProgress.done();
      window.document.location.reload(true);
    });

    linkParser.on("fetched", function() {
      window.NProgress.done();
      window.document.location.reload(true);
    });

    rssHandler.on("progress", function(progressCount) {
      window.NProgress.set(progressCount);
    });

    linkParser.on("progress", function(progressCount) {
      window.NProgress.set(progressCount);
    });

    cacheHandler.on("loaded", function() {
      window.NProgress.done();
      window.document.location.reload(true);
    });

    hookedListenersToWindow = true;
  }
};



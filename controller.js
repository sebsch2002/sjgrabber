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
  rssHandler.fetch();
}

function setListeners() {
  rssHandler.on("fetched", function() {
    cacheHandler.save();
    linkParser.getUploadedLinks();
  });

  linkParser.on("fetched", function() {
    cacheHandler.save();
    scheduleFetchCycle();
  });
}

function scheduleFetchCycle() {
  rescheduler = setTimeout(function() {
    rssHandler.fetch();
  }, config.rescheduleMS);
  console.log("controller:scheduleFetchCycle next cycle will execute at " + moment().add('milliseconds', config.rescheduleMS).toDate());
}

function runFetchCycleNow() {
  console.log("controller:runFetchCycleNow");
  clearTimeout(rescheduler);
  rssHandler.fetch();
}




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

  if(hookedListenersToWindow === false) {

    rssHandler.on("fetched", function() {
      window.document.location.reload(true);
    });

    linkParser.on("fetched", function() {
      window.document.location.reload(true);
    });

    cacheHandler.on("loaded", function() {
      window.document.location.reload(true);
    });

    hookedListenersToWindow = true;
  }
};



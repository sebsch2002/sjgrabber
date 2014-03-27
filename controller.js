var moment = require("moment");

var cacheHandler = require("./cachehandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");

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
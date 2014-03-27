var cacheHandler = require("./cachehandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");

(function startup() {
  // start by loading old items into our cache
  cacheHandler.once("loaded", cacheLoaded);
  cacheHandler.load();
}());

function cacheLoaded() {
  rssHandler.on("fetched", function () {
    
    cacheHandler.save();

    // if(rssHandler.newItems > 0) {
    //   // parse these new links now!
    // } else {
    //   // schedule next rerequest...
    //   rssHandler.fetch();
    // }
    linkParser.getUploadedLinks();
  });

  rssHandler.fetch();
}
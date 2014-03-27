var cacheHandler = require("./cachehandler");
var parser = require("./parser");
var rssHandler = require("./rssHandler");

cacheHandler.once("loaded", function () {
  
  rssHandler.on("fetched", function () {
    
    cacheHandler.save();

    // if(rssHandler.newItems > 0) {
    //   // parse these new links now!
    // } else {
    //   // schedule next rerequest...
    //   rssHandler.fetch();
    // }
    parser.getUploadedLinks();
  });

  rssHandler.fetch();

});

// start by loading old items into our cache
cacheHandler.load();
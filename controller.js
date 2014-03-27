var cacheHandler = require("./cachehandler");
var parser = require("./parser");

cacheHandler.once("loaded", function () {
  console.log("loaded event");
  parser.makeRSSRequest();
});

cacheHandler.load();
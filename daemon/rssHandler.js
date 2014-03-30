var EventEmitter = require("events").EventEmitter;
var util = require("util");
var request = require('request');
var crypto = require("crypto");
var _ = require('lodash');
var FeedParser = require('feedparser');
var moment = require("moment");

var savedItems = require("./savedItems");
var config = require("./config");

var AVERAGE_ITEMS_IN_RSS_FEED = 3000;

var RSSHandler = function() {
  this.newItems = 0;
  this.dismissedItems = 0;
  this.allItems = 0;
  this.lastTimeFetched = false;
};

util.inherits(RSSHandler, EventEmitter);

RSSHandler.prototype.fetch = function() {
  var req = request({
    uri: config.rssUrl,
    timeout: config.requestTimeoutMS
  });
  var feedparser = new FeedParser({
    normalize: true,
    addmeta: true,
    resume_saxerror: true
  });
  var that = this;

  that.emit("start");

  this.newItems = 0;
  this.dismissedItems = 0;
  this.allItems = 0;

  req.on('error', function(error) {
    that.emit("error", error);
  });

  feedparser.on('error', function(error) {
    that.emit("error", error);
  });

  req.on('response', function(res) {
    var stream = this;

    if (res.statusCode != 200) {
      that.emit("error", "rssHandler:fetch request bad status code: " + res.statusCode);
      return;
    }

    process.stdout.write("rssHandler:fetch (in progress) |");
    stream.pipe(feedparser);
  });

  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this;
    var meta = this.meta;
    var item;
    var newUuid;

    while ((item = stream.read()) !== null) {

      // create uuid
      newUuid = crypto.createHash("md5").update(JSON.stringify(item.title)).digest("hex");

      // validate item is new based on uuid
      if (validateItemIsNew(newUuid) === true) {

        // new item, add
        savedItems.add({
          uuid: newUuid,
          title: item.title,
          link: item.link,
          date: moment(item.date).toDate(),
          uploadedLink: false
        });

        that.newItems += 1;

        process.stdout.write("*");

      } else {

        // old item, dismiss.
        that.dismissedItems += 1;

        process.stdout.write(".");
      }

      that.allItems += 1;

      if (that.allItems % 100 === 0) {
        that.emit("progress", (that.allItems / AVERAGE_ITEMS_IN_RSS_FEED));
      }

      if(config.stdoutSupportsCursorTo) {
        process.stdout.cursorTo(32);
        process.stdout.write("total: " + that.allItems + " - new: " + that.newItems);
      }

    }
  });

  req.on('end', function(res) {
    that.lastTimeFetched = new Date();

    console.log("| rssHandler:fetch (done)");
    console.log("rssHandler:status " + that.status());

    that.emit("fetched");
  });

};

RSSHandler.prototype.status = function() {
  return "new items: " + this.newItems +
    " - dismissed: " + this.dismissedItems +
    " - saved: " + savedItems.length +
    " - lastTimeFetched: " + this.lastTimeFetched;
};

// helper function to validate an item based on its hash
function validateItemIsNew(uuidToCheck) {
  if (_.isUndefined(savedItems.findWhere({
    uuid: uuidToCheck
  })) === false) {
    return false;
  } else {
    return true;
  }
}

module.exports = new RSSHandler();
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var fs = require('fs');
var _ = require('lodash');
var moment = require("moment"); // might take out!
var mkdirp = require("mkdirp");

var savedItems = require("./savedItems");
var config = require("./config");

var CacheHandler = function() {
  this.lastLoaded = false;
  this.lastSaved = false;
};

util.inherits(CacheHandler, EventEmitter);

CacheHandler.prototype.save = function() {
  console.log("cacheHandler:save");

  var that = this;

  mkdirp(config.cacheDir, function(err) {
    if (err) {
      console.error("cacheHandler: save mkdirp error " + err);
    } else {
      fs.writeFile(config.cacheDir + config.cacheFilename, JSON.stringify({
        staged: savedItems.toJSON()
      }), function(err) {
        if (err) {
          console.error("cacheHandler:save error " + err);
          that.emit("saveError");
          return;
        }

        that.lastSaved = new Date();
        that.emit("saved");
      });
    }
  });

};

CacheHandler.prototype.load = function() {
  console.log("cacheHandler:load");

  var that = this;

  fs.readFile(config.cacheDir + config.cacheFilename, 'utf8', function(err, data) {
    var savedObject = {};

    if (err) {
      console.error("cacheHandler:load error " + err);
    } else {
      savedObject = JSON.parse(data);

      // convinience meth for old model, convert string dates to real dates
      var i = 0,
        len = savedObject.staged.length;
      for (i; i < len; i += 1) {
        if (_.isString(savedObject.staged[i].date) === true) {
          //console.log("converting date...");
          savedObject.staged[i].date = moment(savedObject.staged[i].date).toDate();
        }
      }

      // insert into backbone collection
      savedItems.add(savedObject.staged);
      that.lastLoaded = new Date();
    }
    
    that.emit("loaded");
  });
};


module.exports = new CacheHandler();
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var fs = require('fs');
var _ = require('lodash');
var moment = require("moment"); // might take out, was only needed for migration.
var mkdirp = require("mkdirp");

var savedItems = require("./savedItems");
var config = require("./config");

var CacheHandler = function() {
  this.lastLoaded = false;
  this.lastSaved = false;
  this.localStorage = undefined;
};

util.inherits(CacheHandler, EventEmitter);

CacheHandler.prototype.save = function() {
  console.log("cacheHandler:save");

  var that = this;

  if (config.cache.enabled === false) {
    that.emit("saved");
    return;
  }

  if (config.cache.preferLocalStorage === true) {
    if (_.isUndefined(this.localStorage) === true) {
      this.emit("error", "cacheHandler:save localStorage is not linked to cacheHandler!");
    } else {
      // save to localStorage...
      this.localStorage.savedItems = JSON.stringify({
        staged: savedItems.toJSON()
      });
      that.lastSaved = new Date();
      that.emit("saved");
    }
    return;
  }

  // save to file...
  mkdirp(config.cache.fileStorage.dir, function(err) {
    if (err) {
      that.emit("error", err);
    } else {
      fs.writeFile(config.cache.fileStorage.dir + config.cache.fileStorage.filename, JSON.stringify({
        staged: savedItems.toJSON()
      }), function(err) {
        if (err) {
          that.emit("error", err);
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

  if (config.cache.enabled === false) {
    that.emit("loaded");
    return;
  }

  if (config.cache.preferLocalStorage === true) {
    if (_.isUndefined(this.localStorage) === true) {
      this.emit("error", "cacheHandler:load localStorage is not linked to cacheHandler!");
    } else {
      // load from localStorage...
      if (_.isUndefined(this.localStorage.savedItems) === false) {
        loadItems(this.localStorage.savedItems);
      }
      that.emit("loaded");
    }
    return;
  }

  // load from file...
  fs.readFile(config.cache.fileStorage.dir + config.cache.fileStorage.filename, 'utf8', function(err, data) {
    if (err) {
      that.emit("error", err);
    } else {
      loadItems(data);
    }

    that.emit("loaded");
  });
};

CacheHandler.prototype.linkLocalStorage = function(localStorage) {
  this.localStorage = localStorage;

  localStorage.test = "ass!";
};

function loadItems(data) {
  var savedObject;

  try {
    savedObject = JSON.parse(data);
  } catch (e) {
    cacheHandler.emit("error", e);
  }

  if (_.isUndefined(savedObject) === false &&
    _.isUndefined(savedObject.staged) === false) {

    // convert string dates to real dates
    var i = 0,
      len = savedObject.staged.length;
    for (i; i < len; i += 1) {
      if (_.isString(savedObject.staged[i].date) === true) {
        savedObject.staged[i].date = moment(savedObject.staged[i].date).toDate();
      }
    }

    savedItems.add(savedObject.staged);
  }
  cacheHandler.lastLoaded = new Date();
}

var cacheHandler = new CacheHandler();

module.exports = cacheHandler;
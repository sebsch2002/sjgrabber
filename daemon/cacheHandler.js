var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require('lodash');
var moment = require("moment"); // might take out, was only needed for migration.

var savedItems = require("./savedItems");
var favourites = require("./favourites");
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

  if (_.isUndefined(this.localStorage) === true) {
    this.emit("error", "cacheHandler:save localStorage is not linked to cacheHandler!");
  } else {

    // save ITEMS to localStorage...
    this.localStorage.savedItems = JSON.stringify({
      staged: savedItems.toJSON()
    });

    // save FAVOURITES to localStorage...
    this.localStorage.favourites = JSON.stringify({
      favourites: favourites.toJSON()
    });

    that.lastSaved = new Date();
    that.emit("saved");
  }
  return;

};

CacheHandler.prototype.load = function() {
  console.log("cacheHandler:load");

  var that = this;

  if (config.cache.enabled === false) {
    that.emit("loaded");
    return;
  }

  if (_.isUndefined(this.localStorage) === true) {
    this.emit("error", "cacheHandler:load localStorage is not linked to cacheHandler!");
  } else {

    // load ITEMS from localStorage...
    if (_.isUndefined(this.localStorage.savedItems) === false) {
      loadSavedItems(this.localStorage.savedItems);
    }

    // load FAVOURITES from localStorage...
    if (_.isUndefined(this.localStorage.favourites) === false) {
      loadFavourites(this.localStorage.favourites);
    }

    that.lastLoaded = new Date();
    that.emit("loaded");
  }
  return;
};

CacheHandler.prototype.linkLocalStorage = function(localStorage) {
  this.localStorage = localStorage;
};

CacheHandler.prototype.clear = function() {
  if (_.isUndefined(this.localStorage) === true) {
    this.emit("error", "cacheHandler:clear localStorage is not linked to cacheHandler!");
  } else {
    this.localStorage.clear();
    this.lastLoaded = false;
    this.lastSaved = false;
    this.emit("cleared");
  }
};

function loadSavedItems(data) {
  var dataObject = parseJSONObject(data);

  if (_.isUndefined(dataObject) === false &&
    _.isUndefined(dataObject.staged) === false) {

    // convert string dates to real dates
    var i = 0,
      len = dataObject.staged.length;
    for (i; i < len; i += 1) {
      if (_.isString(dataObject.staged[i].date) === true) {
        dataObject.staged[i].date = moment(dataObject.staged[i].date).toDate();
      }
    }

    savedItems.add(dataObject.staged);
  }
}

function loadFavourites(data) {
  var dataObject = parseJSONObject(data);

  if (_.isUndefined(dataObject) === false &&
    _.isUndefined(dataObject.favourites) === false) {

    favourites.add(dataObject.favourites);
  }
}

function parseJSONObject(data) {
  var dataObject;

  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    cacheHandler.emit("error", e);
  }

  return dataObject;
}

var cacheHandler = new CacheHandler();

module.exports = cacheHandler;
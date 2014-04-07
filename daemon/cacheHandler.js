var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require('lodash');
var moment = require("moment"); // might take out, was only needed for migration.

var savedItems = require("./savedItems");
var favourites = require("./favourites");
var config = require("./config");

// target active from localstorage
var activeLocalStorageTarget = config.cache.localStorageTargets.productive;

var CacheHandler = function() {
  this.lastLoaded = false;
  this.lastSaved = false;
  this.localStorage = undefined;
};

util.inherits(CacheHandler, EventEmitter);

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

    // migration script
    that.migrateBefore_v0_2_3();

    // load ITEMS from localStorage...
    if (_.isUndefined(this.localStorage[activeLocalStorageTarget.items]) === false) {
      loadSavedItems(this.localStorage[activeLocalStorageTarget.items]);
    }

    // load FAVOURITES from localStorage...
    if (_.isUndefined(this.localStorage[activeLocalStorageTarget.favourites]) === false) {
      loadFavourites(this.localStorage[activeLocalStorageTarget.favourites]);
    }

    that.lastLoaded = new Date();
    that.emit("loaded");
  }
  return;
};

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
    this.localStorage[activeLocalStorageTarget.items] = JSON.stringify(savedItems.toJSON());

    // save FAVOURITES to localStorage...
    this.localStorage[activeLocalStorageTarget.favourites] = JSON.stringify(favourites.toJSON());

    that.lastSaved = new Date();
    that.emit("saved");
  }
  return;
};

CacheHandler.prototype.linkLocalStorage = function(localStorage) {
  this.localStorage = localStorage;

  if (process.NWAPP_DEBUG === true) {
    console.log("cacheHandler:linkLocalStorage ---------- DEBUG MODE --------");
    // reset saving / loading items for DEBUG use, non production
    activeLocalStorageTarget = config.cache.localStorageTargets.debug;
  }

};

CacheHandler.prototype.clear = function() {
  if (_.isUndefined(this.localStorage) === true) {
    this.emit("error", "cacheHandler:clear localStorage is not linked to cacheHandler!");
  } else {

    // using remove each item individually
    this.localStorage.removeItem((activeLocalStorageTarget.items).toString());
    this.localStorage.removeItem((activeLocalStorageTarget.favourites).toString());

    this.lastLoaded = false;
    this.lastSaved = false;
    this.emit("cleared");
  }
};

// 
// helpers
// 

function loadSavedItems(data) {
  var dataObject = parseJSONObject(data);

  if (_.isUndefined(dataObject) === false) {

    // convert string dates to real dates
    var i = 0,
      len = dataObject.length;
    for (i; i < len; i += 1) {
      if (_.isString(dataObject[i].date) === true) {
        dataObject[i].date = moment(dataObject[i].date).toDate();
      }
    }

    savedItems.add(dataObject);
  }
}

function loadFavourites(data) {
  var dataObject = parseJSONObject(data);

  if (_.isUndefined(dataObject) === false) {
    favourites.add(dataObject);
  }
}

function parseJSONObject(data) {
  var dataObject = false;

  // only parse strings
  if (_.isString(data) === true) {
    try {
      dataObject = JSON.parse(data);
    } catch (e) {
      cacheHandler.emit("error", "cacheHandler:parseJSONObject error: " + e + " data: " + data);
    }
  }

  // already an object? don't parse!
  if (_.isObject(data) === true) {
    dataObject = data;
  }

  return dataObject;
}


//
// migration
// 

// usage previous to v0.2.3 - migrate existing keywords
CacheHandler.prototype.migrateBefore_v0_2_3 = function() {

  // old are: savedItems.staged and favourites.favourites
  var migrateSavedItems = false;
  var migrateFavourites = false;

  // migrate items
  if (_.isUndefined(this.localStorage.savedItems) === false) {
    migrateSavedItems = parseJSONObject(this.localStorage.savedItems);
    if (_.isUndefined(migrateSavedItems.staged) === false) {
      loadSavedItems(migrateSavedItems.staged);
      this.localStorage.removeItem("savedItems"); // remove them finally!
    }
  }

  // migrate favourites
  if (_.isUndefined(this.localStorage.favourites) === false) {
    migrateFavourites = parseJSONObject(this.localStorage.favourites);
    if (_.isUndefined(migrateFavourites.favourites) === false) {
      loadFavourites(migrateFavourites.favourites);
      this.localStorage.removeItem("favourites"); // remove them finally!
    }
  }
};



var cacheHandler = new CacheHandler();

module.exports = cacheHandler;
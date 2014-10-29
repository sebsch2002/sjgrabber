var Backbone = require("backbone");

var ConfigModel = Backbone.Model.extend({
  defaults: {
    fetchOnlyFavourites: true,
    requestTimeoutMS: 7000,
    maxLinkRefetchRetrys: 5,
    tracking: {
      allowed: true,
      userUUID: null
    },
    rss: {
      episodes: "http://serienjunkies.org/xml/feeds/episoden.xml",
      seasons: "http://serienjunkies.org/xml/feeds/staffeln.xml"
    },
    cache: {
      enabled: true,
      localStorageTargets: {
        debug: {
          favourites: "DEBUG_favourites",
          items: "DEBUG_items",
          config: "DEBUG_config"
        },
        productive: {
          favourites: "PRODUCTIVE_favourites",
          items: "PRODUCTIVE_items",
          config: "PRODUCTIVE_config"
        }
      }
    },
    support: {
      stdoutCursorTo: false
    },
    rescheduleMS: 1800000,
    format: {
      clock: "HH:mm:ss",
      date: "DD.MM.YYYY"
    },
    agreedToLicenseAndUsageTerms: false,
    window: { // remember previous window coordinates and apply (null===neverset)
      x: null,
      y: null,
      width: null,
      height: null
    },
    globalFilter: {
      allow: "all", // all, include, exclude
      includeKeywords: [],
      excludeKeywords: []
    }
  }
});

var config = new ConfigModel();

module.exports = config;
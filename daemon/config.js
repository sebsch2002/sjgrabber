var Backbone = require("backbone");

var ConfigModel = Backbone.Model.extend({
  defaults: {
    fetchOnlyFavourites: true,
    requestTimeoutMS: 7000,
    maxLinkRefetchRetrys: 1337,
    rssUrl: "http://serienjunkies.org/xml/feeds/episoden.xml",
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
    agreedToLicenseAndUsageTerms: false
  }
});

var config = new ConfigModel();

module.exports = config;
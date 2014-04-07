module.exports = {
  fetchOnlyFavourites: true,
  requestTimeoutMS: 7000,
  maxLinkRefetchRetrys: 1337,
  rssUrl: "http://serienjunkies.org/xml/feeds/episoden.xml",
  cache: {
    enabled: true,
    localStorageTargets: {
      debug: {
        favourites: "DEBUG_favourites",
        items: "DEBUG_items"
      },
      productive: {
        favourites: "PRODUCTIVE_favourites",
        items: "PRODUCTIVE_items"
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
  publicCoin: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  mail: "xxxxxxx.xxxxxx@xxxxxx.com"
};
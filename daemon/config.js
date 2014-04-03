module.exports = {
  favourites: ["american dad", "family guy", "futurama", "cards",
    "my name is earl", "mentalist", "south park", "two and a half men",
    "walking dead", "met your mother", "simpsons"
  ],
  fetchOnlyFavourites: true,
  requestTimeoutMS: 7000,
  maxLinkRefetchRetrys: 3,
  rssUrl: "http://serienjunkies.org/xml/feeds/episoden.xml",
  cache: {
    enabled: true,
    preferLocalStorage: true,
    fileStorage: {
      dir: "cache/",
      filename: "savedItems.json"
    }
  },
  support: {
    stdoutCursorTo: false
  },
  rescheduleMS: 1800000
};
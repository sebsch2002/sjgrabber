module.exports = {
  favourites: ["american dad", "family guy", "futurama", "house of cards",
    "my name is earl", "mentalist", "south park", "two and a half men",
    "walking dead", "met your mother", "simpsons"
  ],
  fetchOnlyFavourites: true,
  requestTimeoutMS: 7000,
  maxLinkRefetchRetrys: 3,
  rssUrl: "http://serienjunkies.org/xml/feeds/episoden.xml",
  useCache: true,
  cacheViaLocalStorageOnly: true,
  cacheDir: "cache/",
  cacheFilename: "savedItems.json",
  rescheduleMS: 1800000,
  stdoutSupportsCursorTo: false
};
module.exports = {
  fetchOnlyFavourites: true,
  requestTimeoutMS: 7000,
  maxLinkRefetchRetrys: 3,
  rssUrl: "http://serienjunkies.org/xml/feeds/episoden.xml",
  cache: {
    enabled: true
  },
  support: {
    stdoutCursorTo: false
  },
  rescheduleMS: 1800000
};
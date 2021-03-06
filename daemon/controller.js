var moment = require("moment");
var _ = require("lodash");
var async = require("async");

var cacheHandler = require("./cacheHandler");
var linkParser = require("./linkParser");
var rssHandler = require("./rssHandler");
var config = require("./config");
var savedItems = require("./savedItems");
var favourites = require("./favourites");
var updateChecker = require("./updateChecker");
var tracker = require("./tracker");

// runtime variables managing state

var rescheduleTimer;
var cycleRunning = false;

// -----------------------------------------------------------------------------
// NODE GENERIC: controller handles whole system
// -----------------------------------------------------------------------------

// restricted to run only once.
var hookCycleListeners = _.once(function() {
  rssHandler.on("fetched", function() {
    cacheHandler.save();
    linkParser.getUploadedLinks();
  });
  linkParser.on("fetched", function() {
    cacheHandler.save();
    scheduleFetchCycle();
    cycleRunning = false;
  });

  rssHandler.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:hookCycleListeners got rssHandler error: " + err);
    tracker.error("controller:hookCycleListeners got rssHandler error: " + err);
    cycleRunning = false;
  });

  linkParser.on("error", function(err) {
    // stop cycle immediately?
    console.error("controller:hookCycleListeners got linkParser error: " + err);
    tracker.error("controller:hookCycleListeners got linkParser error: " + err);
    cycleRunning = false;
  });
});

// startup execute - create bindings to cacheHandler, but wait until NW responds
(function startup() {

  console.log("controller:startup");

  // check for debug flag and version update
  try {
    var pjson = require("../package.json");
    process.NWAPP_DEBUG = (_.isUndefined(pjson.NWAPP_DEBUG) === false) ? pjson.NWAPP_DEBUG : false;

  } catch (e) {
    process.NWAPP_DEBUG = false;
  }

  // start by loading old items into our cache
  cacheHandler.once("loaded", startCycle);

  cacheHandler.on("error", function(err) {
    // cacheHandler error? what to do?
    console.error("controller:startup got cacheHandler error: " + err);
    tracker.error("controller:startup got cacheHandler error: " + err);
  });

}());

// starts a cycle.
function startCycle() {
  if (config.get("agreedToLicenseAndUsageTerms") === true) {
    hookCycleListeners();
    cycleRunning = true;
    rssHandler.fetch({
      uri: config.get("rss").episodes
    });
  } else {
    NWAPP.displayLicenseAndUsageTerms();
  }
}

function scheduleFetchCycle() {
  rescheduleTimer = setTimeout(function() {
    startCycle();
  }, config.get("rescheduleMS"));
  console.log("controller:scheduleFetchCycle next cycle will execute at " +
    moment().add('milliseconds', config.get("rescheduleMS")).toDate());
}

function runFetchCycleNow() {
  if (cycleRunning === false) {
    console.log("controller:runFetchCycleNow (executing)");
    clearTimeout(rescheduleTimer);
    startCycle();
    printDynamicContentNW();
  } else {
    console.log("controller: runFetchCycleNow (not executing, already running)");
  }
}

// EXPORTED immediately run a new cycle now
module.exports.runFetchCycleNow = runFetchCycleNow;



// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: client startup callback and cycle event binding
// -----------------------------------------------------------------------------

var nextFetchTime = false;

var NWAPP;
module.exports.NWReady = function() {
  console.log("controller:NWReady");

  // we need the window object within here, hence check for it
  if (_.isUndefined(window) === true) {
    console.error("controller:NWReady undefined window object!");
    return;
  }

  // sets the link to the clientApp.
  NWAPP = window.NWAPP;

  // initial set on page load...
  NWAPP.hookStaticBindings();

  // if daemons cycle already running, tell client instantly
  if (cycleRunning === true) {
    NWAPP.startCycle();
  }

  // link the cacheHandler with NW provided localStorage object
  cacheHandler.linkLocalStorage(window.localStorage);

  // manage node-webkit listeners
  hookNWListeners();

  // print the dynamic output...
  printDynamicContentNW();

  // if updates already found, notify NWapp now!
  if (updateChecker.checked && _.isUndefined(updateChecker.updateObj) === false) {
    NWAPP.updateIsAvailable(updateChecker.updateObj);
  }

  // check for updates...
  checkUpdates();
};

// restricted to run only once.
var hookNWListeners = _.once(function() {

  rssHandler.on("start", cycleStartsNW);
  linkParser.on("fetched", cycleDoneNW);

  rssHandler.on("progress", cycleProgressNW);
  linkParser.on("progress", cycleProgressNW);
  linkParser.on("progress", cycleProgressNWUpdateUI);

  linkParser.on("error", cycleErrorNW);
  rssHandler.on("error", cycleErrorNW);
  cacheHandler.on("error", cycleErrorNW);

  cacheHandler.on("loaded", cacheHasLoadedSuccessfully);
  cacheHandler.load(); // start cacheing now that localStorage is available.
});


// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: config loaded from cache
// -----------------------------------------------------------------------------

function cacheHasLoadedSuccessfully() {
  // apply saved main window dimensions...
  applySavedMainWindowDimensions();

  // start tracker...
  tracker.init();
}


// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: check updates handling
// -----------------------------------------------------------------------------

// restricted to run only once.
var checkUpdates = _.once(function() {
  try {
    var pjson = require("../package.json");

    updateChecker.on("updateFound", function(updateObj) {
      // pass to NWAPP to display...
      //console.log("controller updateFound: " + updateObj);
      NWAPP.updateIsAvailable(updateObj);
    });

    updateChecker.checkForUpdates(pjson.version, pjson.NWAPP_CONST.updateURL);

  } catch (e) {
    console.log("error with checkUpdates");
  }
});

// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: cycle progress updates
// -----------------------------------------------------------------------------

function cycleStartsNW() {
  nextFetchTime = false;
  NWAPP.startCycle();
}

function cycleDoneNW() {
  var fetchedDate = moment();
  NWAPP.endCycle(fetchedDate.format(config.get("format").date) + " " + fetchedDate.format(config.get("format").clock));
  nextFetchTime = moment().add('milliseconds', config.get("rescheduleMS")).format(config.get("format").clock);
  printDynamicContentNW(true);
}

function cycleErrorNW(e, suppressDefault) {
  NWAPP.printErrorMessage({
    errorMessage: e.toString(),
    suppressDefault: suppressDefault
  });
  cycleDoneNW();
}

function cycleProgressNW(progressCount) {
  nextFetchTime = false;
  NWAPP.updateProgress(progressCount);
}

function cycleProgressNWUpdateUI(processCount) {
  printDynamicContentNW(true);
}

// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: main window dimensions
// -----------------------------------------------------------------------------

module.exports.NWsaveMainWindowDimensions = function(dimensions) {
  config.set("window", dimensions);
  if (cacheHandler.lastLoaded !== false) {
    cacheHandler.save(true);
  }
};

function applySavedMainWindowDimensions() {
  NWAPP.setInitialMainWindowDimension(config.get("window"));
}

// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: Available API interfaces
// -----------------------------------------------------------------------------

module.exports.NWapplicationCloses = function(boolagreed) {
  cacheHandler.once("saved", exitAppImmediately);
  cacheHandler.once("error", exitAppImmediately);
  cacheHandler.save();
};

function exitAppImmediately() {
  NWAPP.closeApplicationNow();
}

module.exports.NWsetTermsAgreed = function(boolagreed) {
  if (_.isBoolean(boolagreed) === true) {
    config.set("agreedToLicenseAndUsageTerms", boolagreed);
    cacheHandler.save();
    if (boolagreed === true && cycleRunning === false) {
      startCycle();
    }
  }
};

var searchString = "";
var keywordString = "";

// set search content
module.exports.NWupdateSearchString = function(str) {
  searchString = _.unescape(str).toLowerCase();
  printDynamicContentNW();
};

function NWupdateKeywordString(str) {
  keywordString = _.unescape(str).toLowerCase();
  printDynamicContentNW();
}

module.exports.NWupdateKeywordString = NWupdateKeywordString;

// add a keyword
module.exports.NWaddCurrentKeyword = function() {

  // only add it if it is new!
  if (_.isUndefined(favourites.findWhere({
    keyword: searchString
  })) === true) {
    favourites.add({
      keyword: searchString
    });
    cacheHandler.save();
  }

  // searchString to keyword string...
  NWupdateKeywordString(searchString);

  runFetchCycleNow();
};

// add a keyword
module.exports.NWremoveKeyword = function(keyword) {

  favourites.remove(favourites.findWhere({
    keyword: keyword
  }));

  // save because it was removed
  cacheHandler.save();

  // no keyword selected anymore if its the keywords thats removed!
  if (keywordString === keyword) {
    keywordString = "";
  }

  printDynamicContentNW();
};

module.exports.NWupdateFilter = function(filterMethod, includeKeywordsArr, excludeKeywordsArr) {
  var filterConfig = {
    allow: filterMethod,
    includeKeywords: includeKeywordsArr,
    excludeKeywords: excludeKeywordsArr
  };

  config.set("globalFilter", filterConfig);
  // save because config was updated.
  cacheHandler.save();

  printDynamicContentNW();
};

module.exports.NWmarkItemAsDownloaded = function(uuid, url) {
  var updateItem = savedItems.findWhere({
    uuid: uuid
  });

  if (_.isUndefined(updateItem) === false) {
    updateItem.set("userClickedFilehosterLink", true);
    updateItem.markUrlAsDownloaded(url);

    // save because it was updated
    cacheHandler.save();

    printDynamicContentNW(true);
  } else {
    // error item with uuid not found!
    console.error("controller.NWmarkItemAsDownloaded item with uuid " + uuid + " not found!");
    cycleErrorNW("controller.NWmarkItemAsDownloaded item with uuid " + uuid + " not found!", true);
  }
};

// settings, reset everything.
module.exports.clearCacheReset = function() {

  // keep tracking settings
  var oldTrackingInfo = _.clone(config.get("tracking"));
  cacheHandler.clear();

  // reset config model to its defaults!
  _.each(_.keys(config.defaults), function(key) {
    config.set(key, config.defaults[key]);
  });

  // set old tracking settings
  config.set("tracking", oldTrackingInfo);

  // only save config...
  cacheHandler.save(true);

  savedItems.reset();
  favourites.reset();

  searchString = "";
  keywordString = "";

  printDynamicContentNW();
  runFetchCycleNow();
};

// -----------------------------------------------------------------------------
// NODE-WEBKIT SPECIFIC: Printing to client UI
// -----------------------------------------------------------------------------

var printQueue = [];

function getNewPrintQueueIndex() {
  var position = printQueue.length;

  printQueue.push({
    abort: null
  });

  return position;
}

function checkPrintQueueAbort(index) {
  return printQueue[index].abort;
}

function abortAllPrintQueueOperations() {
  _.each(printQueue, function(queue) {
    queue.abort = true;
  });
}

// set clients dynamic content
function printDynamicContentNW(suppressLoading) {
  var allItems = [];
  var favouriteItems = [];
  var favouriteKeywords = [];
  var totalCount = 0;
  var queueIndex;

  var filterConfigObject = config.get("globalFilter");
  var activeFilter = filterConfigObject.allow;
  var activeFilterIncludeArr = filterConfigObject.includeKeywords;
  var activeFilterExcludeArr = filterConfigObject.excludeKeywords;

  var filteredExcludedCount = 0;
  var filteredIncludedCount = 0;
  var filteredTotalCount = 0;

  abortAllPrintQueueOperations();
  queueIndex = getNewPrintQueueIndex();

  async.series({
      printLoading: function(callback) {
        _.defer(function(callback) {
          if (!suppressLoading) {
            NWAPP.printLoading();
          }
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      computeFavourites: function(callback) {
        _.defer(function(callback) {
          favourites.each(function(fav) {
            var favCount = 0;
            if (activeFilter === "all") {
              savedItems.each(function(item) {
                if (item.stringMatchesTitle(fav.get("keyword"))) {
                  favCount += 1;
                  totalCount += 1; // TODO: fail should not count to total as the item could already be added to a previous favourite!
                }
              });
            } else {

              if (activeFilter === "include") {
                savedItems.each(function(item) {
                  if (item.isFiltered(activeFilterIncludeArr, false) === true) {
                    if (item.stringMatchesTitle(fav.get("keyword"))) {
                      favCount += 1;
                      totalCount += 1; // TODO: fail should not count to total as the item could already be added to a previous favourite!
                    }
                  }
                });
              }

              if (activeFilter === "exclude") {
                savedItems.each(function(item) {
                  if (item.isFiltered(activeFilterExcludeArr, true) === false) {
                    if (item.stringMatchesTitle(fav.get("keyword"))) {
                      favCount += 1;
                      totalCount += 1; // TODO: fail should not count to total as the item could already be added to a previous favourite!
                    }
                  }
                });
              }

              if (activeFilter === "both") {
                savedItems.each(function(item) {
                  // first exclude
                  if (item.isFiltered(activeFilterExcludeArr, true) === false) {
                    // then include
                    if (item.isFiltered(activeFilterIncludeArr, false) === true) {
                      if (item.stringMatchesTitle(fav.get("keyword"))) {
                        favCount += 1;
                        totalCount += 1; // TODO: fail should not count to total as the item could already be added to a previous favourite!
                      }
                    } 
                  } 
                });
              }

            }
            favouriteKeywords.push({
              keyword: fav.get("keyword"),
              count: favCount,
              selected: (keywordString === fav.get("keyword")) ? true : false
            });
          });
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      printFavouriteKeywords: function(callback) {
        _.defer(function(callback) {
          NWAPP.printFavouriteKeywords({
            favourites: favouriteKeywords,
            noFilter: (keywordString === "") ? true : false,
            totalCount: totalCount
          });
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      hookDynamicBindingsFIXKeywords: function(callback) {
        _.defer(function(callback) {
          NWAPP.hookDynamicBindings();
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      computeItems: function(callback) {
        _.defer(function(callback) {
          if (activeFilter === "all") {
            savedItems.each(function(item) {
              filteredTotalCount += 1;
              filteredIncludedCount += 1;
              if (item.stringMatchesTitle(searchString)) {
                allItems.push(item.getPrintable(searchString));
              }
              if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
                favouriteItems.push(item.getPrintable(keywordString));
              }
            });
          } else {
            if (activeFilter === "include") {
              savedItems.each(function(item) {
                filteredTotalCount += 1;
                if (item.isFiltered(activeFilterIncludeArr, false) === true) {
                  filteredIncludedCount += 1;
                  if (item.stringMatchesTitle(searchString)) {
                    allItems.push(item.getPrintable(searchString));
                  }
                  if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
                    favouriteItems.push(item.getPrintable(keywordString));
                  }
                } else {
                  // not allowed to include this item, its filtered by include!
                  filteredExcludedCount += 1;
                }
              });
            }

            if (activeFilter === "exclude") {
              savedItems.each(function(item) {
                filteredTotalCount += 1;
                if (item.isFiltered(activeFilterExcludeArr, true) === false) {
                  filteredIncludedCount += 1;
                  if (item.stringMatchesTitle(searchString)) {
                    allItems.push(item.getPrintable(searchString));
                  }
                  if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
                    favouriteItems.push(item.getPrintable(keywordString));
                  }
                } else {
                  // not allowed to include this item, its filtered by exclude! 
                  filteredExcludedCount += 1;
                }
              });
            }

            if (activeFilter === "both") {
              savedItems.each(function(item) {
                filteredTotalCount += 1;
                // first exclude
                if (item.isFiltered(activeFilterExcludeArr, true) === false) {
                  // then include
                  if (item.isFiltered(activeFilterIncludeArr, false) === true) {
                    filteredIncludedCount += 1;
                    if (item.stringMatchesTitle(searchString)) {
                      allItems.push(item.getPrintable(searchString));
                    }
                    if (item.isFavourite() === true && item.stringMatchesTitle(keywordString)) {
                      favouriteItems.push(item.getPrintable(keywordString));
                    }
                  } else {
                    // not allowed to include this item, its filtered by include! 
                    filteredExcludedCount += 1;
                  }
                } else {
                  // not allowed to include this item, its filtered by exclude! 
                  filteredExcludedCount += 1;
                }
              });
            }
          }

          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      printFavouriteItems: function(callback) {
        _.defer(function(callback) {
          NWAPP.printFavouriteItems({
            items: favouriteItems
          });
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      printAllItems: function(callback) {
        _.defer(function(callback) {
          NWAPP.printAllItems({
            items: allItems
          });
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      printSettings: function(callback) {
        _.defer(function(callback) {
          NWAPP.printSettings({
            nextFetchTime: nextFetchTime,
            interval: config.get("rescheduleMS") / 1000 / 60,
            fetchOnlyFavourites: config.get("fetchOnlyFavourites"),
            maxLinkRefetchRetrys: config.get("maxLinkRefetchRetrys"),
            requestTimeoutSec: config.get("requestTimeoutMS") / 1000,
            itemCount: filteredTotalCount,
            excludedCount: filteredExcludedCount,
            includedCount: filteredIncludedCount,
            filter: {
              all: filterConfigObject.allow === "all" ? true : false,
              include: filterConfigObject.allow === "include" ? true : false,
              exclude: filterConfigObject.allow === "exclude" ? true : false,
              both: filterConfigObject.allow === "both" ? true : false,
              includeKeywords: filterConfigObject.includeKeywords.join(" "),
              excludeKeywords: filterConfigObject.excludeKeywords.join(" ")
            }
          });
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      },
      hookDynamicBindings: function(callback) {
        _.defer(function(callback) {
          NWAPP.hookDynamicBindings();
          callback(checkPrintQueueAbort(queueIndex));
        }, callback);
      }
    },
    function(err, results) {
      if (err) {
        console.log("printDynamicContentNW:async.series queue aborted!");
      } else {
        console.log("printDynamicContentNW:async.series queue done.");
      }
    }
  );
}
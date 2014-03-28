var request = require('request');
var _ = require('lodash');
var $ = require('cheerio');
var zlib = require('zlib');
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var savedItems = require("./savedItems");
var cacheHandler = require("./cacheHandler");
var helper = require("./helper");
var config = require("./config");

// runtime...

var LinkParser = function() {
  this.uniqueLinks = [];
  this.currentLinkIndex = 0;
  this.countCurrentFetchedLinks = 0;
  this.countTotalLinksToFetch = 0;
};

util.inherits(LinkParser, EventEmitter);

LinkParser.prototype.getUploadedLinks = function() {

  this.emit("start");

  this.uniqueLinks = getUnionedLinksToFetch(config.fetchOnlyFavourites);
  this.currentLinkIndex = 0;

  this.countCurrentFetchedLinks = 0;
  this.countTotalLinksToFetch = getCountLinksMissing(config.fetchOnlyFavourites);

  console.log("linkParser:getUploadedLinks (in progress) |" +
    getCountLinksMissing(config.fetchOnlyFavourites) + " links - " +
    this.uniqueLinks.length + " sites|");

  if (getCountLinksMissing(config.fetchOnlyFavourites) === 0) {
    console.log("linkParser:getUploadedLinks done, nothing to fetch!");
    this.emit("fetched");
    return;
  }

  parseURLForULLinks();
};

LinkParser.prototype.nextULParse = function() {
  console.log(" done.");

  this.currentLinkIndex += 1;
  if (this.currentLinkIndex >= this.uniqueLinks.length) {
    // all done!
    this.currentLinkIndex = 0;
    console.log("linkParser:nextULParse done, " + getCountLinksMissing(config.fetchOnlyFavourites) + " ul items missing.");

    this.emit("fetched");
  } else {
    parseURLForULLinks();
  }
};



var linkParser = new LinkParser();
module.exports = linkParser;



//
// helpers - private functions
//


function getUnionedLinksToFetch(onlyFavourites) {
  if (onlyFavourites) {
    return _.union(_.map(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavouriteLinkMissing), "link"));
  } else {
    return _.union(_.map(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONLinkMissing), "link"));
  }
}

function getCountLinksMissing(onlyFavourites) {
  if (onlyFavourites) {
    return _.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavouriteLinkMissing).length;
  } else {
    return _.filter(savedItems.toJSON(), helper.checkSavedItemJSONLinkMissing).length;
  }
}

function parseURLForULLinks() {
  var link = linkParser.uniqueLinks[linkParser.currentLinkIndex];
  var toParseItems = _.where(savedItems.toJSON(), {
    'link': link,
    'uploadedLink': false
  }),
    linkRequest;

  process.stdout.write("fetching " + linkParser.uniqueLinks[linkParser.currentLinkIndex] + " | ");

  if (toParseItems.length > 0) {

    request({
      uri: link,
      timeout: config.requestTimeoutMS,
      encoding: null,
      headers: {
        'Accept-Encoding': 'gzip',
      },
    }, function(error, response, body) {

      //console.log(JSON.stringify(response.toJSON()));

      if (error) {
        console.error("ERROR parsing @" + link + " - " + error);
        linkParser.emit("error", error);
        linkParser.nextULParse();
        return;
      }

      if (response.statusCode !== 200) {
        console.error("ERROR parsing @" + link + " - bad status code " + response.statusCode);
        linkParser.emit("error", response.statusCode);
        linkParser.nextULParse();
        return;
      }

      //if (!error && response.statusCode == 200) {

      if (response.headers['content-encoding'] === "gzip") {
        //console.log("response is gzip, unpacking...");

        zlib.unzip(body, function(err, buffer) {

          if (err) {
            linkParser.emit("error", err);
          } else {
            //console.log(buffer.toString());
            parseHTML(buffer.toString(), toParseItems);
          }
        });

      } else {
        //console.log("response is not gzip, proceeding...");
        parseHTML(body, toParseItems);
      }



      // } else {
      //   console.error("ERROR parsing @" + link + " - " + error);
      //   linkParser.emit("error", error);
      //   linkParser.nextULParse();
      // }
    });

  } else {
    // do nothing, all links parsed. - next
    linkParser.nextULParse();
  }
}

function parseHTML(html, items) {
  var parsedHTML = $.load(html);

  var i = 0,
    len = items.length,
    item,
    returnValue = false;

  for (i; i < len; i += 1) {
    //console.log(items[i].title);
    returnValue = _.bind(parseItem, {
      item: items[i],
      currentSavedItem: savedItems.findWhere({
        uuid: items[i].uuid
      }),
      success: false,
      theHTML: parsedHTML,
      realItemName: items[i].title.substring(items[i].title.lastIndexOf("] ") + 2)
    })();

    if (returnValue === false) {
      // link of item could not be resolved, mark as tried.
      process.stdout.write("*");
      incrementRefetchCount(items[i].uuid);
    }

    linkParser.countCurrentFetchedLinks += 1;
    linkParser.emit("progress", (linkParser.countCurrentFetchedLinks / linkParser.countTotalLinksToFetch));
  }

  // check for links that werent resolved and set a flag for them - maximal resolve.

  linkParser.nextULParse(); // done fetching!
}

function incrementRefetchCount(uuid) {
  var item = savedItems.findWhere({
    uuid: uuid
  });

  var currentSet = item.get("uploadedLinkRefetchCount");

  item.set("uploadedLinkRefetchCount", currentSet + 1);
}

function parseItem() {

  var that = this;

  this.theHTML('p').find('strong').each(function(i, el) {

    if ($(this).text().indexOf(that.realItemName) !== -1) {

      $(this).parent().each(function(i, elem) {

        process.stdout.write(".");

        that.currentSavedItem.set("uploadedLink", $(this).html().substring($(this).html().lastIndexOf("<a href=\"") + 9,
          $(this).html().lastIndexOf("\" target=\"_blank\">")));

        that.success = true;

      });
    }

  });

  return that.success;
}
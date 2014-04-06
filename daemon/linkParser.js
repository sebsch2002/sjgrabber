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

function getDownloadLinks(onlyFavourites, originlink) {
  if (onlyFavourites) {
    return _.where(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavouriteLinkMissing), {
      'link': originlink,
      'filehosterLinksFetched': false
    });
  } else {
    return _.where(savedItems.toJSON(), {
      'link': originlink,
      'filehosterLinksFetched': false
    });
  }
}

function parseURLForULLinks() {
  var link = linkParser.uniqueLinks[linkParser.currentLinkIndex];
  var toParseItems = getDownloadLinks(config.fetchOnlyFavourites, link),
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

      if (error) {
        linkParser.emit("error", "ERROR parsing @" + link + " - " + error);
        linkParser.nextULParse();
        return;
      }

      if (response.statusCode !== 200) {
        linkParser.emit("error", "ERROR parsing @" + link + " - bad status code " + response.statusCode);
        linkParser.nextULParse();
        return;
      }

      // parse gzipped content or plain...
      if (response.headers['content-encoding'] === "gzip") {
        zlib.unzip(body, function(err, buffer) {
          if (err) {
            linkParser.emit("error", "gzip error: " + err);
          } else {
            parseHTML(buffer.toString(), toParseItems);
          }
        });
      } else {
        parseHTML(body, toParseItems);
      }
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
    //console.log("linkparser: " + linkParser.countCurrentFetchedLinks + "/" + linkParser.countTotalLinksToFetch);
    linkParser.emit("progress", 0.5 + ((linkParser.countCurrentFetchedLinks / linkParser.countTotalLinksToFetch) / 2));
  }

  // TODO: check for links that werent resolved and set a flag for them - maximal resolve.

  linkParser.nextULParse(); // done fetching!
}

function incrementRefetchCount(uuid) {
  var item = savedItems.findWhere({
    uuid: uuid
  });

  var currentSet = item.get("filehosterLinksRefetchCount");

  item.set("filehosterLinksRefetchCount", currentSet + 1);
}

function parseItem() {

  var that = this;

  this.theHTML('p').find('strong').each(function(i, el) {

    if ($(this).text().indexOf(that.realItemName) !== -1) {

      $(this).parent().each(function(i, elem) {

        // get links array
        //var filehosterLinks = that.currentSavedItem.get("filehosterLinks");

        that.currentSavedItem.addFilehosterItem("uploaded.com", $(this).html().substring($(this).html().lastIndexOf("<a href=\"") + 9,
          $(this).html().lastIndexOf("\" target=\"_blank\">")));

        that.currentSavedItem.addFilehosterItem("test", "test");

        // push item to array
        // filehosterLinks.push({
        //   provider: "uploaded.com",
        //   link: $(this).html().substring($(this).html().lastIndexOf("<a href=\"") + 9,
        //     $(this).html().lastIndexOf("\" target=\"_blank\">"))
        // });

        // set success and link array
        //that.currentSavedItem.set("filehosterLinks", filehosterLinks);
        that.currentSavedItem.set("filehosterLinksFetched", true);

        process.stdout.write(".");
        console.log(that.currentSavedItem.get("title") +  " push! " + that.currentSavedItem.get("filehosterLinks").length);
        that.success = true;

      });
    }

  });

  return that.success;
}
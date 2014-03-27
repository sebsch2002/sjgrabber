var request = require('request');
var _ = require('lodash');
var $ = require('cheerio');
var zlib = require('zlib');

var savedItems = require("./savedItems");
var cacheHandler = require("./cacheHandler");
var helper = require("./helper");
var config = require("./config");

// runtime...

var uniqueLinks = [];
var currentUILink = 0;

exports.getUploadedLinks = function() {

  var countToFetch = 0;

  uniqueLinks = getUnionedLinksToFetch(config.fetchOnlyFavourites);
  countToFetch = getCountLinksMissing(config.fetchOnlyFavourites);

  currentUILink = 0;

  console.log("linkParser:getUploadedLinks (attempting to resolve " + countToFetch + " ul links from " + uniqueLinks.length + " sites)");

  parseURLForULLinks();

};

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

function nextULParse() {

  console.log(" done.");

  currentUILink += 1;
  if (currentUILink >= uniqueLinks.length) {
    // all done!
    currentUILink = 0;
    console.log("linkParser:nextULParse done, " + getCountLinksMissing(config.fetchOnlyFavourites) + " ul items missing.");
    // emit event here!!!!!!!!!!!

  } else {
    parseURLForULLinks();
  }
}

function parseURLForULLinks() {
  var link = uniqueLinks[currentUILink];
  var toParseItems = _.where(savedItems.toJSON(), {
    'link': link,
    'uploadedLink': false
  }),
    linkRequest;

  process.stdout.write("fetching " + uniqueLinks[currentUILink] + " | ");

  var ulReq;

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

      if (!error && response.statusCode == 200) {

        if (response.headers['content-encoding'] === "gzip") {
          //console.log("response is gzip, unpacking...");

          zlib.unzip(body, function(err, buffer) {
            //console.log(buffer.toString());
            parseHTML(buffer.toString(), toParseItems);
          });

        } else {
          //console.log("response is not gzip, proceeding...");
          parseHTML(body, toParseItems);
        }



      } else {
        console.error("ERROR parsing @" + link + " - " + err);
        nextULParse();
      }
    });

  } else {
    // do nothing, all links parsed. - next
    nextULParse();
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
  }

  // check for links that werent resolved and set a flag for them - maximal resolve.

  nextULParse(); // done fetching!
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
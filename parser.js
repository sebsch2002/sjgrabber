var request = require('request');
var _ = require('lodash');
var $ = require('cheerio');

var savedItems = require("./savedItems");
var cacheHandler = require("./cacheHandler");
var helper = require("./helper");

// constants
//var TARGET_URL = 'http://serienjunkies.org/xml/feeds/episoden.xml';
var REREQUEST_TIMEOUT_MS = 300000; // default every 30min = 1800000 ms

//var FILENAME_STAGED = 'stagedItems.json';

var RELEVANT_TITLES = ["american.dad", "family.guy", "futurama", "house.of.cards",
  "my.name.is.earl", "mentalist", "south.park", "two.and.a.half.men", "walking.dead", "met.your.mother", "simpsons"
];

// function scheduleRerequest() {
//   //console.log("scheduling rerequest...");
//   setTimeout(function() {
//     makeRSSRequest();
//   }, REREQUEST_TIMEOUT_MS);
// }

// function checkRelevantSeries(itemToCheck) {
//   var i = 0,
//     len = RELEVANT_TITLES.length;
//   for (i; i < len; i += 1) {
//     if (itemToCheck.title.toLowerCase().indexOf(RELEVANT_TITLES[i].toLowerCase()) > -1) {
//       return true;
//     }
//   }

//   return false;
// }

// function checkRelevantSeriesBACKBONE(itemToCheck) {
//   var i = 0,
//     len = RELEVANT_TITLES.length;
//   for (i; i < len; i += 1) {
//     if (itemToCheck.get("title").toLowerCase().indexOf(RELEVANT_TITLES[i].toLowerCase()) > -1) {
//       return true;
//     }
//   }

//   return false;
// }

// function convertDate(inputFormat) {
//   function pad(s) {
//     return (s < 10) ? '0' + s : s;
//   }
//   var d = new Date(inputFormat);
//   return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.');
// }

// uploaded url parsing

//var gotULLinks = 0;
var uniqueLinks = [];
var currentUILink = 0;

var ONLY_FETCH_RELEVANT_SERIES_UL_LINKS = true;

exports.getUploadedLinks = function () {

  var countToFetch = 0;

  if (ONLY_FETCH_RELEVANT_SERIES_UL_LINKS === true) {
    uniqueLinks = _.union(_.map(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavourite), "link"));
    countToFetch = _.where(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavourite), {
      'uploadedLink': false
    }).length;
  } else {
    uniqueLinks = _.union(_.map(savedItems.toJSON(), "link"));
    countToFetch = _.where(savedItems.toJSON(), {
      'uploadedLink': false
    }).length;
  }



  currentUILink = 0;

  console.log("UL_PARSER: attempt to resolve " + countToFetch + " ul links from " + uniqueLinks.length + " sites !");

  parseURLForULLinks();

};

function nextULParse() {
  currentUILink += 1;
  if (currentUILink > uniqueLinks.length) {
    currentUILink = 0;


    if (ONLY_FETCH_RELEVANT_SERIES_UL_LINKS === true) {
      console.log("\nUL_PARSER: done, " + _.where(_.filter(savedItems.toJSON(), helper.checkSavedItemJSONIsFavourite), {
        'uploadedLink': false
      }).length + " ul items missing.");

    } else {
      console.log("\nUL_PARSER: done, " + _.where(savedItems.toJSON(), {
        'uploadedLink': false
      }).length + " ul items missing.");
    }


  } else {

    process.stdout.write("(" + currentUILink + "/" + uniqueLinks.length + ")");

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

  //console.log("to parse = " + toParseItems);

  var ulReq;

  if (toParseItems.length > 0) {

    request({
      uri: link,
      timeout: 7000
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        parseHTML(body, toParseItems);
      } else {
        console.error("ERROR parsing @" + link + " - " + err);
      }
      nextULParse();
    });

  } else {
    // do nothing, all links parsed. - next
    nextULParse();
  }
}



//var runned = false;

function parseHTML(html, items) {
  var parsedHTML = $.load(html);
  //console.log(html);

  var i = 0,
    len = items.length,
    item;

  //process.stdout.write("(" + len + "total)");

  for (i; i < len; i += 1) {
    //console.log(items[i].title);
    _.bind(parseItem, {
      item: items[i],
      theHTML: parsedHTML,
      realItemName: items[i].title.substring(items[i].title.lastIndexOf("] ") + 2)
    })();
  }
}

function parseItem() {

  //console.log(item);
  var that = this;

  this.theHTML('p').find('strong').each(function(i, el) {

    //console.log(i + " - " + that.realItemName);

    //var currentElement = $(this);

    if ($(this).text().indexOf(that.realItemName) !== -1) {

      $(this).parent().each(function(i, elem) {
        //if($(this).is("a") === true) {

        that.item.uploadedLink = $(this).html().substring($(this).html().lastIndexOf("<a href=\"") + 9,
          $(this).html().lastIndexOf("\" target=\"_blank\">"));

        //gotULLinks += 1;
        process.stdout.write(".");
        // console.log($(this).html().substring($(this).html().lastIndexOf("<a href=\"") + 9,
        //   $(this).html().lastIndexOf("\" target=\"_blank\">")));

        cacheHandler.save();
        return false;
        //}
      });

      //console.log("match @" + realItemName + " -- " + $(this).parent());

    } else {
      //console.log("not found @ " + $(this).text() + " from " + realItemName);
    }


  });


  //});
  //
}


// exports.printItemsListBackbone = function() {
//   var i = 0,
//     len = savedItems.length,
//     returnString = "";

//   //console.log("backbone has items count of " + len);

//   for (i; i < len; i += 1) {
//       if (helper.checkSavedItemIsFavourite(savedItems.at(i)) === true) {

//         returnString += "<a href='" + savedItems.at(i).get("uploadedLink") + "'>" + savedItems.at(i).get("title") +
//           "</a> -- " + convertDate(savedItems.at(i).get("date")) + " <br />";
//       }
//     //}

//   }

//   return returnString;
// };

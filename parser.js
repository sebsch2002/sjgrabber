// requires
var FeedParser = require('feedparser');
var request = require('request');
var crypto = require("crypto");
var _ = require('lodash');
var fs = require('fs');
var $ = require('cheerio');
var moment = require("moment");

var savedItems = require("./savedItems");

// constants
var TARGET_URL = 'http://serienjunkies.org/xml/feeds/episoden.xml',
  REREQUEST_TIMEOUT_MS = 300000; // default every 30min = 1800000 ms

var FILENAME_STAGED = 'stagedItems.json';

var RELEVANT_TITLES = ["american.dad", "family.guy", "futurama", "house.of.cards",
  "my.name.is.earl", "mentalist", "south.park", "two.and.a.half.men", "walking.dead", "met.your.mother", "simpsons"
];

// db
var stagedItems = [];

// request/response runtime vars
var req,
  feedparser;

// server logging vars for each request (skeleton)
var reqLog = {
  startDate: null,
  endDate: null,
  newItems: 0,
  dismissedItems: 0,
  success: false
};


function makeRSSRequest() {
  //console.log("making request!");

  // reset log count
  reqLog.startDate = new Date();
  reqLog.newItems = 0;
  reqLog.dismissedItems = 0;
  reqLog.success = false;

  // generate new request vars

  req = request(TARGET_URL);
  feedparser = new FeedParser({
    normalize: true,
    addmeta: true,
    resume_saxerror: true
  });

  // set event handlers for req

  req.on('error', function(error) {
    // handle any request errors 
  });

  req.on('response', function(res) {
    var stream = this;

    if (res.statusCode != 200) {
      console.log("ERROR status 200");

      // reschedule anyway before returning...
      scheduleRerequest();

      return this.emit('error', new Error('Bad status code'));
    }

    stream.pipe(feedparser);
  });

  req.on('end', function(res) {
    // log to server...
    reqLog.endDate = new Date();
    reqLog.success = true;
    logRequestParseSummary();

    writeStaged(stagedItems);
    getUploadedLinks();
    // schedule rerequest after successful requests...
    scheduleRerequest();
  });

  // set event handler for feedparser

  feedparser.on('error', function(error) {
    // always handle errors
    console.log("ERROR feedparser error");
  });

  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this,
      meta = this.meta, // **NOTE** the "meta" is always available in the context of the feedparser instance
      item,
      newUuid;

    while ((item = stream.read()) !== null) {
      //console.log(item);
      newUuid = crypto.createHash("md5").update(JSON.stringify(item.title)).digest("hex");
      //console.log(item.title + " - " + newUuid);

      if (validateItemIsNew(newUuid) === -1) {
        // new item that needs to be pushed into the database!
        stagedItems.push({
          uuid: newUuid,
          title: item.title,
          link: item.link,
          date: item.date,
          uploadedLink: false
        });

        // add to backbone
        savedItems.add({
          uuid: newUuid,
          title: item.title,
          link: item.link,
          date: moment(item.date).toDate(),
          uploadedLink: false
        });

        reqLog.newItems += 1;
      } else {
        // old item, dismiss.
        reqLog.dismissedItems += 1;
      }

    }
  });
}

function validateItemIsNew(uuidToCheck) {
  return _.findIndex(stagedItems, function(stagedItem) {
    return stagedItem.uuid === uuidToCheck;
  });
}

function logRequestParseSummary() {
  console.log("REQUEST_PARSE_LOG - new: " + reqLog.newItems +
    " - dismissed: " + reqLog.dismissedItems + " - total: " +
    stagedItems.length + " - start: " + reqLog.startDate + " - end: " + reqLog.endDate);
}

function scheduleRerequest() {
  //console.log("scheduling rerequest...");
  setTimeout(function() {
    makeRSSRequest();
  }, REREQUEST_TIMEOUT_MS);
}

function checkRelevantSeries(itemToCheck) {
  var i = 0,
    len = RELEVANT_TITLES.length;
  for (i; i < len; i += 1) {
    if (itemToCheck.title.toLowerCase().indexOf(RELEVANT_TITLES[i].toLowerCase()) > -1) {
      return true;
    }
  }

  return false;
}

function checkRelevantSeriesBACKBONE(itemToCheck) {
  var i = 0,
    len = RELEVANT_TITLES.length;
  for (i; i < len; i += 1) {
    if (itemToCheck.get("title").toLowerCase().indexOf(RELEVANT_TITLES[i].toLowerCase()) > -1) {
      return true;
    }
  }

  return false;
}

function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.');
}



// PERSISTENCE



function writeStaged(items) {
  fs.writeFile(FILENAME_STAGED, JSON.stringify({
    staged: items
  }), function(err) {
    if (err) return console.log(err);
  });
}

function readStaged() {
  console.log("PERSISTENCE - reading --> stagedItems.json");

  fs.readFile(FILENAME_STAGED, 'utf8', function(err, data) {
    var savedObject = {};

    if (err) {
      console.log('PERSISTENCE - ERROR reading --> statedItems.json');
      makeRSSRequest();
      return;
    }
    savedObject = JSON.parse(data);
    stagedItems = savedObject.staged;

    // convinience meth for old model, convert string dates to real dates
    var i = 0,
      len = savedObject.staged.length;
    for (i; i < len; i += 1) {
      if (_.isString(savedObject.staged[i].date) === true) {
        //console.log("converting date...");
        savedObject.staged[i].date = moment(savedObject.staged[i].date).toDate();
      }
    }

    // insert into backbone collection
    savedItems.add(savedObject.staged);

    console.log("PERSISTENCE - restored --> stagedItems.json");
    makeRSSRequest();
  });
}


// uploaded url parsing

//var gotULLinks = 0;
var uniqueLinks = [];
var currentUILink = 0;

var ONLY_FETCH_RELEVANT_SERIES_UL_LINKS = true;

function getUploadedLinks() {

  var countToFetch = 0;

  if (ONLY_FETCH_RELEVANT_SERIES_UL_LINKS === true) {
    uniqueLinks = _.union(_.map(_.filter(stagedItems, checkRelevantSeries), "link"));
    countToFetch = _.where(_.filter(stagedItems, checkRelevantSeries), {
      'uploadedLink': false
    }).length;
  } else {
    uniqueLinks = _.union(_.map(stagedItems, "link"));
    countToFetch = _.where(stagedItems, {
      'uploadedLink': false
    }).length;
  }



  currentUILink = 0;

  console.log("UL_PARSER: attempt to resolve " + countToFetch + " ul links from " + uniqueLinks.length + " sites !");

  parseURLForULLinks();

  // _.forEach(uniqueLinks, function(link) {



  // });
}

function nextULParse() {
  currentUILink += 1;
  if (currentUILink > uniqueLinks.length) {
    currentUILink = 0;


    if (ONLY_FETCH_RELEVANT_SERIES_UL_LINKS === true) {
      console.log("\nUL_PARSER: done, " + _.where(_.filter(stagedItems, checkRelevantSeries), {
        'uploadedLink': false
      }).length + " ul items missing.");

    } else {
      console.log("\nUL_PARSER: done, " + _.where(stagedItems, {
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
  var toParseItems = _.where(stagedItems, {
    'link': link,
    'uploadedLink': false
  }),
    linkRequest;

  //console.log("to parse = " + toParseItems);

  var ulReq;

  if (toParseItems.length > 0) {
    // set up request

    // ulReq = request({
    //   uri: link,
    //   timeout: 7000
    // });

    // ulReq.on('error', function(error) {
    //   // handle any request errors 
    //   console.log("ERROR " + error);
    // });

    // ulReq.on('response', function(res) {
    //   var stream = this;
    //   if (res.statusCode != 200) {
    //     console.log("ERROR status 200");
    //     return this.emit('error', new Error('Bad status code'));
    //   }
    //   parseHTML(res, toParseItems);
    //   nextULParse();
    // });

    // ulReq.on('end', function(res) {
    //   // log to server...

    // });

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

    // request({
    //   uri: link,
    //   timeout: 7000
    // }, function(err, resp, html) {
    //   if (err) {
    //     console.error("ERROR parsing @" + link + " - " + err);
    //   } else {
    //     //console.log("PARSING " + link);
    //     parseHTML(html, toParseItems);
    //   }
    //   nextULParse();
    // });

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

  // get all img tags and loop over them
  // var imageURLs = []
  // parsedHTML('a').map(function(i, link) {
  //   var href = $(link).attr('href')
  //   if (!href.match('.png')) return
  //   imageURLs.push(domain + href)
  // })
}

function parseItem() {
  //_.forEach(items, function(item) {
  // concat English / German

  //var item = this.item;
  //var realItemName = item.title.substring(item.title.lastIndexOf("] ") + 2);
  //console.log(realItemName);
  //console.log(realItemName + " -- " + item.link);


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

        writeStaged(stagedItems);
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


// EXPORTS


// exports.printItemsList = function() {
//   var i = 0,
//     len = stagedItems.length,
//     returnString = "";
//   for (i; i < len; i += 1) {
//     if (checkRelevantSeries(stagedItems[i]) === true) {

//       returnString += "<a href='" + stagedItems[i].uploadedLink + "'>" + stagedItems[i].title +
//         "</a> -- " + convertDate(stagedItems[i].date) + " <br />";
//     }
//   }

//   return returnString;
// };

exports.printItemsListBackbone = function() {
  var i = 0,
    len = savedItems.length,
    returnString = "";

  //console.log("backbone has items count of " + len);

  for (i; i < len; i += 1) {
    //if (_.isUndefined(savedItems.at(i)) === false) {
      //console.log(savedItems.at(i));
      if (checkRelevantSeriesBACKBONE(savedItems.at(i)) === true) {

        returnString += "<a href='" + savedItems.at(i).get("uploadedLink") + "'>" + savedItems.at(i).get("title") +
          "</a> -- " + convertDate(savedItems.at(i).get("date")) + " <br />";
      }
    //}

  }

  return returnString;
};


// EXECUTE



readStaged();
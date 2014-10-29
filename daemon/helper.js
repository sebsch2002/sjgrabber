var _ = require("lodash");
var config = require("./config");

var favourites = require("./favourites.js");

function checkTitleIsFavourite(title) {
  var i = 0,
    len = favourites.length;

  for (i; i < len; i += 1) {
    if (titleKeywordComparator(title, favourites.at(i).get("keyword")) === true) {
      return true;
    }
  }
  return false;
}

function titleKeywordComparator(title, keyword) {
  var titleDotsReplaced = replaceAll(".", " ", title).toLowerCase();
  var keywordArr = keyword.toLowerCase().split(" ");

  var i = 0,
    len = keywordArr.length;
  for (i; i < len; i += 1) {
    if (titleDotsReplaced.indexOf(keywordArr[i]) === -1) {
      return false;
    }
  }

  return true;
}

function titleWithinFilterOnce(title, filter) {
  var titleDotsReplaced = replaceAll(".", " ", title).toLowerCase();

  var i = 0,
    len = filter.length;
  for (i; i < len; i += 1) {
    if (titleDotsReplaced.indexOf(filter[i]) !== -1) {
      return true;
    }
  }

  return false;
}

function titleWithinFilterAll(title, filter) {
  var titleDotsReplaced = replaceAll(".", " ", title).toLowerCase();

  var i = 0,
    len = filter.length;
  for (i; i < len; i += 1) {
    if (titleDotsReplaced.indexOf(filter[i]) === -1) {
      return false;
    }
  }

  return true;
}

function getHighlightedTitle(title, keyword) {

  var HIGHLIGHT_BEFORE = "<span class='highlight_keyword'>";
  var HIGHLIGHT_AFTER = "</span>";

  var titleArr = replaceAll(".", " ", title).split(" ");
  var runnTitleArr = [];

  // make datastructure
  _.each(titleArr, function(titlePart) {
    runnTitleArr.push({
      orgTitle: titlePart,
      lowerTitle: titlePart.toLowerCase(),
      formattedTitle: titlePart
    });
  });

  var keywordArr = keyword.toLowerCase().split(" ");

  // parse per title per keyword
  _.each(runnTitleArr, function(titlePart) {
    _.each(keywordArr, function(keywordPart) {
      var start = 0;
      var end;
      var beforePart = "";
      var matchedPart = "";
      var afterPart = "";
      if (titlePart.lowerTitle.indexOf(keywordPart) !== -1) {

        start = titlePart.lowerTitle.indexOf(keywordPart);
        end = start + keywordPart.length;

        // found a match.
        beforePart = titlePart.orgTitle.substring(0, start);
        matchedPart = titlePart.orgTitle.substring(start, end);
        afterPart = titlePart.orgTitle.substring(end, titlePart.orgTitle.length);

        titlePart.formattedTitle = beforePart + HIGHLIGHT_BEFORE + matchedPart + HIGHLIGHT_AFTER + afterPart;
      }
    });
  });

  // setup output
  var outputTitleArr = [];
  _.each(runnTitleArr, function(titlePart) {
    outputTitleArr.push(titlePart.formattedTitle);
  });

  // return output
  return outputTitleArr.join(" ");
}

function checkSavedItemIsFavourite(savedItem) {
  return checkTitleIsFavourite(savedItem.get("title"));
}

function checkSavedItemJSONIsFavourite(JSONitem) {
  return checkTitleIsFavourite(JSONitem.title);
}

function checkSavedItemJSONIsFavouriteLinkMissing(JSONitem) {
  if (checkSavedItemJSONMaxLinkRefetchAllowed(JSONitem) &&
    checkSavedItemJSONLinkMissing(JSONitem) &&
    checkTitleIsFavourite(JSONitem.title)) {
    return true;
  }
  return false;
}

function checkSavedItemJSONLinkMissing(JSONitem) {
  return checkSavedItemJSONMaxLinkRefetchAllowed(JSONitem) && JSONitem.filehosterLinksFetched === false;
}

function checkSavedItemJSONMaxLinkRefetchAllowed(JSONitem) {
  return JSONitem.filehosterLinksRefetchCount < config.get("maxLinkRefetchRetrys");
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

module.exports = {
  checkTitleIsFavourite: checkTitleIsFavourite,
  checkSavedItemIsFavourite: checkSavedItemIsFavourite,
  checkSavedItemJSONIsFavourite: checkSavedItemJSONIsFavourite,
  checkSavedItemJSONIsFavouriteLinkMissing: checkSavedItemJSONIsFavouriteLinkMissing,
  checkSavedItemJSONLinkMissing: checkSavedItemJSONLinkMissing,
  replaceAll: replaceAll,
  titleKeywordComparator: titleKeywordComparator,
  getHighlightedTitle: getHighlightedTitle,
  titleWithinFilterOnce: titleWithinFilterOnce,
  titleWithinFilterAll: titleWithinFilterAll
};
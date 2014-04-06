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
  keywordArr = keyword.toLowerCase().split(" ");

  var i = 0,
    len = keywordArr.length;
  for (i; i < len; i += 1) {
    if (titleDotsReplaced.indexOf(keywordArr[i]) === -1) {
      return false;
    }
  }

  return true;
}

function checkSavedItemIsFavourite(savedItem) {
  return checkTitleIsFavourite(savedItem.get("title"));
}

function checkSavedItemJSONIsFavourite(JSONitem) {
  return checkTitleIsFavourite(JSONitem.title);
}

function checkSavedItemJSONIsFavouriteLinkMissing(JSONitem) {
  if (checkSavedItemJSONLinkMissing(JSONitem) && checkTitleIsFavourite(JSONitem.title)) {
    return true;
  }
  return false;
}

function checkSavedItemJSONLinkMissing(JSONitem) {
  return JSONitem.filehosterLinksFetched === false;
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
  titleKeywordComparator: titleKeywordComparator
};
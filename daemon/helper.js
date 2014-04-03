var favourites = require("./favourites.js");

function checkTitleIsFavourite(title) {
  var i = 0,
    len = favourites.length;

  var titleDotsReplaced = replaceAll(".", " ", title);

  for (i; i < len; i += 1) {
    if (titleDotsReplaced.toLowerCase().indexOf(favourites.at(i).get("keyword").toLowerCase()) > -1) {
      return true;
    }
  }
  return false;
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
  return JSONitem.uploadedLink === false;
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
  replaceAll: replaceAll
};
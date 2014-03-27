var config = require("./config.js");

function checkTitleIsFavourite(title) {
  var i = 0,
    len = config.favourites.length;

  var titleDotsReplaced = title.replace(".", " ");

  for (i; i < len; i += 1) {
    if (titleDotsReplaced.toLowerCase().indexOf(config.favourites[i].toLowerCase()) > -1) {
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

module.exports = {
  checkTitleIsFavourite: checkTitleIsFavourite,
  checkSavedItemIsFavourite: checkSavedItemIsFavourite,
  checkSavedItemJSONIsFavourite: checkSavedItemJSONIsFavourite,
  checkSavedItemJSONIsFavouriteLinkMissing: checkSavedItemJSONIsFavouriteLinkMissing,
  checkSavedItemJSONLinkMissing: checkSavedItemJSONLinkMissing
};
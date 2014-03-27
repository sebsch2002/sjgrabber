var config = require("./config.js");

function checkTitleIsFavourite(title) {
  var i = 0,
    len = config.favourites.length;
  for (i; i < len; i += 1) {
    if (title.toLowerCase().indexOf(config.favourites[i].toLowerCase()) > -1) {
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

module.exports = {
  checkTitleIsFavourite: checkTitleIsFavourite,
  checkSavedItemIsFavourite: checkSavedItemIsFavourite,
  checkSavedItemJSONIsFavourite: checkSavedItemJSONIsFavourite
};
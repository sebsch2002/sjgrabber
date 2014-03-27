var savedItems = require("./savedItems");
var helper = require("./helper");


function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.');
}

module.exports.getPlainHTML = function() {
  console.log("output:getPlainHTML");
  var i = 0,
    len = savedItems.length,
    returnString = "";

  for (i; i < len; i += 1) {
    if (helper.checkSavedItemIsFavourite(savedItems.at(i)) === true) {

      returnString += "<a href='" + savedItems.at(i).get("uploadedLink") + "'>" + savedItems.at(i).get("title") +
        "</a> -- " + convertDate(savedItems.at(i).get("date")) + " <br />";
    }
  }

  return returnString;
};
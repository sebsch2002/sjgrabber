var savedItems = require("./savedItems");
var helper = require("./helper");
var _ = require("lodash");


function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.');
}

var templateWrapper = _.template('<table class="table table-hover table-condensed"><%= content %></table>');
var templateHead = _.template('<thead><td><%= date %></td><td><%= title %></td></thead>');
var templateBody = _.template('<tbody><%= content %></tbody>');
var templateItem = _.template('<tr><td><%= date %></td><td><a href="<%= link %>"><%= title %></a></td></tr>');

module.exports.getPlainHTML = function() {
  //console.log("output:getPlainHTML");
  var i = 0;
  var len = savedItems.length;

  var head = templateHead({
    date: "Date",
    title: "Release item (title)"
  });

  var body = "";

  for (i; i < len; i += 1) {
    if (helper.checkSavedItemIsFavourite(savedItems.at(i)) === true) {
      body += templateItem({
        date: convertDate(savedItems.at(i).get("date")),
        link: savedItems.at(i).get("uploadedLink"),
        title: savedItems.at(i).get("title")
      });
    }
  }

  body = templateBody({
    content: body
  });

  return templateWrapper({
    content: (head + body)
  });
};
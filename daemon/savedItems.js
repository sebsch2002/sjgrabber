var _ = require("lodash");
var Backbone = require("backbone");
var moment = require("moment");

var helper = require("./helper");
var config = require("./config");

// Define model
var SavedItemModel = Backbone.Model.extend({
  defaults: {
    uuid: "no uuid",
    title: "no title",
    link: "no link",
    date: null,
    filehosterLinks: [],
    filehosterLinksFetched: false,
    filehosterLinksRefetchCount: 0,
    userClickedFilehosterLink: false
  },
  isFavourite: function() {
    return helper.checkSavedItemIsFavourite(this);
  },
  getPrintable: function() {
    return {
      uuid: this.get("uuid"),
      title: helper.replaceAll(".", " ", this.get("title")),
      date: moment(this.get("date")).format(config.format.date),
      link: this.get("link"),
      filehosterLinks: this.get("filehosterLinks"),
      filehosterLinksFetched: this.get("filehosterLinksFetched"),
      userClickedFilehosterLink: this.get("userClickedFilehosterLink"),
      filehosterFetchPreviouslyFailed: (this.get("filehosterLinksRefetchCount") > 0) ? true : false
    };
  },
  getTitleWithoutTag: function() {
    return this.get("title").substring(this.get("title").lastIndexOf("] ") + 2);
  },
  stringMatchesTitle: function(str) {
    if (str.length === 0) {
      return true;
    } else {
      return helper.titleKeywordComparator(this.get("title"), str);
    }
  },
  addFilehosterItem: function(provider, dllink) {

    // adding to arrays in backbone model must be done via clone
    // else points to the same array within model!
    // http://stackoverflow.com/questions/11661380/does-backbone-models-this-get-copy-an-entire-array-or-point-to-the-same-array

    var newFilehosterLinks = _.clone(this.get("filehosterLinks"));

    newFilehosterLinks.push({
      provider: provider,
      link: dllink,
      uuid: this.get("uuid")
    });

    this.set("filehosterLinks", newFilehosterLinks);
  }
});

// Define collection
var SavedItemsCollection = Backbone.Collection.extend({
  model: SavedItemModel,
  comparator: function(savedItem) {
    return -(savedItem.get('date').getTime());
  }
});

// Initialize
var savedItems = new SavedItemsCollection();

// private Helper functions
function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.');
}

// Export
module.exports = savedItems;
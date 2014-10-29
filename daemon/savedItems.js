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
  getPrintable: function(highlightKeyword) {
    var title = helper.replaceAll(".", " ", this.get("title"));

    if (highlightKeyword === "") {
      title = helper.replaceAll(".", " ", this.get("title"));
    } else {
      title = helper.getHighlightedTitle(this.get("title"), highlightKeyword);
    }

    return {
      uuid: this.get("uuid"),
      title: title,
      tags: this.getTagObject(),
      date: moment(this.get("date")).format(config.get("format").date),
      link: this.get("link"),
      filehosterLinks: this.get("filehosterLinks"),
      filehosterLinksFetched: this.get("filehosterLinksFetched"),
      userClickedFilehosterLink: this.get("userClickedFilehosterLink"),
      filehosterFetchPreviouslyFailed: (this.get("filehosterLinksRefetchCount") > 0) ? true : false,
      filehosterLinksRefetchCount: this.get("filehosterLinksRefetchCount")
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
  isFiltered: function(filterKeywords, singleMatch) {
    if (singleMatch) {
      return helper.titleWithinFilterOnce(this.get("title"), filterKeywords);
    } else {
      return helper.titleWithinFilterAll(this.get("title"), filterKeywords);
    }
  },
  getTagObject: function() {
    var tags = {
      german: false,
      english: false,
      tv: false
    };

    if (this.get("title").indexOf("[DEUTSCH]") !== -1) {
      tags.german = true;
    }

    if (this.get("title").indexOf("[ENGLISCH]") !== -1) {
      tags.english = true;
    }

    if (this.get("title").indexOf("[TV-FILM]") !== -1) {
      tags.tv = true;
    }

    return tags;
  },
  addFilehosterItem: function(provider, dllink) {

    // adding to arrays within backbone models must be done via clone
    // else it points to the same array within model!
    // http://stackoverflow.com/questions/11661380/does-backbone-models-this-get-copy-an-entire-array-or-point-to-the-same-array

    var newFilehosterLinks = _.clone(this.get("filehosterLinks"));

    newFilehosterLinks.push({
      provider: provider,
      link: dllink,
      uuid: this.get("uuid")
    });

    this.set("filehosterLinks", newFilehosterLinks);
  },
  markUrlAsDownloaded: function(url) {

    var fhlinks = _.clone(this.get("filehosterLinks"));

    _.each(fhlinks, function(fhlink) {
      if (fhlink.link === url) {
        fhlink.downloaded = true;
      }
    });

    this.set("filehosterLinks", fhlinks);
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

// config listeners
// var currentFilter = config.get("globalFilter").allow;
// config.on("change:globalFilter", function(model, globalFilter) {
//   console.log("changed globalFiltering=" + globalFilter);
//   if (currentFilter === globalFilter.allow) {
//     // same filtering method as previous
//     if (currentFilter === "all") {
//       // do nothing, no filter but changed keywords, processing is unnesseccary
//     } else {
//       // keywords changed while filter stayed the same (and isn't all)
//     }
//   } else {
//     // filter method changed
//     if (globalFilter.allow === "all") {
//       // filter disabled - everything must get unhidden again
//     } else {
//       // filter changed (exclude or include?)
//     }
//   }
// });

// Export
module.exports = savedItems;
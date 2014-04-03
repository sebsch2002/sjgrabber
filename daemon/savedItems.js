var Backbone = require("backbone");
var helper = require("./helper");

// Define model
var SavedItemModel = Backbone.Model.extend({
  defaults: {
    uuid: "no uuid",
    title: "no title",
    link: "no link",
    date: null,
    uploadedLink: false,
    uploadedLinkRefetchCount: 0
  },
  isFavourite: function() {
    return helper.checkSavedItemIsFavourite(this);
  },
  getPrintable: function() {
    return {
      title: this.get("title"),
      date: convertDate(this.get("date")),
      link: this.get("uploadedLink")
    };
  },
  stringMatchesTitle: function(str) {
    if (str.length === 0) {
      return true;
    } else {
      if (helper.replaceAll(".", " ", this.get("title")).toLowerCase().indexOf(str.toLowerCase()) > -1) {
        return true;
      }
      return false;
    }
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

savedItems.on("add", function(model, collection, options) {
  //console.log("added model: " + model.get("title") + model.get("date"));
});


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
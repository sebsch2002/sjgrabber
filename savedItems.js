var Backbone = require("backbone");

// Define model
var SavedItemModel = Backbone.Model.extend({
  defaults: {
    uuid: "no uuid",
    title: "no title",
    link: "no link",
    date: null,
    uploadedLink: false,
    uploadedLinkRefetchCount: 0
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

// Export
module.exports = savedItems;
var Backbone = require("backbone");

// Define model
var FavouriteModel = Backbone.Model.extend({
  defaults: {
    keyword: "NO KEYWORD PROVIDED!"
  }
});

// Define collection
var FavouritesCollection = Backbone.Collection.extend({
  model: FavouriteModel
});

// Initialize
var favourites = new FavouritesCollection();


// Export
module.exports = favourites;
var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();

var NWAPP = window.NWAPP || {};

// 
// startup
// 

(function clientStartup() {
  // add compile app template into app and settings div
  document.getElementById("app").innerHTML = NWAPP.Templates.app({});
  document.getElementById("settings").innerHTML = NWAPP.Templates.settings({});
}());

// 
// listeners
// 

NWAPP.hookDynamicBindings = function() {
  //console.log("app:hookDynamicBindings");

  // a.href to clipboard bindings
  $("a").off();
  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, "text");
  });
};

NWAPP.hookStaticBindings = function() {
  //console.log("app:hookStaticBindings");

  // refetch.click button bindings
  $("#refetch_button").click(function() {
    process.mainModule.exports.runFetchCycleNow();
  });

  $("#clearreset_button").click(function() {
    process.mainModule.exports.clearCacheReset();
  });

  $("#addkeyword_button").click(function() {
    process.mainModule.exports.NWaddCurrentKeyword();
  });
  
  // search box to NWupdate
  $("#search_input").on("change keyup paste click", function() {
    process.mainModule.exports.NWupdateSearchString($(this).val());
  });
};

// 
// fetch cycle: update changes
// 

NWAPP.startCycle = function() {
  NProgress.start();
  NWAPP.toggleButtonsAvailableWithinFetchCycle(false);
};

NWAPP.endCycle = function() {
  NProgress.done();
  NWAPP.toggleButtonsAvailableWithinFetchCycle(true);
};

NWAPP.updateProgress = function(progressCount) {
  NProgress.set(progressCount);
};

NWAPP.toggleButtonsAvailableWithinFetchCycle = function(available) {
  if (available) {
    $(".appCycleDependent").button("reset");
  } else {
    $(".appCycleDependent").button("loading");
  }
};

//
// dynamic content: template helpers
//

NWAPP.printFavouriteKeywords = function(favourites) {
  document.getElementById("favourite_keywords").innerHTML = NWAPP.Templates.favourites(favourites);
};

NWAPP.printFavouriteItems = function(items) {
  document.getElementById("favourite_items").innerHTML = NWAPP.Templates.items(items);
};

NWAPP.printAllItems = function(items) {
  document.getElementById("all_items").innerHTML = NWAPP.Templates.items(items);
};

window.NWAPP = NWAPP;
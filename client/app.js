var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();

var NWAPP = window.NWAPP || {};

// 
// startup
// 

(function clientStartup() {
  // add compile app template into app and settings div
  document.getElementById("app").innerHTML = NWAPP.Templates.app({});
}());

// 
// listeners
// 

NWAPP.hookDynamicBindings = function() {
  //console.log("app:hookDynamicBindings");

  // a.href to clipboard bindings
  $(".items_link").off();
  $(".items_link").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, "text");
  });

  $(".keyword_link").off();
  $(".keyword_link").on("click", function(event) {
    event.preventDefault();
    process.mainModule.exports.NWupdateKeywordString(event.currentTarget.dataset.keyword);
  });

  // settings is dynamic for fetch time output!
  $("#clearreset_button").off();
  $("#clearreset_button").click(function() {
    process.mainModule.exports.clearCacheReset();
    $('#appNavigationTab a[href="#all_tab"]').tab('show');
  });
};

NWAPP.hookStaticBindings = function() {
  //console.log("app:hookStaticBindings");

  // refetch.click button bindings
  $("#refetch_button").click(function() {
    process.mainModule.exports.runFetchCycleNow();
  });

  $("#addkeyword_button").click(function() {
    process.mainModule.exports.NWaddCurrentKeyword();
    $('#appNavigationTab a[href="#favourites_tab"]').tab('show');
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

NWAPP.printSettings = function(config) {
  document.getElementById("settings").innerHTML = NWAPP.Templates.settings(config);
};

window.NWAPP = NWAPP;
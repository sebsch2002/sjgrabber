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

NWAPP.printFavourites = function(items) {
  document.getElementById("favourites").innerHTML = NWAPP.Templates.items(items);
};

NWAPP.printAll = function(items) {
  document.getElementById("all").innerHTML = NWAPP.Templates.items(items);
};

window.NWAPP = NWAPP;
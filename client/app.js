var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();

var NWAPP = window.NWAPP || {};

// 
// startup
// 

(function clientStartup () {
  // add compile app template into app div
  var appDiv = document.getElementById("app");
  appDiv.innerHTML = NWAPP.Templates.app({});
}());

// 
// listeners
// 

NWAPP.hookDynamicBindings = function() {
  console.log("app:hookDynamicBindings");

  // a.href to clipboard bindings
  $("a").off();
  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, "text");
  });
};

NWAPP.hookStaticBindings = function() {
  console.log("app:hookStaticBindings");

  // refetch.click button bindings
  $("#refetch_button").off();
  $("#refetch_button").click(function() {
    process.mainModule.exports.runFetchCycleNow();
  });
};

// 
// fetch cycle: update changes
// 

NWAPP.startCycle = function() {
  NProgress.start();
  NWAPP.toggleNWRefetchButtonAvailable(false);
};

NWAPP.endCycle = function() {
  NProgress.done();
  NWAPP.toggleNWRefetchButtonAvailable(true);
};

NWAPP.updateProgress = function(progressCount) {
  NProgress.set(progressCount);
};

NWAPP.toggleNWRefetchButtonAvailable = function(available) {
  if (available) {
    $("#refetch_button").button("reset");
  } else {
    $("#refetch_button").button("loading");
  }
};

//
// dynamic content: template helpers
//
 
NWAPP.printFavourites = function(items) {
  var favDiv = document.getElementById("favourites");
  favDiv.innerHTML = NWAPP.Templates.items(items);
};

NWAPP.printAll = function(items) {
  var favAll = document.getElementById("all");
  favAll.innerHTML = NWAPP.Templates.items(items);
};

window.NWAPP = NWAPP;
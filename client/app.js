var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();
var win = gui.Window.get();

var NWAPP = window.NWAPP || {};

// 
// startup
// 

(function clientStartup() {
  // add compile app template into app and settings div
  document.getElementById("app").innerHTML = NWAPP.Templates.app({
    name: gui.App.manifest.name,
    version: gui.App.manifest.version,
    platform: {
      win: (process.platform === "win32") ? true : false,
      mac: (process.platform === "darwin") ? true : false,
      linux: (process.platform !== "win32" && process.platform !== "darwin") ? true : false
    }
  });
}());

// 
// listeners
// 

win.on("close", function() {
  this.hide(); // Pretend to be closed already

  console.log("TODO: cache now, window is closing...");

  this.close(true);
});

NWAPP.hookDynamicBindings = function() {
  // console.log("app:hookDynamicBindings");

  // a.href to clipboard bindings
  $(".items_link").off();
  $(".items_link").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, "text");
  });

  $(".keyword_link").off();
  $(".keyword_link").on("click", function(event) {
    event.preventDefault();
    process.mainModule.exports.NWupdateKeywordString(trimWhiteSpace(event.currentTarget.dataset.keyword));
  });

  // settings is dynamic for fetch time output!
  $("#clearreset_button").off();
  $("#clearreset_button").click(function() {
    process.mainModule.exports.clearCacheReset();
    $('#appNavigationTab a[href="#all_tab"]').tab('show');
    clearSearchInputValue();
  });

  $(".removeKeyword").off();
  $(".removeKeyword").click(function(event) {
    event.preventDefault();
    process.mainModule.exports.NWremoveKeyword(event.target.parentElement.dataset.keyword);
  });
};

function clearSearchInputValue() {
  $("#search_input").val("");
}

NWAPP.hookStaticBindings = function() {
  // console.log("app:hookStaticBindings");

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
    checkSearchToggleAddButton($(this).val());
    process.mainModule.exports.NWupdateSearchString(trimWhiteSpace($(this).val()));
  });

  // for closing frameless windows
  $(".nav_exit").on("click", function() {
    win.close();
  });

  // for minimizing
  $(".nav_minimize").on("click", function() {
    win.minimize();
  });

  $(".nav_maximize").on("click", function() {
    win.maximize();
  });

  $(".dismissLinkAction").on("click", function() {
    event.preventDefault();
  });
};

function trimWhiteSpace(text) {
  return text.replace(/ {2,}/g, ' ').trim();
}

function checkSearchToggleAddButton(text) {
  if (text.replace(/\s+/g, '') !== "") {
    $("#addkeyword_button").removeClass("disabled");
  } else {
    $("#addkeyword_button").addClass("disabled");
  }
}

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
  NWAPP.toggleButtonsAvailableWithinFetchCycle(false);
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
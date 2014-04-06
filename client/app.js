var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();
var win = gui.Window.get();


// NAMESPACE NWAPP
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
    },
    debugmode: NWAPP_DEBUG
  });

  // are we running in debug mode?
  if (NWAPP_DEBUG === true) {
    win.showDevTools();
  }

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
    $('#appNavigationTab a[href="#favourites_tab"]').tab('show');
    clearSearchInputValue();
  });

  $(".removeKeyword").off();
  $(".removeKeyword").click(function(event) {
    event.preventDefault();
    process.mainModule.exports.NWremoveKeyword(event.target.parentElement.dataset.keyword);
  });

  setDynamicStyles();
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

  // for maximizing
  $(".nav_maximize").on("click", function() {
    win.maximize();
  });

  // certain links with this class shouldnt do their def. action
  $(".dismissLinkAction").on("click", function() {
    event.preventDefault();
  });

  // set dynamicstyles every time a different tab is selected
  $('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
    $(".tab-content").scrollTop(0); // scroll to the top everytime it hops
    setDynamicStyles();
  });

  $('#appNavigationTab a[href="#all_tab"]').on('shown.bs.tab', function(event) {
    $("#search_input").focus();
    $("#all_items").click(); // BUG HACK affix fix so it recalculates after init
  });
  $('#appNavigationTab a[href="#favourites_tab"]').on('shown.bs.tab', function(event) {
    $("#all_items").click(); // BUG HACK affix fix so it recalculates after init
  });

  // set dynamic styles on resize change
  $(window).resize(function() {
    setDynamicStyles();
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


// -----------------------------------------------------------------------------
// styling related stuff
// -----------------------------------------------------------------------------

function setDynamicStyles() {
  styleFavouritesAffixPadding();
  styleSearchboxAffixPadding();
}

// add padding based on affix
function styleFavouritesAffixPadding() {
  var height = $("#favourite_keywords").outerHeight() + 15;
  $("#favourite_items").css({
    'paddingTop': height + "px"
  });
  handleScrollbarPositionFixed("#favourite_keywords");
}

function styleSearchboxAffixPadding() {
  var height = $("#all_searchbox").outerHeight() + 15;
  $("#all_items").css({
    'paddingTop': height + "px"
  });
  handleScrollbarPositionFixed("#all_searchbox");
}

function handleScrollbarPositionFixed(divString) {

  var scrollBarWidth = getScrollBarWidth();
  var totalwidth = $("body").width() - scrollBarWidth;

  $(divString).css({
    right: scrollBarWidth + "px",
    width: totalwidth + "px"
  });
}

// get scrollbar width in every environment
// from http://stackoverflow.com/questions/986937/how-can-i-get-the-browsers-scrollbar-sizes
function getScrollBarWidth() {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return (w1 - w2);
}
var gui = require("nw.gui");
var clipboard = gui.Clipboard.get();
var win = gui.Window.get();


// NAMESPACE NWAPP
var NWAPP = window.NWAPP || {};


// fasted way to make loading available
var compiledLoadingTemplate = NWAPP.Templates.loading();

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

  // force all other components into loading mode...
  document.getElementById("all_items").innerHTML = compiledLoadingTemplate;
  document.getElementById("favourite_items").innerHTML = compiledLoadingTemplate;
  document.getElementById("favourite_keywords").innerHTML = compiledLoadingTemplate;
  document.getElementById("settings").innerHTML = compiledLoadingTemplate;

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

  $(".paginationItem").off();
  $(".paginationItem").on("click", function(event) {
    event.preventDefault();

    if ($(event.currentTarget.parentNode).hasClass("disabled") === false) {
      $(".tab-content").scrollTop(0); // scroll to the top everytime it hops
      updatePagination(event.currentTarget.parentNode.parentNode.dataset.tab, event.currentTarget.dataset.page);
    }
  });

  // button data.href to clipboard bindings
  $(".items_link").off();
  $(".items_link").on("click", function(event) {

    var dataset = event.currentTarget.dataset;

    // add to clipboard
    clipboard.set(dataset.href, "text");

    // notify daemon that it was clicked!
    process.mainModule.exports.NWmarkItemAsDownloaded(dataset.uuid, dataset.href);
  });

  $(".items_link_external").off();
  $(".items_link_external").on("click", function(event) {
    event.preventDefault();
    gui.Shell.openExternal(event.target.href);
  });

  $(".keyword_link").off();
  $(".keyword_link").on("click", function(event) {
    event.preventDefault();

    // show in ui that it will be selected...
    $(".keyword_link_li").removeClass("active"); // remove old active states
    $(event.target.parentElement).addClass("active"); // add new

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

  $(".alert").off();
  $('.alert').bind('closed.bs.alert', function() {
    clearErrorMessage();
  });

  // bug, never remove it previously!
  $(".defaultCursorNoDrag").on("mousedown", function(event) {
    return false;
  });

  // attach tooltips to copy link buttons
  $(".items_link").tooltip();

  setDynamicStyles();
};

function clearSearchInputValue() {
  $("#search_input").val("");
}

var currentSearchInput = "";

NWAPP.hookStaticBindings = function() {
  // console.log("app:hookStaticBindings");

  // certain links with this class shouldnt do their def. action
  $(".dismissLinkAction").off();
  $(".dismissLinkAction").on("click", function() {
    event.preventDefault();
  });

  // refetch.click button bindings
  $("#refetch_button").click(function() {
    process.mainModule.exports.runFetchCycleNow();
  });

  $("#addkeyword_button").click(function() {
    process.mainModule.exports.NWaddCurrentKeyword();
    $('#appNavigationTab a[href="#favourites_tab"]').tab('show');
  });

  // add keyword via ENTER
  $('#search_input').keypress(function(event) {
    if (event.which === 13) {
      if (checkSearchInputValid($(this).val())) {
        process.mainModule.exports.NWaddCurrentKeyword();
        $('#appNavigationTab a[href="#favourites_tab"]').tab('show');
        return false;
      }
    }
  });

  // search box to NWupdate
  $("#search_input").on("change keyup paste click", function() {
    checkSearchInputValid($(this).val());

    if (currentSearchInput !== $(this).val()) {
      currentSearchInput = $(this).val();
      process.mainModule.exports.NWupdateSearchString(trimWhiteSpace($(this).val()));
    }
  });

  // set dynamicstyles every time a different tab is selected
  $('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
    $(".tab-content").scrollTop(0); // scroll to the top everytime it hops
    setDynamicStyles();
  });

  $('#appNavigationTab a[href="#all_tab"]').on('shown.bs.tab', function(event) {
    $("#search_input").focus();
    // HACK HACK HACK
    $("#all_items").click(); // BUG HACK affix fix so it recalculates after init
  });
  $('#appNavigationTab a[href="#favourites_tab"]').on('shown.bs.tab', function(event) {
    // HACK HACK HACK
    $("#all_items").click(); // BUG HACK affix fix so it recalculates after init
  });

  // set dynamic styles on resize change

  var resizeTimer;
  $(window).resize(function(event) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeTimerFinished, 100);
    setDynamicStyles();
    $(".windowBorder").hide();
  });

  function resizeTimerFinished() {
    $(".windowBorder").show();
  }

  // NW for closing frameless windows
  $(".nav_exit").on("click", function() {
    win.close();
  });

  // NW for minimizing
  $(".nav_minimize").on("click", function() {
    win.minimize();
  });

  // NW for maximizing
  $(".nav_maximize").on("click", function() {
    win.maximize();
  });

  // NW for fullscreen
  $(".nav_fullscreen").on("click", function() {
    if (win.isFullscreen === false) {
      $('.nav_fullscreen').button("fullscreen");
      win.enterFullscreen();
    } else {
      $('.nav_fullscreen').button("windowed");
      win.leaveFullscreen();
    }
  });
};

function trimWhiteSpace(text) {
  return text.replace(/ {2,}/g, ' ').trim();
}

function checkSearchInputValid(text) {
  var concatWhiteSpace = text.replace(/\s+/g, '');

  if (concatWhiteSpace !== "" && concatWhiteSpace.length >= 3) {
    $("#addkeyword_button").removeClass("disabled");
    return true;
  } else {
    $("#addkeyword_button").addClass("disabled");
    return false;
  }
}

// 
// fetch cycle: update changes
// 

NWAPP.startCycle = function() {
  clearErrorMessage();
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


var buttonStateLoading = false; // save state manually
NWAPP.toggleButtonsAvailableWithinFetchCycle = function(available) {
  if (available) {
    buttonStateLoading = false;
    $(".appCycleDependent").button("reset");
  } else {
    if (buttonStateLoading === false) {
      buttonStateLoading = true;
      $(".appCycleDependent").button("loading");
    }
  }
};


//
// pagination handling
//

var PAGINATION_DEFAULTS = {
  page: 1,
  limit: 300
};

// hold currentPageInformation
var paginationStore = {
  all_items: {
    id: "all_items",
    page: PAGINATION_DEFAULTS.page,
    cachedItems: []
  },
  favourite_items: {
    id: "favourite_items",
    page: PAGINATION_DEFAULTS.page,
    cachedItems: []
  }
};

function updatePagination(key, page) {
  var paginationItem = paginationStore[key];
  paginationItem.page = page;

  compileItemsWithPagination({
    paginationItem: paginationItem,
    updateCache: false
  });
}

function compileItemsWithPagination(options) {

  var cachedItems = paginationStore[options.paginationItem.id].cachedItems;

  // update cache if specified
  if (options.updateCache === true && options.items) {

    // server side update, pagination must reset!
    paginationStore[options.paginationItem.id].page = 1;

    // load new items into clientside cache
    paginationStore[options.paginationItem.id].cachedItems = options.items;
    cachedItems = paginationStore[options.paginationItem.id].cachedItems;
  }

  // give identifier to handlebars template
  cachedItems.tab = options.paginationItem.id;

  // give pagination options to handlebars template
  cachedItems.pagination = {
    page: options.paginationItem.page,
    pageCount: Math.ceil(cachedItems.items.length / PAGINATION_DEFAULTS.limit)
  };

  // give slice the actual items to show
  cachedItems.itemsSliceOffset = (options.paginationItem.page - 1) * PAGINATION_DEFAULTS.limit;
  cachedItems.itemsSliceLimit = PAGINATION_DEFAULTS.limit;

  // printable items area count
  cachedItems.itemsCountFrom = (cachedItems.items.length > cachedItems.itemsSliceOffset) ? (cachedItems.itemsSliceOffset + 1) : 0;
  cachedItems.itemsCountTo = ((cachedItems.itemsCountFrom + PAGINATION_DEFAULTS.limit - 1) > cachedItems.items.length) ? cachedItems.items.length : (cachedItems.itemsCountFrom + PAGINATION_DEFAULTS.limit - 1);

  // update templ
  document.getElementById(options.paginationItem.id).innerHTML = NWAPP.Templates.items(cachedItems);

  // hook bindings if this was a client-side only operation
  if (options.updateCache === false) {
    NWAPP.hookDynamicBindings();
  }
}

//
// dynamic content: template helpers
//


NWAPP.printLoading = function() {
  var compiledLoadingTemplate = NWAPP.Templates.loading();
  document.getElementById("all_items").innerHTML = compiledLoadingTemplate;
  document.getElementById("favourite_items").innerHTML = compiledLoadingTemplate;
};

NWAPP.printAllItems = function(items) {
  compileItemsWithPagination({
    items: items,
    paginationItem: paginationStore.all_items,
    updateCache: true
  });
};

NWAPP.printFavouriteItems = function(items) {
  compileItemsWithPagination({
    items: items,
    paginationItem: paginationStore.favourite_items,
    updateCache: true
  });
};

NWAPP.printFavouriteKeywords = function(favourites) {
  document.getElementById("favourite_keywords").innerHTML = NWAPP.Templates.favourites(favourites);
};

NWAPP.printSettings = function(config) {
  document.getElementById("settings").innerHTML = NWAPP.Templates.settings(config);
};

NWAPP.printErrorMessage = function(error) {
  document.getElementById("errorContainer").innerHTML = NWAPP.Templates.errorbox(error);
};

function clearErrorMessage() {
  document.getElementById("errorContainer").innerHTML = "";
  setDynamicStyles();
}

window.NWAPP = NWAPP;


// -----------------------------------------------------------------------------
// styling related stuff
// -----------------------------------------------------------------------------

function setDynamicStyles() {
  styleFavouritesAffixPadding();
  styleSearchboxAffixPadding();
  setContentTopPosition();
}

function setContentTopPosition() {
  var topHeight = $("#navigationHolder").outerHeight() +
    $("#errorContainer").outerHeight();

  $(".errorbox-content").css({
    'top': $("#navigationHolder").outerHeight() + "px"
  });

  $(".tab-content").css({
    'top': topHeight + "px"
  });
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
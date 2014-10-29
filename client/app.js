(function() {

  // ---------------------------------------------------------------------------
  // node-webkit
  // ---------------------------------------------------------------------------

  var gui = require("nw.gui");
  var clipboard = gui.Clipboard.get();
  var win = gui.Window.get();

  // ---------------------------------------------------------------------------
  // namespace, const and runtime variables
  // ---------------------------------------------------------------------------

  // application NAMESPACE (open interface to controller.js (daemon))
  var NWAPP = window.NWAPP || {};

  // CONST count when to show warning on query add item fetch count
  var COUNT_MAX_LINKS_WO_WARNING = 50;

  // CONST pagination defaults
  var PAGINATION_DEFAULTS = {
    page: 1,
    limit: 250
  };

  // fasted way to make loading available
  var compiledLoadingTemplate = NWAPP.Templates.loading();

  // holds all ever launched popupWindowItems or a nullified item if already closed
  var popupWindows = [];

  // hold current input in search box
  var currentSearchInput = "";

  // holds current button cycle state
  var buttonStateLoading = false;

  // holds dynamic items and favourites and pagination information
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

  // tracking initialized?
  var gaTrackingInitialized = false;

  // ---------------------------------------------------------------------------
  // startup and main app painting
  // ---------------------------------------------------------------------------

  (function clientStartup() {

    // are we running in debug mode?
    if (gui.App.manifest.NWAPP_DEBUG === true) {
      NWAPP_DEBUG = true; // ATTENTION GLOBAL GETS SET!
      win.showDevTools();
    } else {
      if (typeof NWAPP_DEBUG === 'undefined') {
        NWAPP_DEBUG = false; // ATTENTION GLOBAL GETS SET!
      }
    }

    // paint Application (initial structure with loading icons)
    paintApplication();

  }());

  function paintApplication() {

    var windowTitle = gui.App.manifest.name + " v" + gui.App.manifest.version;

    if (NWAPP_DEBUG) {
      windowTitle += " (debug)";
    }

    win.title = windowTitle;

    // add compile app template into app and settings div
    document.getElementById("app").innerHTML = NWAPP.Templates.app({
      name: gui.App.manifest.name,
      version: gui.App.manifest.version,
      platform: {
        win: (process.platform === "win32") ? true : false,
        mac: (process.platform === "darwin") ? true : false,
        linux: (process.platform !== "win32" &&
          process.platform !== "darwin") ? true : false
      },
      debugmode: NWAPP_DEBUG
    });

    // force all other components into loading mode...
    document.getElementById("all_items").innerHTML = compiledLoadingTemplate;
    document.getElementById("favourite_items").innerHTML = compiledLoadingTemplate;
    document.getElementById("favourite_keywords").innerHTML = compiledLoadingTemplate;
    document.getElementById("settings").innerHTML = compiledLoadingTemplate;
    setDynamicStyles();
  }

  // ---------------------------------------------------------------------------
  // window NW listener
  // ---------------------------------------------------------------------------

  win.on("close", function() {
    this.hide(); // Pretend to be closed already
    console.log("window closes, informing daemon...");
    process.mainModule.exports.NWapplicationCloses();
  });

  NWAPP.closeApplicationNow = function() {
    console.log("closeApplicationNow - FORCE QUIT!");

    var i = 0,
      len = popupWindows.length;

    // close remaining open popups
    for (i; i < len; i += 1) {
      if (popupWindows[i] !== null) {
        popupWindows[i].close(true);
      }
    }

    win.close(true);
  };

  // ---------------------------------------------------------------------------
  // dynamic bindings (hooked after dynamic content was printed)
  // ---------------------------------------------------------------------------

  NWAPP.hookDynamicBindings = function() {

    // remove any prior shown tooltip that's still attached to the body
    $(".tooltip").hide();

    $(".paginationItem").off();
    $(".paginationItem").on("click", function(event) {
      event.preventDefault();

      if ($(event.currentTarget.parentNode).hasClass("disabled") === false &&
        $(event.currentTarget.parentNode).hasClass("active") === false) {

        if ($(event.currentTarget).hasClass("paginationItemBottom")) {
          $(".tab-content").animate({
            scrollTop: 0
          }, 500); // scroll smoothly
        } else {
          $(".tab-content").scrollTop(0); // scroll instantly
        }

        updatePagination(event.currentTarget.parentNode.parentNode.dataset.tab,
          event.currentTarget.dataset.page);
      }
    });

    // button data.href to clipboard bindings
    $(".items_link").off();
    $(".items_link").on("click", function(event) {

      var dataset = event.currentTarget.dataset;

      //console.log();

      $(this).html("<i class='fa fa-check'></i> " + $(this).text().trim());

      // add to clipboard
      clipboard.set(dataset.href, "text");

      // notify daemon that it was clicked!
      process.mainModule.exports.NWmarkItemAsDownloaded(dataset.uuid,
        dataset.href);


    });

    $(".openLinkInBrowser").off();
    $(".openLinkInBrowser").on("click", function(event) {
      console.log(event);
      event.preventDefault();
      gui.Shell.openExternal(event.currentTarget.href);


    });

    $(".popupLink").off();
    $(".popupLink").on("click", function(event) {
      console.log(event);
      event.preventDefault();
      popupLink(event.currentTarget.href);


    });

    $(".keyword_link").off();
    $(".keyword_link").on("click", function(event) {
      event.preventDefault();

      if ($(event.currentTarget.parentNode).hasClass("active") === false &&
        $(event.currentTarget).hasClass("removeKeyword") === false) {

        //console.log(event);

        // show in ui that it will be selected...
        $(".keyword_link_li").removeClass("active"); // remove old active states
        $(event.target.parentElement).addClass("active"); // add new

        process.mainModule.exports.NWupdateKeywordString(
          trimWhiteSpace(event.currentTarget.dataset.keyword));


      }
    });

    // settings is dynamic for fetch time output!
    $("#clearreset_button").off();
    $("#clearreset_button").click(function() {
      displayModalWarningResetApplication();
    });

    $(".removeKeyword").off();
    $(".removeKeyword").click(function(event) {
      event.preventDefault();
      displayModalWarningRemoveKeyword(event.target.parentElement.dataset.keyword);

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
    $(".items_link").tooltip({
      container: 'body'
    });

    $(".settings_filter_change_listener").off();
    $(".settings_filter_change_listener").on("change keyup", function() {

      // apply button becomes clickable.
      $("#settings_apply_filter_button").removeAttr("disabled");

      // enable filter keywords text input based on radio value
      if ($("#settings_filter_include_radio:checked").val() == "include") {
        $("#settings_filter_include_keywords").removeAttr("disabled");
        $("#settings_filter_exclude_keywords").prop("disabled", true);
      } else {
        if ($("#settings_filter_exclude_radio:checked").val() == "exclude") {
          $("#settings_filter_exclude_keywords").removeAttr("disabled");
          $("#settings_filter_include_keywords").prop("disabled", true);
        } else {
          $("#settings_filter_exclude_keywords").prop("disabled", true);
          $("#settings_filter_include_keywords").prop("disabled", true);
        }
      }
    });

    $("#settings_apply_filter_button").off();
    $("#settings_apply_filter_button").on("click", function() {
      // apply filter settings.
      console.log("apply filter settings...");

      var filterMethod = "all";
      var includeKeywordsSafe = trimWhiteSpace($("#settings_filter_include_keywords").val()).toLowerCase().trim();
      var excludeKeywordsSafe = trimWhiteSpace($("#settings_filter_exclude_keywords").val()).toLowerCase().trim();

      var includeKeywordsArr = [];
      var excludeKeywordsArr = [];

      if (includeKeywordsSafe !== "") {
        includeKeywordsArr = includeKeywordsSafe.split(" ");
      }

      if (excludeKeywordsSafe !== "") {
        excludeKeywordsArr = excludeKeywordsSafe.split(" ");
      }

      if ($("#settings_filter_include_radio:checked").val() == "include") {
        filterMethod = "include";
      }
      if ($("#settings_filter_exclude_radio:checked").val() == "exclude") {
        filterMethod = "exclude";
      }

      console.log("filter:" + filterMethod);
      console.log(includeKeywordsArr);
      console.log(excludeKeywordsArr);


      process.mainModule.exports.NWupdateFilter(filterMethod, includeKeywordsArr, excludeKeywordsArr);


    });

    setDynamicStyles();
  };

  function clearSearchInputValue() {
    $("#search_input").val("");
  }

  function resetApplication() {
    process.mainModule.exports.clearCacheReset();
    $('#appNavigationTab a[href="#favourites_tab"]').tab('show');
    clearSearchInputValue();
    $("#status_left").text("never grabbed");

    // disable keyword add button graphix
    $("#addkeyword_button").addClass("disabled");
    $("#addkeyword_button_star").removeClass("enableStarAnimation");
  }

  // ---------------------------------------------------------------------------
  // static bindings (non dynamic content)
  // ---------------------------------------------------------------------------

  NWAPP.hookStaticBindings = function() {

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
      addCurrentQueryAsKeyword();
    });

    // add keyword via ENTER
    $('#search_input').keypress(function(event) {
      if (event.which === 13) {
        if (checkSearchInputValid($(this).val())) {
          addCurrentQueryAsKeyword();
          return false;
        }
      }
    });

    // search box to NWupdate
    $("#search_input").on("change keyup paste click", function() {
      checkSearchInputValid($(this).val());

      if (currentSearchInput !== $(this).val()) {
        currentSearchInput = $(this).val();
        process.mainModule.exports.NWupdateSearchString(
          trimWhiteSpace($(this).val()));
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

    $('#appNavigationTab a[href="#settings_tab"]').on('shown.bs.tab', function(event) {

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

      // save window coordinates and position
      saveCurrentMainWindowDimensions();
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
      console.log("max");
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

    // NW for info/welcome text
    $(".nav_welcome").on("click", function() {
      NWAPP.displayLicenseAndUsageTerms();
    });


    // bind the addKeyword button to a tooltip
    $("#addkeyword_button").tooltip({
      container: 'body'
    });

    $(".updateAvailable").on("click", function() {
      displayModalHowToUpdate();
    });
  };

  // ---------------------------------------------------------------------------
  // window resizing (after init)
  // ---------------------------------------------------------------------------

  win.on("move", function() {
    saveCurrentMainWindowDimensions();
  });

  NWAPP.setInitialMainWindowDimension = function(dimensions) {
    if (dimensions.x !== null || dimensions.y !== null ||
      dimensions.width !== null || dimensions.height !== null) {

      // only apply dimension if visible within current screen (width)
      if ((dimensions.x + dimensions.width) > window.screen.width || (dimensions.x + dimensions.width) < 0) {
        console.log("setInitialMainWindowDimension: NO APPLY - Window outside width!");
        return;
      }

      // only apply dimension if visible within current screen (height)
      if ((dimensions.y + dimensions.height) > window.screen.height || (dimensions.y + dimensions.height) < 0) {
        console.log("setInitialMainWindowDimension: NO APPLY - Window outside height!");
        return;
      }

      win.moveTo(dimensions.x, dimensions.y);
      win.resizeTo(dimensions.width, dimensions.height);
      setDynamicStyles();

    }
  };

  function saveCurrentMainWindowDimensions() {
    process.mainModule.exports.NWsaveMainWindowDimensions({
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height
    });
  }

  // ---------------------------------------------------------------------------
  // keyword adding (from search)
  // ---------------------------------------------------------------------------

  function addCurrentQueryAsKeyword(overrideLengthCheck) {
    if (paginationStore.all_items.cachedItems.items.length < COUNT_MAX_LINKS_WO_WARNING || overrideLengthCheck) {

      process.mainModule.exports.NWaddCurrentKeyword();
      $('#appNavigationTab a[href="#favourites_tab"]').tab('show');



    } else {
      // display warning model with proceed, many links to fetch!
      displayModalWarningManyLinksToFetch();
    }
  }

  function trimWhiteSpace(text) {
    return text.replace(/ {2,}/g, ' ').trim();
  }

  function checkSearchInputValid(text) {
    var concatWhiteSpace = text.replace(/\s+/g, '');

    if (concatWhiteSpace !== "" && concatWhiteSpace.length >= 3) {
      $("#addkeyword_button").removeClass("disabled");
      $("#addkeyword_button_star").addClass("enableStarAnimation");
      return true;
    } else {
      $("#addkeyword_button").addClass("disabled");
      $("#addkeyword_button_star").removeClass("enableStarAnimation");
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // fetch cycle: update changes
  // ---------------------------------------------------------------------------

  NWAPP.startCycle = function() {
    clearErrorMessage();
    NProgress.start();
    NWAPP.toggleButtonsAvailableWithinFetchCycle(false);
    $("#status_left").html("<i class='fa fa-rss'></i> grabbing... (0%)");
  };

  NWAPP.endCycle = function(fetchedDateString) {
    NProgress.done();
    NWAPP.toggleButtonsAvailableWithinFetchCycle(true);
    $("#status_left").text("last grabbed " + fetchedDateString);
  };

  NWAPP.updateProgress = function(progressCount) {
    NProgress.set(progressCount);
    NWAPP.toggleButtonsAvailableWithinFetchCycle(false);
    if (progressCount < 0.5) {
      $("#status_left").html("<i class='fa fa-rss'></i> grabbing... (" + parseInt(progressCount * 100) + "%)");
    } else {
      $("#status_left").html("<i class='fa fa-link'></i> grabbing... (" + parseInt(progressCount * 100) + "%)");
    }
  };

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

  // ---------------------------------------------------------------------------
  // pagination helper 
  // ---------------------------------------------------------------------------

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

    // give pagination needed to handlebars template
    cachedItems.needsPagination = (cachedItems.items.length > PAGINATION_DEFAULTS.limit) ? true : false;

    // give slice the actual items to show
    cachedItems.itemsSliceOffset = (options.paginationItem.page - 1) *
      PAGINATION_DEFAULTS.limit;

    cachedItems.itemsSliceLimit = PAGINATION_DEFAULTS.limit;

    // printable items area count
    cachedItems.itemsCountFrom = (cachedItems.items.length > cachedItems.itemsSliceOffset) ?
      (cachedItems.itemsSliceOffset + 1) : 0;
    cachedItems.itemsCountTo = ((cachedItems.itemsCountFrom + PAGINATION_DEFAULTS.limit - 1) > cachedItems.items.length) ?
      cachedItems.items.length : (cachedItems.itemsCountFrom + PAGINATION_DEFAULTS.limit - 1);

    // update templ
    document.getElementById(options.paginationItem.id).innerHTML = NWAPP.Templates.items(cachedItems);

    // hook bindings if this was a client-side only operation
    if (options.updateCache === false) {
      NWAPP.hookDynamicBindings();
    }
  }


  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------

  NWAPP.updateIsAvailable = function(updateObj) {
    $("#updateAppLink").removeClass("hidden");

    $("#updateAppLink").append("<i class='fa fa-download'></i> v" +
      updateObj.version + " available");

    $("#updateAppLink").attr("href", updateObj.link);

    if (updateObj.changes !== "") {
      $("#updateAppLink").tooltip({
        container: "body",
        html: true,
        title: "cool update ahead!<br /><br />changes:<br />" + updateObj.changes
      });
    }

    $("#updateAppLink").on("click", function(event) {
      event.preventDefault();
      gui.Shell.openExternal(event.target.href);
    });
  };

  // ---------------------------------------------------------------------------
  // dynamic content: template helpers
  // ---------------------------------------------------------------------------

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
    // console.log(config);
    config.appName = gui.App.manifest.name;
    config.githubURL = gui.App.manifest.NWAPP_CONST.githubURL;
    config.homepageURL = gui.App.manifest.NWAPP_CONST.homepageURL;
    document.getElementById("settings").innerHTML = NWAPP.Templates.settings(config);
  };

  NWAPP.printErrorMessage = function(error) {
    document.getElementById("errorContainer").innerHTML = NWAPP.Templates.errorbox(error);
  };

  function clearErrorMessage() {
    document.getElementById("errorContainer").innerHTML = "";
    setDynamicStyles();
  }

  // ---------------------------------------------------------------------------
  // styling related stuff
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // modal related stuff
  // ---------------------------------------------------------------------------

  function configureModel(dismissable) {
    if (dismissable) {
      $('#currentModal').modal();
    } else {
      $('#currentModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }

    // and also set the dynamic bindings new!
    NWAPP.hookDynamicBindings();
  }

  function displayModalWarningRemoveKeyword(keyword) {
    document.getElementById("modalContainer").innerHTML = NWAPP.Templates.modal({
      title: "<i class='fa fa-exclamation-circle'></i> Remove starred query",
      content: NWAPP.Templates["modalContent/removeKeyword"]({
        keyword: keyword
      }),
      dismissText: "cancel",
      agreeText: "proceed",
      dismissable: true,
      large: false
    });

    configureModel(true);

    $("#modal_button_dismiss").on("click", function() {
      $('#currentModal').modal("hide");
    });

    $("#modal_button_agree").on("click", function() {
      $('#currentModal').modal("hide");
      process.mainModule.exports.NWremoveKeyword(keyword);
    });

    $('#currentModal').modal("show");

  }

  function displayModalWarningResetApplication() {
    document.getElementById("modalContainer").innerHTML = NWAPP.Templates.modal({
      title: "<i class='fa fa-exclamation-circle'></i> Erase data and reset",
      content: NWAPP.Templates["modalContent/resetApplication"]({
        appName: gui.App.manifest.name
      }),
      dismissText: "cancel",
      agreeText: "proceed",
      dismissable: true,
      large: false
    });

    configureModel(true);

    $("#modal_button_dismiss").on("click", function() {
      $('#currentModal').modal("hide");
    });

    $("#modal_button_agree").on("click", function() {
      $('#currentModal').modal("hide");
      resetApplication();
    });

    $('#currentModal').modal("show");

  }

  function displayModalWarningManyLinksToFetch() {

    document.getElementById("modalContainer").innerHTML = NWAPP.Templates.modal({
      title: "<i class='fa fa-exclamation-circle'></i> More than " +
        COUNT_MAX_LINKS_WO_WARNING + " releases to parse",
      content: NWAPP.Templates["modalContent/manyReleases"]({
        countReleases: paginationStore.all_items.cachedItems.items.length
      }),
      dismissText: "cancel",
      agreeText: "proceed",
      dismissable: true,
      large: false
    });

    configureModel(true);

    $("#modal_button_dismiss").on("click", function() {
      $('#currentModal').modal("hide");
    });

    $("#modal_button_agree").on("click", function() {
      $('#currentModal').modal("hide");
      addCurrentQueryAsKeyword(true);
    });

    $('#currentModal').modal("show");

  }

  function displayModalHowToUpdate() {

    document.getElementById("modalContainer").innerHTML = NWAPP.Templates.modal({
      title: "<i class='fa fa-download'></i> How to update?",
      content: NWAPP.Templates["modalContent/howToUpdate"]({
        appName: gui.App.manifest.name
      }),
      dismissText: "cancel",
      agreeText: "proceed",
      dismissable: true,
      noDecision: true,
      large: true
    });

    configureModel(true);

    $('#currentModal').modal("show");

  }

  NWAPP.displayLicenseAndUsageTerms = function() {

    document.getElementById("modalContainer").innerHTML = NWAPP.Templates.modal({
      title: "<i class='fa fa-info-circle'></i> Welcome to " + gui.App.manifest.name + " v" +
        gui.App.manifest.version + ((NWAPP_DEBUG === true) ? " (debug)" : ""),
      content: NWAPP.Templates["modalContent/firstStart"]({
        appName: gui.App.manifest.name,
        license: gui.App.manifest.license,
        licenseURL: gui.App.manifest.NWAPP_CONST.licenseURL,
        githubURL: gui.App.manifest.NWAPP_CONST.githubURL,
        homepageURL: gui.App.manifest.NWAPP_CONST.homepageURL,
        author: gui.App.manifest.author
      }),
      dismissText: "NO I DO NOT AGREE (quit)",
      agreeText: "YES I UNDERSTAND & AGREE (continue)",
      dismissable: false,
      large: true
    });

    configureModel(false);

    $("#modal_button_dismiss").on("click", function() {
      process.mainModule.exports.NWsetTermsAgreed(false);
      win.close();
    });

    $("#modal_button_agree").on("click", function() {
      process.mainModule.exports.NWsetTermsAgreed(true);
      $('#currentModal').modal("hide");
    });

    $('#currentModal').modal("show");

  };

  // ---------------------------------------------------------------------------
  // POPUP window
  // ---------------------------------------------------------------------------

  function popupLink(url) {

    var popupWindow = gui.Window.open(url, {
      "position": "mouse",
      "focus": true,
      "toolbar": false,
      "frame": true,
      "icon": gui.App.manifest.window.icon,
      "always-on-top": true,
      "title": gui.App.manifest.name + " browser",
      "width": 800,
      "height": 600,
      "inject-js-end": "client/support/inject.js"
    });

    popupWindow.POPUP_WINDOW_INDEX = popupWindows.length;
    popupWindows.push(popupWindow);

    popupWindow.on('closed', function() {
      popupWindows[this.POPUP_WINDOW_INDEX] = null;
      popupWindow = null;
    });

    popupWindow.on('new-win-policy', function(frame, url, policy) {
      console.log("popupWindow: new-win-policy catched!");
      policy.ignore();
    });
  }


  // ---------------------------------------------------------------------------
  // Tray icon test (not used currently)
  // ---------------------------------------------------------------------------

  // var tray;

  // function paintTray() {

  //   var menu = new gui.Menu();

  //   var hideMenuItem = new gui.MenuItem({
  //     type: 'normal',
  //     label: 'Hide',
  //     enabled: true,
  //     click: function() {
  //       showMenuItem.enabled = true;
  //       this.enabled = false;
  //       win.hide();
  //     }
  //   });

  //   var showMenuItem = new gui.MenuItem({
  //     type: 'normal',
  //     label: 'Show',
  //     enabled: false,
  //     click: function() {
  //       hideMenuItem.enabled = true;
  //       this.enabled = false;
  //       win.show();
  //     }
  //   });

  //   var refetchMenuItem = new gui.MenuItem({
  //     type: 'normal',
  //     label: 'Refetch',
  //     click: function() {
  //       process.mainModule.exports.runFetchCycleNow();
  //     }
  //   });

  //   var quitMenuItem = new gui.MenuItem({
  //     type: 'normal',
  //     label: 'Quit',
  //     click: function() {
  //       win.close();
  //     }
  //   });

  //   tray = new gui.Tray({
  //     icon: 'assets/SJ_logo_16x16x32.png'
  //   });

  //   menu.append(refetchMenuItem);
  //   menu.append(new gui.MenuItem({
  //     type: 'separator'
  //   }));
  //   menu.append(showMenuItem);
  //   menu.append(hideMenuItem);
  //   menu.append(new gui.MenuItem({
  //     type: 'separator'
  //   }));
  //   menu.append(quitMenuItem);

  //   tray.menu = menu;
  // }

  // ---------------------------------------------------------------------------
  // EXPORT to window
  // ---------------------------------------------------------------------------

  window.NWAPP = NWAPP;

  win.show();

}());
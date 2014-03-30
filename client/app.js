var gui = require('nw.gui');
var clipboard = gui.Clipboard.get();

var NWAPP = {};

NWAPP.hookDynamicBindings = function() {
  console.log("app:hookDynamicBindings");

  // a.href to clipboard bindings
  $("a").off();
  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, 'text');
  });
};

NWAPP.hookStaticBindings = function() {
  console.log("app:hookStaticBindings");

  // refetch.click button bindings
  $("#refetch_button").off();
  $('#refetch_button').click(function() {
    process.mainModule.exports.runFetchCycleNow();
  });
};

NWAPP.toggleNWRefetchButtonAvailable = function(available) {
  if (available) {
    $('#refetch_button').button('reset');
  } else {
    $('#refetch_button').button('loading');
  }
};

NWAPP.setDynamicContent = function(content) {
  var appContainer = document.getElementById('appContainer');
  appContainer.innerHTML = content;
};

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

window.NWAPP = NWAPP;
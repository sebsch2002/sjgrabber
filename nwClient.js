var gui = require('nw.gui');
var clipboard = gui.Clipboard.get();

window.setNWClipboardBinding = function() {
  console.log("setting clipboard bindings...");

  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, 'text');
  });
};

window.setNWButtonBinding = function() {
  $('#refetch_button').click(function () {
    process.mainModule.exports.runFetchCycleNow();
  });
};

window.toggleNWRefetchButtonAvailable = function (available) {
  if(available) {
    $('#refetch_button').button('reset');
  } else {
    $('#refetch_button').button('loading');
  }
};

NProgress.configure({ minimum: 0.001 });
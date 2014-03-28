var gui = require('nw.gui');
var clipboard = gui.Clipboard.get();

window.setNWClipboardBinding = function() {
  console.log("setting clipboard bindings...");

  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, 'text');
  });
};

NProgress.configure({ minimum: 0.001 });
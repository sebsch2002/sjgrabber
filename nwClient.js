var gui = require('nw.gui');
var clipboard = gui.Clipboard.get();
//clipboard.set('I love node-webkit :)', 'text');


window.setNWClipboardBinding = function() {
  console.log("setting clipboard bindings...");

  $("a").on("click", function(event) {
    event.preventDefault();
    clipboard.set(event.target.href, 'text');
  });
};
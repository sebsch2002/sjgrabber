var http = require('http');

var controller = require("./daemon/controller.js");
var output = require('./daemon/output.js');

http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(output.getPlainHTML());
}).listen(5315, '127.0.0.1');
console.log('server:running (at http://127.0.0.1:5315/)');
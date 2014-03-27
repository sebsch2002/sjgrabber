var http = require('http');
var parser = require('./parser.js');


http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(parser.printItemsListBackbone());
}).listen(5315, '127.0.0.1');
console.log('HTTP-SERVER - Server running at http://127.0.0.1:5315/');
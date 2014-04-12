var EventEmitter = require("events").EventEmitter;
var util = require("util");
var request = require('request');
var zlib = require('zlib');
var _ = require("lodash");

var config = require("./config");

var UpdateChecker = function() {
  this.checked = false;
  this.updateObj = undefined;
};

util.inherits(UpdateChecker, EventEmitter);

UpdateChecker.prototype.checkForUpdates = function(version) {
  request({
    uri: "https://dl.dropboxusercontent.com/u/2624630/SJgrabber/update-manifest.json",
    timeout: config.get("requestTimeoutMS"),
    encoding: null,
    headers: {
      'Accept-Encoding': 'gzip',
    },
  }, function(error, response, body) {

    if (error) {
      console.log("updateChecker error " + error);
      return;
    }

    if (response.statusCode !== 200) {
      console.log("updateChecker error" + " bad status code " + response.statusCode);
      return;
    }

    // parse gzipped content or plain...
    if (response.headers['content-encoding'] === "gzip") {
      zlib.unzip(body, function(err, buffer) {
        if (err) {
          console.log("updateChecker error" + " gzip error: " + err);
        } else {
          checkVersionUpToDate(JSON.parse(buffer.toString()), version);
        }
      });
    } else {
      checkVersionUpToDate(JSON.parse(body), version);
    }
  });
};

function checkVersionUpToDate(manifestObject, currentVersion) {
  console.log("version: " + manifestObject.version);

  if (manifestObject.version !== currentVersion) {
    if (_.isUndefined(manifestObject.platforms[process.platform]) === false) {
      //console.log("update for platform " + process.platform + " available! link=" +
      //  manifestObject.platforms[process.platform]);
  
      updateChecker.updateObj = {
        version: manifestObject.version,
        link: manifestObject.platforms[process.platform]
      };

      updateChecker.emit("updateFound", updateChecker.updateObj);

    } else {
      console.log("updates are available but not for your platform!");
    }
  } else {
    // no update available.
  }

  updateChecker.checked = true;
}

var updateChecker = new UpdateChecker();

module.exports = updateChecker;
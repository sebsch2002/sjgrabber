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

UpdateChecker.prototype.checkForUpdates = function(version, updateURL) {
  request({
    uri: updateURL,
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

  if (_.isUndefined(manifestObject.version) || _.isUndefined(manifestObject.platforms)) {
    updateChecker.checked = true;
    return;
  }

  if (isVersionNewer(currentVersion, manifestObject.version) === true) {
    console.log("updateChecker: UPDATE FOUND, currentVersion: " + currentVersion + " manifestVersion: " + manifestObject.version);
    if (_.isUndefined(manifestObject.platforms[process.platform]) === false) {

      // found update for specific platform

      updateChecker.updateObj = {
        version: manifestObject.version,
        link: manifestObject.platforms[process.platform],
        changes: _.isUndefined(manifestObject.changes) ? "" : manifestObject.changes
      };

      updateChecker.emit("updateFound", updateChecker.updateObj);
      console.log("updateChecker: emitting update for platform " + process.platform);
    } else {
      if (_.isUndefined(manifestObject.allReleases) === false) {

        // found update push link to generic release page

        updateChecker.updateObj = {
          version: manifestObject.version,
          link: manifestObject.allReleases,
          changes: _.isUndefined(manifestObject.changes) ? "" : manifestObject.changes
        };

        updateChecker.emit("updateFound", updateChecker.updateObj);
        console.log("updateChecker: emitting update to RELEASEPAGE (platform not found)");
      }
    }
  } else {
    console.log("updateChecker: NO UPDATE FOUND, currentVersion: " + currentVersion + " manifestVersion: " + manifestObject.version);
  }

  updateChecker.checked = true;
}

function isVersionNewer(appVersion, manifestVersion) {
  var appVersionArr = appVersion.split(".");
  var manifestVersionArr = manifestVersion.split(".");

  if (appVersionArr.length !== 3 || manifestVersionArr.length !== 3) {
    // version formats are inproper formed!
    return false;
  }

  var i = 0,
    len = manifestVersionArr.length;
  for (i; i < len; i += 1) {
    try {
      if (parseInt(appVersionArr[i]) < parseInt(manifestVersionArr[i])) {
        return true;
      }
      if (parseInt(appVersionArr[i]) > parseInt(manifestVersionArr[i])) {
        return false;
      }
    } catch (e) {
      // error while comparing version delimiters (not an int?), no update!
      return false;
    }
  }

  return false;

}

var updateChecker = new UpdateChecker();

module.exports = updateChecker;
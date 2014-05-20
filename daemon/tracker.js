var ua = require("universal-analytics");
var uuid = require('node-uuid');
var _ = require("lodash");

var cacheHandler = require("./cacheHandler");
var config = require("./config");
var favourites = require("./favourites");

var UA_TRACKING_ID = "UA-42608142-4";
var DEFAULT_PAGE = "global";

// tracking prefix to distinguish between tracked version of app
var trackingPrefix = "NO TRACKING PREFIX SUPPLIED";

var Tracker = function() {
  this.visitor = null;
  this.userUUID = null;
};

Tracker.prototype.init = function() {
  var trackingConfig = config.get("tracking");
  var newUser = false;

  this.userUUID = trackingConfig.userUUID;

  // already initialized?
  if (this.visitor === null && trackingConfig.allowed === true) {

    try {
      // console.log("Tracker: parsing package.json...");

      var pjson = require("../package.json");

      if (_.isUndefined(pjson.NWAPP_DEBUG) || pjson.NWAPP_DEBUG === false) {
        trackingPrefix = "v" + pjson.version;
      } else {
        trackingPrefix = "DEBUG v" + pjson.version;
      }

      // console.log("Tracker: got prefix = " + trackingPrefix);

    } catch (e) {
      console.log("Tracker: problem parsing package.json");
    }

    if (this.userUUID === null) {
      // generate a new uuid and save it.
      this.userUUID = uuid.v4();
      trackingConfig.userUUID = this.userUUID;
      config.set("tracking", trackingConfig);
      cacheHandler.save(true);
      newUser = true;
    }

    console.log("Tracker: userUUID=" + this.userUUID);
    this.visitor = ua(UA_TRACKING_ID, this.userUUID);

    // event to analytics...
    this.event({
      msg: (newUser === true) ? "new_user" : "returning_user",
      label: "platform=" + process.platform + " arch=" + process.arch,
      page: "init",
      value: favourites.length
    });

  } else {
    console.warn("Tracker already initialized!");
  }
};

Tracker.prototype.event = function(options) {

  // options: {
  //   msg: "", // mandatory String
  //   page: "", // optional String
  //   label: "", // optional String
  //   value: "", // optional Number
  // }

  if (_.isUndefined(options.msg) === true) {
    console.error("Tracker: event - no msg supplied, aborting...");
    return;
  }

  if (this.visitor !== null && config.get("tracking").allowed === true) {
    this.visitor.event({
      ec: trackingPrefix,
      ea: options.msg,
      el: (_.isUndefined(options.label) ? "" : options.label),
      ev: (_.isNumber(options.value) ? options.value : 0),
      dp: "/" + (_.isUndefined(options.page) ? DEFAULT_PAGE : options.page)
    }, function(err) {
      if (err) {
        console.error("Tracker: event - unable to send msg=" + options.msg + " error=" + err);
      }
    }).send();
  }
};

var tracker = new Tracker();
module.exports = tracker;
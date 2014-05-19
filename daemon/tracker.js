var ua = require("universal-analytics");
var uuid = require('node-uuid');
var _ = require("lodash");

var cacheHandler = require("./cacheHandler");
var config = require("./config");

var UA_TRACKING_ID = "UA-42608142-4";

// tracking prefixes for categories...
var trackingPrefix = "UNKNOWN APP";
var CATEGORY_NOTIFICATION = " notification";
var CATEGORY_ERROR = " error";

var Tracker = function() {
  this.visitor = null;
};

Tracker.prototype.init = function() {
  var userUUID = config.get("userUUID");
  var newUser = false;

  // already initialized?
  if (this.visitor === null) {

    try {
      console.log("Tracker: parsing package.json...");

      var pjson = require("../package.json");

      if (_.isUndefined(pjson.NWAPP_DEBUG) || pjson.NWAPP_DEBUG === false) {
        trackingPrefix = "v" + pjson.version;
      } else {
        trackingPrefix = "DEBUG v" + pjson.version;
      }

      console.log("Tracker: got prefix = " + trackingPrefix);

    } catch (e) {
      console.log("Tracker: problem parsing package.json");
    }

    if (userUUID === null) {
      // generate a new uuid and save it.
      userUUID = uuid.v4();
      config.set("userUUID", userUUID);
      cacheHandler.save(true);
      newUser = true;
    }

    console.log("Tracker: userUUID=" + userUUID);

    this.visitor = ua(UA_TRACKING_ID, userUUID);

    // this.visitor.event({
    //   ec: (trackingPrefix + CATEGORY_NOTIFICATION),
    //   ea: "new_user",
    //   el: "uuid",
    //   ev: userUUID, // attention, only really accepts values!!!!
    //   dp: "/init"
    // }).send();

    if (newUser === true) {
      this.visitor.event({
        ec: (trackingPrefix + CATEGORY_NOTIFICATION),
        ea: "new_user",
        dp: "/init"
      }).send();
    } else {
      this.visitor.event({
        ec: (trackingPrefix + CATEGORY_NOTIFICATION),
        ea: "returning_user",
        dp: "/init"
      }).send();
    }

  } else {
    console.error("Tracker already initialized!");
  }
};

var tracker = new Tracker();
module.exports = tracker;
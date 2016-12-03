// http://htmlpreview.github.io/?https://github.com/Logitech/slimserver/blob/public/7.7/HTML/EN/html/docs/cli-api.html#alarmNotify
// https://github.com/SphtKr/homebridge-filesensor/blob/master/index.js

var cron = require('node-cron');
var request = require("request");
var jar = request.jar();
request = request.defaults({
  jar : jar,
  followRedirect : false,
  timeout : 10000
});
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-mysqueezebox-alarmclocksensor",
      "MySqueezeboxAlarmClockSensor", MySqueezeboxAlarmClockSensorAccessory);
}

function MySqueezeboxAlarmClockSensorAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.email = config["email"];
  this.password = config["password"];
  this.playerid = config["playerid"];
  this.poll_cron = config["poll_cron"] || "*/5 4-10 * * *";
  this.window_minutes = config["window_minutes"] || 30;
  this.sensor_type = config["sensor_type"] || "c";

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Name, this.name).setCharacteristic(
      Characteristic.Manufacturer, "Logitech")
      .setCharacteristic(Characteristic.Model, "Squeezebox").setCharacteristic(
	  Characteristic.SerialNumber, "0.1");

  var changeAction;
  if (this.sensor_type === "c") {
    this.service = new Service.ContactSensor();
    this.service.getCharacteristic(Characteristic.ContactSensorState).setValue(
	Characteristic.ContactSensorState.CONTACT_DETECTED);
    changeAction = function(isOn) {
      if (isOn
	  && this.service.getCharacteristic(Characteristic.ContactSensorState).value == Characteristic.ContactSensorState.CONTACT_DETECTED) {
	this.service.getCharacteristic(Characteristic.ContactSensorState).setValue(
	    Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
	this.log.info("Sensor status set to ON");

      } else if (!isOn
	  && this.service.getCharacteristic(Characteristic.ContactSensorState).value == Characteristic.ContactSensorState.CONTACT_NOT_DETECTED) {
	this.service.getCharacteristic(Characteristic.ContactSensorState).setValue(
	    Characteristic.ContactSensorState.CONTACT_DETECTED);
	this.log.info("Sensor status set to OFF");
      }
    }.bind(this);
  } else {
    this.service = new Service.MotionSensor();
    this.service.getCharacteristic(Characteristic.MotionDetected).setValue(false);
    changeAction = function(isOn) {
      if (isOn && !this.service.getCharacteristic(Characteristic.MotionDetected).value) {
	this.service.getCharacteristic(Characteristic.MotionDetected).setValue(isOn);
	this.log.info("Sensor status set to ON");

      } else if (!isOn && this.service.getCharacteristic(Characteristic.MotionDetected).value) {
	this.service.getCharacteristic(Characteristic.MotionDetected).setValue(isOn);
	this.log.info("Sensor status set to OFF");
      }
    }.bind(this);
  }

  cron.schedule(this.poll_cron, function() {
    try {
      this.pollAlarms(changeAction);
    } catch (err) {
      this.log.error("Error while polling alarms", err);
    }
  }.bind(this));
}

MySqueezeboxAlarmClockSensorAccessory.prototype.pollAlarms = function(changeAction) {
  this.login(function(status) {
    if (status) {
      return;
    }

    this.command([ "playerpref", "alarmsEnabled", "?" ], function(status, response) {
      if (status) {
	return;
      }

      if (parseInt(response.body.result._p2)) {
	this.command([ "alarms", "" ], function(status, response) {
	  if (status) {
	    return;
	  }
	  var now = new Date();
	  var todayS = (now.getTime() - new Date().setHours(0, 0, 0, 0)) / 1000;
	  for ( var i in response.body.result.alarms_loop) {
	    var alarm = response.body.result.alarms_loop[i];
	    if (parseInt(alarm.enabled)) {
	      if (alarm.dow.split(",").includes(now.getDay().toString())) {
		if (alarm.time > todayS && ((alarm.time - todayS) <= (this.window_minutes * 60))) {
		  changeAction(true);
		  return;
		}
	      }
	    }
	  }
	  changeAction(false);
	}.bind(this));
      } else {
	changeAction(false);
      }
    }.bind(this));
  }.bind(this));
}

MySqueezeboxAlarmClockSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
}

MySqueezeboxAlarmClockSensorAccessory.prototype.login = function(callback) {
  // XXX cookies last for a year; don't bother trying to handle expiration
  if (jar.getCookieString("http://mysqueezebox.com")) {
    callback(null);
    return;
  }

  request.get("http://mysqueezebox.com/user/login", {
    form : {
      email : this.email,
      password : this.password
    }
  }, function(err, response, body) {
    if (!err) {
      this.log.debug(jar.getCookieString("http://mysqueezebox.com"));
      callback(null);
    } else {
      this.log.error("MySqueezebox error '%s'. Response: %s", err, body);
      callback(err || new Error("Failed to log into MySqueezebox."));
    }
  }.bind(this));
}

MySqueezeboxAlarmClockSensorAccessory.prototype.command = function(command, callback) {
  var rpc = {
    id : 1,
    method : "slim.request",
    params : [ this.playerid, command ]
  };

  request.post({
    url : "http://mysqueezebox.com/jsonrpc.js",
    json : rpc
  }, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      this.log.debug("MySqueezebox JSON RPC complete: " + JSON.stringify(rpc) + " => "
	  + JSON.stringify(body));
      callback(null, response);
    } else {
      this.log.error("MySqueezebox error '%s'. Response: %s", err, body);
      callback(err || new Error("MySqueezebox error occurred."));
    }
  }.bind(this));
}

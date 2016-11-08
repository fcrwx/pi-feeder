#!/usr/bin/env node

// TODO: save enabled state to disk so state is preserved over reboots
// TODO: get log time to be local, not UTC

var winston = require('winston');
var express = require('express');

var app = express();

var powerOn = false;
var enabled = true;
var pollingInterval = 1000; // ms
var port = 3000;

var pythonBinary = '/usr/bin/python';
var powerOnScript = '/home/pi/feeder/power-on.py';
var powerOffScript = '/home/pi/feeder/power-off.py';

winston.add(require('winston-daily-rotate-file'), {
  filename: __dirname + '/feeder-log',
  datePattern: '.yyyy-MM-dd',
  timestamp: function() { 
    return new Date().toLocaleTimeString();
  },
  prepend: false,
  json: false,
  count: 7
});

app.get('/feed', function (req, res) {
  res.send('Hello World!');
});

app.get('/feed/timestamp', function (req, res) {
  winston.info('received timestamp request');
  var now = new Date(Date.now()).toLocaleString();
  res.send(now);
});

app.get('/feed/status', function (req, res) {
  winston.info('received feed status request');
  if (powerOn) {
    res.send('1');
  }
  else {
    res.send('0');
  }  
});

app.get('/feed/enabled', function (req, res) {
  winston.info('received feed enabled request');
  if (enabled) {
    res.send('1');
  }
  else {
    res.send('0');
  }  
});

app.get('/feed/enabled/on', function (req, res) {
  winston.info('turning enabled on');
  res.send('enabled');
  enabled = true;
});

app.get('/feed/enabled/off', function (req, res) {
  winston.info('turning enabled off');
  res.send('disabled');
  enabled = false;
  power(false);
});

app.get('/feed/timer/:seconds', function (req, res) {
  var seconds = req.params.seconds;

  if (enabled) {
    res.send('executing for ' + req.params.seconds + ' seconds');
    winston.info('executing for ' + req.params.seconds + ' seconds');

    var currentTime = timestamp();
    var stopTime = currentTime + seconds * 1000;
    setStopTime(stopTime);
  }
  else {
    res.send('request denied -- currently disabled');
  }
});

app.listen(port, function () {
  winston.info('listening on port ' + port);
  winston.info('initializing stopTime');
  setStopTime(timestamp());
});

setInterval(function() {
  checkStopTime();
}, pollingInterval);

var timestamp = function() {
  return new Date().getTime();
}

var setStopTime = function(stamp) {
  stopTime = stamp;
  winston.info("set stop time: " + stamp);
}

var checkStopTime = function() {
  var currentTime = timestamp();
  
  winston.info('(current: ' + currentTime + ', stop: ' + stopTime + ', enabled: ' + enabled + ', power: ' + powerOn + ')');

  if ((stopTime >= currentTime) && (enabled) && (!powerOn)) {
    power(true);
  }

  if ((stopTime < currentTime) && (enabled) && (powerOn)) {
    power(false);
  }
}

var power = function(on) {
  var script = '';
  if (on) {
    powerOn = true;
    winston.info('sending ON signal');
    script = powerOnScript;
  }
  else {
    powerOn = false;
    winston.info('sending OFF signal');
    script = powerOffScript;
  }

  if (script !== '') {
    var cmd = pythonBinary + " " + script;
    var child = require('child_process').exec(cmd);
    child.stdout.pipe(process.stdout);
  }
}


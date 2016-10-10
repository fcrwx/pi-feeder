#!/usr/bin/env node

var express = require('express');

var app = express();

var powerOn = false;
var enabled = true;
var pollingInterval = 2000; // ms
var port = 3000;

var pythonBinary = '/usr/bin/python';
var powerOnScript = 'power-on.py';
var powerOffScript = 'power-off.py';

app.get('/feed', function (req, res) {
  res.send('Hello World!');
});

app.get('/feed/timestamp', function (req, res) {
  console.log('received timestamp request');
  var now = new Date(Date.now()).toLocaleString();
  res.send(now);
});

app.get('/feed/status', function (req, res) {
  console.log('received feed status request');
  if (powerOn) {
    res.send('1');
  }
  else {
    res.send('0');
  }  
});

app.get('/feed/enabled', function (req, res) {
  console.log('received feed enabled request');
  if (enabled) {
    res.send('1');
  }
  else {
    res.send('0');
  }  
});

app.get('/feed/enabled/on', function (req, res) {
  console.log('turning enabled on');
  res.send('enabled');
  enabled = true;
});

app.get('/feed/enabled/off', function (req, res) {
  console.log('turning enabled off');
  res.send('disabled');
  enabled = false;
});

app.get('/feed/timer/:seconds', function (req, res) {
  var seconds = req.params.seconds;

  if (enabled) {
    res.send('executing for ' + req.params.seconds + ' seconds');
    console.log('executing for ' + req.params.seconds + ' seconds');

    var currentTime = timestamp();
    var stopTime = currentTime + seconds * 1000;
    setStopTime(stopTime);
  }
  else {
    res.send('request denied -- currently disabled');
  }
});

app.listen(port, function () {
  console.log('listening on port ' + port);
  console.log('initializing stopTime');
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
  console.log("set stop time: " + stamp);
}

var checkStopTime = function() {
  var currentTime = timestamp();
  
  console.log('(current: ' + currentTime + ', stop: ' + stopTime + ', enabled: ' + enabled + ', power: ' + powerOn + ')');

  if ((stopTime >= currentTime) && (enabled) && (!powerOn)) {
    power(true)
  }

  if ((stopTime < currentTime) && (enabled) && (powerOn)) {
    power(false)
  }
}

var power = function(on) {
  var script = '';
  if (on) {
    powerOn = true;
    console.log('sending ON signal');
    script = powerOnScript;
  }
  else {
    powerOn = false;
    console.log('sending OFF signal');
    script = powerOffScript;
  }

  if (script !== '') {
    // var cmd = pythonBinary + " " + script;
    // var child = require('child_process').exec(cmd);
    // child.stdout.pipe(process.stdout);
  }
}


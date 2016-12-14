# homebridge-mysqueezebox-alarmclocksensor

[![npm version](https://badge.fury.io/js/homebridge-mysqueezebox-alarmclocksensor.svg)](https://badge.fury.io/js/homebridge-mysqueezebox-alarmclocksensor)

Squeezebox alarm clock sensor plugin for [Homebridge](https://github.com/nfarina/homebridge).

## Features

This plugin creates a sensor accessory based on Squeezebox alarm time. This allows you to perform any automation workflow you want when you alarm clock is about to ring (from iOS Home App for instance). I personally use it to kick in my heating system (Nest Thermostat) so that my home is warm when I get up (it motivates me to get out of bed for catching up that 6:30am plane).

When an alarm is about to be triggered (e.g. 30 minutes before / configurable `window_minutes`), the sensor will be "switched on". The sensor will switch back to initial state once the alarm time has passed. 
In order to determine sensor status, your Squeezebox's alarms states (on/off and schedules) are polled on a frequency defined by the `poll_cron` parameter (by default every 5th minute from 5am through 10am).

NOTE 1: This plugin is, by design, meant to be configured through the [MySqueezebox.com](http://mysqueezebox.com). I did not want to install a local [Logitech Media Server (LMS)](https://en.wikipedia.org/wiki/Logitech_Media_Server).

NOTE 2: I use Apple HomeKit Automation feature to setup the action to be performed once the sensor is ON. You will need an Apple TV 4 or an iPad that stays at home. See [HomeKit Automation requirements](https://support.apple.com/en-us/HT207057).

NOTE 3: Squeezebox product line is discontinued by the manufacturer (Logitech). However, I still love the product and have not yet found an alternative smart alarm clock that stands comparison (design, multiple alarms, standalone / no phone required).

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-mysqueezebox-alarmclocksensor`
3. Sign up for an account on [MySqueezebox](http://mysqueezebox.com/)
4. Update your configuration file. See sample-config.json snippet below.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `playerid` | N/A | The MAC address of your Squeezebox. You can find it from [MySqueezebox.com](http://mysqueezebox.com) under Player section: Player MAC Address.|
| `poll_cron` | */5 4-9 * * * | The [Cron expression](https://www.npmjs.com/package/node-cron#cron-syntax) defining the frequency for polling alarms status. e.g. "*/5 5-9 * * *" will poll alarms at every 5th minute from 5am through 10am.|
| `window_minutes` | 30 | When polling alarms, if an alarm time is defined within this many minutes, the sensor will be triggered.. |
| `sensor_type	` | c | Currently either "m" for motion sensor or "c" for contact sensor. |
| `email` | N/A | Your mysqueezebox.com email account. |
| `password` | N/A | Your mysqueezebox.com password account. Note that MySqueezebox website sends your email and password in clear text.  Don't use any password you care about.|

Configuration sample:

```json
{
  "accessories": [{
		"accessory": "MySqueezeboxAlarmClockSensor",
		"name": "Squeezebox Alarm Sensor",
		"playerid": "00:11:22:33:44:55",
		"poll_cron": "*/5 4-9 * * *",
		"window_minutes": "30",
		"sensor_type": "c",
		"email": "test@example.com",
		"password": "squeezeboxpassword"
	}]
}
```

## Known issues

MySqueezebox cookies last for a year; the plugin doesn't attempt to deal with cookie expiration or re-login.

## Credit

I took large inspiration from [homebridge-mysqueezebox](https://github.com/nriley/homebridge-mysqueezebox) plugin. [nriley](https://github.com/nriley) deserves credit for that, thank you big times!

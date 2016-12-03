# homebridge-mysqueezebox-alarmclocksensor

[![npm version](https://badge.fury.io/js/homebridge-mysqueezebox-alarmclocksensor.svg)](https://badge.fury.io/js/homebridge-mysqueezebox-alarmclocksensor)

This plugin creates a contact sensor accessory based on Squeezebox alarm time. When an alarm is about to be triggered (e.g. 30 minutes before / configurable `window_minutes`), the sensor will be switched on. This allows you to perform any automation workflow you want (from iOS Home App for instance). I personally use it to kick in my heating system (Nest Thermostat) so that my home is warm when I get up (it motivates me to get out of bed for catching up that 5:30am plane).

I took large inspiration from [homebridge-mysqueezebox](https://github.com/nriley/homebridge-mysqueezebox) plugin. [Nicolas Riley, aka nriley](https://github.com/nriley) deserves credit for that, thank you big times!

NOTE 1: This plugin is, by design, meant to be configured through the [MySqueezebox.com](http://mysqueezebox.com). I did not want to install a local [Logitech Media Server (LMS)](https://en.wikipedia.org/wiki/Logitech_Media_Server) on my Mac Mini. You will then need to register to the cloud based service.

NOTE 2: I use Apple HomeKit Automation feature to setup the action to be performed once the sensor is ON. You will need an Apple TV 4 or an iPad that stays at home. See [HomeKit Automation requirements](https://support.apple.com/en-us/HT207057).

NOTE 3: Squeezebox product line is discontinued by the manufacturer (Logitech). However, I still love the product and have not yet found an alternative smart alarm clock that stands comparison (design, multiple alarms, standalone / no phone required).

## Configuration

| Key | Description |
| --- | --- |
| `playerid` | The MAC address of your Squeezebox.|
| `poll_cron` | The [Cron expression](https://www.npmjs.com/package/node-cron#cron-syntax) defining the frequency for polling alarms status. e.g. "*/5 5-10 * * *" will poll alarms at every 5th minute from 5am through 10am.|
| `window_minutes` | When polling alarms, if an alarm time is defined within this many minutes, the sensor will be triggered.. |
| `sensor_type	` | Currently either "m" for motion sensor or "c" for contact sensor. |
| `email` | Your mysqueezebox.com email account. |
| `password` | Your mysqueezebox.com password account. Note that MySqueezebox website sends your email and password in clear text.  Don't use any password you care about.|

# homebridge-mysqueezebox
[Homebridge](https://github.com/nfarina/homebridge) plugin for sending commands through [MySqueezebox](http://mysqueezebox.com/).

This plugin exposes your Squeezebox as a set of switches.  The way I use it, turning on a "switch" starts something playing, and by default turning off a switch will turn off the Squeezebox, though you can specify a different `offcommand` if you wish.  With Siri, it's pretty natural to say "Turn on (thing I want to listen to)", and you can easily connect the Squeezebox to HomeKit scenes, for example if you want music to wake up/go to sleep by.

## Sample usage
```
    "accessories": [
        {
					"accessory": "MySqueezeboxAlarmClockSensor",
					"name": "Squeezebox Alarm Sensor",
					"playerid": "PLAYERID",
					"poll_cron": "*/5 4-10 * * *",
					"window_minutes": "30",
					"email": "EMAIL",
					"password": "PASSWORD"
				}
```

## Known issues
MySqueezebox cookies last for a year; the plugin doesn't attempt to deal with cookie expiration or re-login.

# feeder

Description

Dependencies

NetIO UI-Designer
http://netio.davideickhoff.de/

Raspberry Pi

Power Module

express, port

page I found for wiring up the Pi

GPIO, 18

endpoints:
* /feed/status

   Current power status. 0 = OFF, 1 = ON

* /feed/enabled

   Ability to change power state. 0 = OFF, 1 = ON

* /feed/enabled/on

   Enable power control

* /feed/enabled/off

   Disable power control

* /feed/timestamp

   Current system time

* /feed/timer/:seconds

   Turn power on for the give number of seconds

crontab example, curl http://<host>/feed


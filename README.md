# Sonoff Control Server Alexa Skill
Simple smart-home Alexa skill to control switch devices, using the [Sonoff Control Server](https://github.com/liorcode/sonoff-control-server).

Designed to be used as an AWS Lambda function, and therefore includes only two small scripts.

The payload type is "Smart Home v2".  
As it works for switches, it only supports 3 directives: Discovery, TurnOn and TurnOff.

To use it, follow [Steps to Build a Smart Home Skill](https://developer.amazon.com/docs/smarthome/steps-to-build-a-smart-home-skill.html), while uploading the two files here as your lambda function.  
Also make sure to set Google OAuth authorization for account linking, when creating the Alexa Skill.

Also, make sure to set an environment variable called "DEVICES_SERVER_URL" to point to your Sonoff Control Server.

TODO: migrate the payload to v3.

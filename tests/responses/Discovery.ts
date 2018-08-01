export default {
  "event": {
    "header": {
      "messageId": expect.anything(),
      "name": "Discover.Response",
      "namespace": "Alexa.Discovery",
      "payloadVersion": "3"
    },
    "payload": {
      "endpoints": [
        {
          "capabilities": [
            {
              "interface": "Alexa.PowerController",
              "properties": {
                "proactivelyReported": false,
                "retrievable": true,
                "supported": [
                  {
                    "name": "powerState"
                  }
                ]
              },
              "type": "AlexaInterface",
              "version": "3"
            }
          ],
          "cookie": {

          },
          "description": "Sonoff switch: device 1",
          "displayCategories": [
            "SWITCH"
          ],
          "endpointId": "10001f97ea",
          "friendlyName": "device 1",
          "manufacturerName": "Sonoff",
          "version": "1.5.5"
        },
        {
          "capabilities": [
            {
              "interface": "Alexa.PowerController",
              "properties": {
                "proactivelyReported": false,
                "retrievable": true,
                "supported": [
                  {
                    "name": "powerState"
                  }
                ]
              },
              "type": "AlexaInterface",
              "version": "3"
            }
          ],
          "cookie": {

          },
          "description": "Sonoff switch: device 2",
          "displayCategories": [
            "SWITCH"
          ],
          "endpointId": "10001f97eb",
          "friendlyName": "device 2",
          "manufacturerName": "Sonoff",
          "version": "1.5.5"
        }
      ]
    }
  }
}

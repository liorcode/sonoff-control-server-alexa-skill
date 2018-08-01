export default {
  "context": {
    "properties": [
      {
        "name": "connectivity",
        "namespace": "Alexa.EndpointHealth",
        "timeOfSample":  expect.anything(),
        "uncertaintyInMilliseconds": 0,
        "value": {
          "value": "OK"
        }
      },
      {
        "name": "powerState",
        "namespace": "Alexa.PowerController",
        "timeOfSample": expect.anything(),
        "uncertaintyInMilliseconds": 0,
        "value": "OFF"
      }
    ]
  },
  "event": {
    "endpoint": {
      "endpointId": "endpoint-001"
    },
    "header": {
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ\/jCc8ptlAKulUj90jSqg==",
      "messageId": expect.anything(),
      "name": "StateReport",
      "namespace": "Alexa",
      "payloadVersion": "3"
    },
    "payload": {

    }
  }
}

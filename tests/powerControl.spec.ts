import { handler } from '../src/main';
const rp = require('../src/lib/request-promise-lite.js');
// Samples (from https://github.com/alexa/alexa-smarthome)
import PowerOnRequest from './requests/PowerController.TurnOn.request.json';

jest.mock('../src/lib/request-promise-lite.js');

describe('PowerControl request', () => {
  it('returns success on power on request', () => {
    rp.patch.mockResolvedValueOnce({});

    const cb = jest.fn();
    return handler(PowerOnRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "endpoint": {
              "endpointId": "endpoint-001"
            },
            "header": {
              "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ\/jCc8ptlAKulUj90jSqg==",
              "messageId": expect.anything(),
              "name": "Response",
              "namespace": "Alexa",
              "payloadVersion": "3"
            },
            "payload": {}
          }
        });
      })
  });

  it('returns INVALID_AUTHORIZATION_CREDENTIAL when token is invalid', () => {
    rp.patch.mockRejectedValueOnce({ statusCode: 401 });

    const cb = jest.fn();
    return handler(PowerOnRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "header": {
              "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ\/jCc8ptlAKulUj90jSqg==",
              "messageId": expect.anything(),
              "name": "ErrorResponse",
              "namespace": "Alexa",
              "payloadVersion": "3"
            },
            endpoint: {
              "endpointId": "endpoint-001",
            },
            "payload": {
              "message": "Unable to authenticate user",
              "type": "INVALID_AUTHORIZATION_CREDENTIAL"
            }
          }
        });
      })
  });

  it('returns NO_SUCH_ENDPOINT error on 404', () => {
    rp.patch.mockRejectedValueOnce({ statusCode: 404 });

    const cb = jest.fn();
    return handler(PowerOnRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "header": {
              "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ\/jCc8ptlAKulUj90jSqg==",
              "messageId": expect.anything(),
              "name": "ErrorResponse",
              "namespace": "Alexa",
              "payloadVersion": "3"
            },
            endpoint: {
              "endpointId": "endpoint-001",
            },
            "payload": {
              "message": "Invalid endpoint id",
              "type": "NO_SUCH_ENDPOINT"
            }
          }
        });
      })
  });

  it('returns ENDPOINT_UNREACHABLE on server error', () => {
    rp.patch.mockRejectedValueOnce({ statusCode: 500 });

    const cb = jest.fn();
    return handler(PowerOnRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "header": {
              "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ\/jCc8ptlAKulUj90jSqg==",
              "messageId": expect.anything(),
              "name": "ErrorResponse",
              "namespace": "Alexa",
              "payloadVersion": "3"
            },
            endpoint: {
              "endpointId": "endpoint-001",
            },
            "payload": {
              "message": "Power switch failed",
              "type": "ENDPOINT_UNREACHABLE"
            }
          }
        });
      })
  });
});

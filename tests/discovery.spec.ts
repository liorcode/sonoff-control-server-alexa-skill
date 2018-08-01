import { handler } from '../src/main';
const rp = require('../src/lib/request-promise-lite.js');
// Sample (from https://github.com/alexa/alexa-smarthome)
import DiscoveryRequest from './requests/Discovery.request.json';
import DiscoveryExpectedResponse from './responses/Discovery';
import DevicesResponse from './responses/Devices.json';

jest.mock('../src/lib/request-promise-lite.js');

describe('Discovery request', () => {
  it('returns devices on discovery request', () => {
    rp.get.mockResolvedValueOnce(DevicesResponse);

    const cb = jest.fn();
    return handler(DiscoveryRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, DiscoveryExpectedResponse);
      })
  });

  it('returns empty endpoints array when token is invalid', () => {
    rp.get.mockRejectedValueOnce({ statusCode: 401 });

    const cb = jest.fn();
    return handler(DiscoveryRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "header": {
              "messageId": expect.anything(),
              "name": "Discover.Response",
              "namespace": "Alexa.Discovery",
              "payloadVersion": "3"
            },
            "payload": {
              "endpoints": []
            }
          }
        });
      })
  });

  it('returns empty endpoints array on server error', () => {
    rp.get.mockRejectedValueOnce({ statusCode: 500 });

    const cb = jest.fn();
    return handler(DiscoveryRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, {
          "event": {
            "header": {
              "messageId": expect.anything(),
              "name": "Discover.Response",
              "namespace": "Alexa.Discovery",
              "payloadVersion": "3"
            },
            "payload": {
              "endpoints": []
            }
          }
        });
      })
  });
});

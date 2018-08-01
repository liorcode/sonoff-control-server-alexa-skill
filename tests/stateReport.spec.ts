import { handler } from '../src/main';
const rp = require('../src/lib/request-promise-lite.js');
// Samples (from https://github.com/alexa/alexa-smarthome)
import ReportStateRequest from './requests/ReportState.request.json';
import StateReportResponseOff from './responses/StateReport-off';
import StateReportResponseOn from './responses/StateReport-on';
import StateReportResponseOffline from './responses/StateReport-offline';

jest.mock('../src/lib/request-promise-lite.js');

describe('ReportState request', () => {
  it('returns StateReport on ReportState request when (switch on)', () => {
    rp.get.mockResolvedValueOnce({
      isOnline: true,
      state: {
        switch: 'on'
      }
    });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, StateReportResponseOn);
      })
  });

  it('returns StateReport on ReportState request when (switch off)', () => {
    rp.get.mockResolvedValueOnce({
      isOnline: true,
      state: {
        switch: 'off'
      }
    });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, StateReportResponseOff);
      })
  });

  it('returns StateReport on ReportState request when (switch offline)', () => {
    rp.get.mockResolvedValueOnce({
      isOnline: false,
      state: {
        switch: 'off'
      }
    });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
      .then(() => {
        expect(cb).toBeCalledWith(null, StateReportResponseOffline);
      })
  });

  it('returns INVALID_AUTHORIZATION_CREDENTIAL when token is invalid', () => {
    rp.get.mockRejectedValueOnce({ statusCode: 401 });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
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
    rp.get.mockRejectedValueOnce({ statusCode: 404 });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
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
    rp.get.mockRejectedValueOnce({ statusCode: 500 });

    const cb = jest.fn();
    return handler(ReportStateRequest, {}, cb)
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
              "message": "Unable to get status",
              "type": "BRIDGE_UNREACHABLE"
            }
          }
        });
      })
  });
});

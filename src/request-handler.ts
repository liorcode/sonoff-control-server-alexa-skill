import { SonoffApi } from './endpoint-api/sonoff-api';
import * as Alexa from './models/alexa.types';
import { AlexaContextProperty } from './models/alexa.types';
import { IHTTPError } from './endpoint-api/IEndpointApi';

/**
 * Generate a unique message ID
 * @return {string} uuid 4
 */
function generateMessageID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class AlexaRequestsHandler {
  header: Alexa.AlexaHeader;
  endpoint: Alexa.AlexaEndpoint;
  payload: Alexa.AlexaPayload;
  correlationToken: string;
  endpointApi = new SonoffApi();

  handleDirective(directive: Alexa.AlexaDirective) {
    const { header, endpoint, payload } = directive;
    Object.assign(this, { header, endpoint, payload });

    switch (header.namespace) {
      case 'Alexa.Discovery':
        return this.handleDiscoveryRequest();
      case 'Alexa.PowerController':
        return this.handlePowerControlRequest();
      case 'Alexa':
        if (header.name === 'ReportState') {
          return this.handleStateReport();
        }
      // Else: fall-through
      /**
       * Received an unexpected message
       */
      default: {
        const errorMessage = `Unsupported namespace: ${header.namespace} name: ${header.name}`;
        console.log('ERROR', errorMessage);
      }
    }
  }

  /**
   * Generate a response header object
   * @param {string} namespace
   * @param {string} name
   * @return {AlexaHeader}
   */
  generateResponseHeader(namespace: string, name: string): Alexa.AlexaHeader {
    return {
      namespace,
      name,
      payloadVersion: '3',
      messageId: generateMessageID(),
      correlationToken: this.correlationToken,
    }
  }

  /**
   * Generate a response object
   * @param {AlexaErrorResponseType} errorType
   * @param {string} message
   * @return {AlexaErrorResponse}
   */
  generateErrorResponse(errorType: Alexa.AlexaErrorResponseType, message?: string): Alexa.AlexaErrorResponse {
    return {
      event: {
        header: this.generateResponseHeader('Alexa', 'ErrorResponse'),
        endpoint: { endpointId: this.endpoint.endpointId },
        payload: {
          type: errorType,
          message,
        }
      }
    }
  }

  /**
   * Generate a StateReport property object
   * @param {string} namespace
   * @param {string} name
   * @param {*} value
   * @return {AlexaContextProperty}
   */
  generateReportProperty(namespace: string, name: string, value: any): AlexaContextProperty {
    return {
      namespace,
      name,
      value,
      timeOfSample: (new Date()).toISOString(),
      uncertaintyInMilliseconds: 0
    }
  }

  /**
   * Handle Alexa "ReportState" request.
   * Checks the endpoint status and issues a StateReport.
   * @return {Promise<AlexaResponse>}
   */
  async handleStateReport(): Promise<Alexa.AlexaResponse> {
    const { token } = this.endpoint.scope;
    try {
      const deviceStatus = await this.endpointApi.getDeviceStatus(token, this.endpoint.endpointId);

      return {
        context: {
          properties: [
            this.generateReportProperty('Alexa.EndpointHealth', 'connectivity', deviceStatus.connectivity),
            this.generateReportProperty('Alexa.PowerController', 'powerState', deviceStatus.switchStatus),
          ]
        },
        event: {
          header: this.generateResponseHeader('Alexa', 'StateReport'),
          endpoint: { endpointId: this.endpoint.endpointId },
          payload: {}
        }
      }
    } catch (err) {
      switch (err.statusCode) {
        case 401:
          return this.generateAuthError(err);
        case 404:
          return this.generateErrorResponse('NO_SUCH_ENDPOINT', 'Invalid endpoint id');
        default:
          return this.generateErrorResponse('BRIDGE_UNREACHABLE', 'Unable to get status');
      }
    }
  }

  /**
   * Handle Alexa device discovery request
   * @return {Promise<AlexaResponse>}
   */
  async handleDiscoveryRequest(): Promise<Alexa.AlexaResponse> {
    const { token } = this.payload.scope;

    try {
      const devices = await this.endpointApi.getDevices(token);

      return {
        event: {
          header: this.generateResponseHeader('Alexa.Discovery', 'Discover.Response'),
          payload: { endpoints: devices }
        }
      }
    } catch (err) {
      switch (err.statusCode) {
        case 401:
          return this.generateAuthError(err);
        default:
          return this.generateErrorResponse('BRIDGE_UNREACHABLE', 'Unable to get devices');
      }
    }
  }

  /**
   * Handle Alexa power control request
   * @return {Promise<AlexaResponse>}
   */
  async handlePowerControlRequest(): Promise<Alexa.AlexaResponse> {
    try {
      const { token } = this.endpoint.scope;
      const isTurnOn = this.header.name === 'TurnOn'; // the other possible header is 'TurnOff'

      await this.endpointApi.switchDevice(token, this.endpoint.endpointId, isTurnOn);

      return {
        event: {
          header: this.generateResponseHeader('Alexa', 'Response'),
          endpoint: { endpointId: this.endpoint.endpointId },
          payload: {}
        }
      }
    } catch (err) {
      switch (err.statusCode) {
        case 401:
          return this.generateAuthError(err);
        case 404:
          return this.generateErrorResponse('NO_SUCH_ENDPOINT', 'Invalid endpoint id');
        default:
          return this.generateErrorResponse('ENDPOINT_UNREACHABLE', 'Power switch failed');
      }
    }
  }

  generateAuthError(err: IHTTPError) {
    console.error('Unable to validate user token', err);
    return this.generateErrorResponse('INVALID_AUTHORIZATION_CREDENTIAL', 'Unable to authenticate user');
  }
}

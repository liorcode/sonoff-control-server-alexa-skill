export type AlexaErrorResponseType = 'ALREADY_IN_OPERATION'
  | 'BRIDGE_UNREACHABLE'
  | 'ENDPOINT_BUSY'
  | 'ENDPOINT_LOW_POWER'
  | 'ENDPOINT_UNREACHABLE'
  | 'EXPIRED_AUTHORIZATION_CREDENTIAL'
  | 'FIRMWARE_OUT_OF_DATE'
  | 'HARDWARE_MALFUNCTION'
  | 'INTERNAL_ERROR'
  | 'INVALID_AUTHORIZATION_CREDENTIAL'
  | 'INVALID_DIRECTIVE'
  | 'INVALID_VALUE'
  | 'NO_SUCH_ENDPOINT'
  | 'NOT_SUPPORTED_IN_CURRENT_MODE'
  | 'NOT_IN_OPERATION'
  | 'POWER_LEVEL_NOT_SUPPORTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TEMPERATURE_VALUE_OUT_OF_RANGE'
  | 'VALUE_OUT_OF_RANGE';

export interface AlexaHeader {
  namespace: string;
  name: string;
  payloadVersion: string; // only 3 is supported here
  messageId: string;
  correlationToken?: string;
}

export interface AlexaScopeObject {
  type: string;
  token: string;
  partition?: string;
  userId?: string;
}

export interface AlexaEndpoint {
  endpointId: string;
  scope?: AlexaScopeObject;
  cookie?: any;
}

export interface AlexaPayload {
  scope?: AlexaScopeObject
  [key: string]: any; // depends on the interface
}

export interface AlexaDirective {
  header: AlexaHeader
  endpoint?: AlexaEndpoint
  payload: AlexaPayload
}

export interface AlexaRequest {
  directive: AlexaDirective;
}

export interface AlexaEvent extends AlexaDirective {}

export interface AlexaContextProperty {
  namespace: string;
  name: string;
  value: any;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
}

export interface AlexaResponse {
  context?: {
    properties: AlexaContextProperty[]
  },
  event: AlexaEvent
}

export interface AlexaErrorEvent extends AlexaEvent {
  payload: {
    type: AlexaErrorResponseType;
    message?: string;
    [key: string]: any; // depending on the type, there may be more payload items
  }
}

export interface AlexaErrorResponse {
  event: AlexaErrorEvent;
}

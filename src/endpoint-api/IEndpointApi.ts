import { ISwitchDevice, ISwitchDeviceStatus } from '../models/ISwitchDevice';

/**
 * Http Error, as defined by request-promise-lite
 */
export interface IHTTPError extends Error {
  statusCode: number,
  response: any
}

export interface IEndpointApi {
  validateToken(token: string): Promise<void>;
  getDevices(token: string): Promise<ISwitchDevice[]>;
  getDeviceStatus(token: string, endpointId: string): Promise<ISwitchDeviceStatus>
  switchDevice(token: string, endpointId: string, on: boolean): Promise<any>;
}

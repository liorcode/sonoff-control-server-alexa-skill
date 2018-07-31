const rp = require('../request-promise-lite');
const SERVER_URL = process.env.DEVICES_SERVER_URL;

import { IEndpointApi } from './IEndpointApi';
import { ISwitchDevice } from '../models/ISwitchDevice';
import { ISonoffSwitch } from '../models/ISonoffSwitch';

export class SonoffApi implements IEndpointApi {
  async validateToken(token: string) {
    return await rp.get(`${SERVER_URL}/users/me`, {
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getDevices(token: string) {
    return await rp.get(`${SERVER_URL}/devices/`, {
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(this.convertDevicesToAlexaFormat);
  }

  async getDeviceStatus(token: string, endpointId: string) {
    return await rp.get(`${SERVER_URL}/devices/${endpointId}`, {
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((device: ISonoffSwitch) => ({
      connectivity: device.isOnline ? 'OK' : 'ENDPOINT_UNREACHABLE',
      switchStatus: <'ON' | 'OFF'>device.state.switch.toUpperCase()
    }));
  }

  async switchDevice(token: string, endpointId: string, on: boolean) {
    const switchValue = on ? 'on': 'off';
    return await rp.patch(`${SERVER_URL}/devices/${endpointId}`, {
      json: true,
      body: { state: { switch: switchValue } },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Convert the devices array from server to an Alexa Discovery devices format.
   * @param {any[]} devices
   * @return {ISwitchDevice[]}
   */
  private convertDevicesToAlexaFormat(devices: any[]): ISwitchDevice[] {
    return devices.map(device => ({
      endpointId: device.id,
      version: device.version,
      manufacturerName: 'Sonoff',
      friendlyName: device.name,
      description: `Sonoff switch: ${device.name}`,
      displayCategories:['SWITCH'],
      capabilities: [{
        type: 'AlexaInterface',
        interface: 'Alexa.PowerController',
        version: '3',
        properties: {
          supported: [{name: 'powerState'}],
          proactivelyReported: false,
          retrievable: true
        }
      }],
      cookie: {}
    }))
  }
}

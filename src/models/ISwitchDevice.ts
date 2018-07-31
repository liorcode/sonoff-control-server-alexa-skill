export type ISupportedProperties = { name: string }[]
export interface IPowerCapability {
  type: string;
  interface: string;
  version: string;
  properties: {
    supported: ISupportedProperties;
    proactivelyReported: boolean;
    retrievable: boolean;
  }
}
export interface ISwitchDevice {
  endpointId: string;
  version: string;
  manufacturerName: string;
  friendlyName: string;
  description: string;
  displayCategories: string[];
  capabilities: IPowerCapability[];
  cookie: {
    [key: string]: any;
  }
}

export interface ISwitchDeviceStatus {
  connectivity: string;
  switchStatus: 'OFF' | 'ON';
}

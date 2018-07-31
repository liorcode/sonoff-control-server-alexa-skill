interface ITimerModel {
  id: string;
  enabled: boolean;
  type: 'once' | 'repeat';
  at: string;
  do: { switch: 'on' | 'off' };
}

export interface ISonoffSwitch {
  user?: {
    email: string,
    googleId: string,
  };
  id: string; // Device id
  model: string; // Device model
  version: string; // ROM version
  name: string; // Device nickname
  isOnline: boolean;
  state: {
    switch: 'on' | 'off';
    startup?: 'on' | 'off' | 'keep';
    rssi?: number; // WiFi signal
    timers?: ITimerModel[];
  };
}

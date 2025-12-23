// import { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';

export interface RemoteConfigValue {
  asString(): string;
  asNumber(): number;
  asBoolean(): boolean;
  getSource(): 'remote' | 'default' | 'static';
}

export interface RemoteConfigParameters {
  [key: string]: RemoteConfigValue;
}

export interface ConfigUpdateEvent {
  updatedKeys: string[];
}

export interface ConfigUpdateError {
  code: string;
  message: string;
}

export interface RemoteConfigDefaults {
  [key: string]: string | number | boolean;
}

export interface ConfigSettings {
  minimumFetchIntervalMillis?: number;
  fetchTimeoutMillis?: number;
}

export interface RemoteConfigListener {
  unsubscribe: () => void;
}

export interface RemoteConfigServiceInterface {
  // Initialization
  initialize(defaults?: RemoteConfigDefaults, settings?: ConfigSettings): Promise<void>;
  
  // Fetching and activation
  fetchAndActivate(): Promise<boolean>;
  fetch(cacheExpirationSeconds?: number): Promise<void>;
  activate(): Promise<boolean>;
  
  // Reading values
  getValue(key: string): RemoteConfigValue;
  getAll(): RemoteConfigParameters;
  
  // Real-time updates
  onConfigUpdated(callback: (event: ConfigUpdateEvent, error?: ConfigUpdateError) => void): RemoteConfigListener;
  
  // Settings
  setDefaults(defaults: RemoteConfigDefaults): Promise<void>;
  setConfigSettings(settings: ConfigSettings): Promise<void>;
  
  // Utility
  getLastFetchTime(): Promise<Date | null>;
  getLastFetchStatus(): Promise<number>;
  getActiveListenersCount(): number;
  isServiceInitialized(): boolean;
  cleanup(): void;
  
  // Debug
  debugLogAllValues(): void;
}

export type ConfigUpdateCallback = (event: ConfigUpdateEvent, error?: ConfigUpdateError) => void; 
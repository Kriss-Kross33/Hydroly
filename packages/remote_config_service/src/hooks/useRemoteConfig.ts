import { useState, useEffect, useCallback, useRef } from 'react';
import { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import RemoteConfigService from '../remote_config_service';
import { ConfigUpdateEvent, ConfigUpdateError, RemoteConfigDefaults, ConfigSettings } from '../types';

interface UseRemoteConfigOptions {
  defaults?: RemoteConfigDefaults;
  settings?: ConfigSettings;
  enableRealTimeUpdates?: boolean;
  onConfigUpdate?: (event: ConfigUpdateEvent, error?: ConfigUpdateError) => void;
}

interface UseRemoteConfigReturn {
  // Values
  getValue: (key: string) => FirebaseRemoteConfigTypes.ConfigValue;
  getAll: () => { [key: string]: FirebaseRemoteConfigTypes.ConfigValue };
  
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  initialize: (defaults?: RemoteConfigDefaults, settings?: ConfigSettings) => Promise<void>;
  
  // Real-time updates
  lastUpdate: ConfigUpdateEvent | null;
  activeListenersCount: number;
  
  // Debug
  debugLogAllValues: () => void;
}

/**
 * React hook for Firebase Remote Config with real-time updates
 */
export const useRemoteConfig = (options: UseRemoteConfigOptions = {}): UseRemoteConfigReturn => {
  const {
    defaults,
    settings,
    enableRealTimeUpdates = false,
    onConfigUpdate,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<ConfigUpdateEvent | null>(null);
  const [activeListenersCount, setActiveListenersCount] = useState(0);

  const listenerRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Initialize remote config
  const initialize = useCallback(async (
    customDefaults?: RemoteConfigDefaults,
    customSettings?: ConfigSettings
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const finalDefaults = customDefaults || defaults;
      const finalSettings = customSettings || settings;

      await RemoteConfigService.initialize(finalDefaults, finalSettings);
      setIsInitialized(true);

      // Set up real-time updates if enabled
      if (enableRealTimeUpdates) {
        setupRealTimeUpdates();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Remote Config';
      setError(errorMessage);
      console.error('Remote Config initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [defaults, settings, enableRealTimeUpdates]);

  // Set up real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current.unsubscribe();
    }

    listenerRef.current = RemoteConfigService.onConfigUpdated((event: ConfigUpdateEvent, error?: ConfigUpdateError) => {
      setLastUpdate(event);
      setActiveListenersCount(RemoteConfigService.getActiveListenersCount());

      if (error) {
        console.error('Remote Config update error:', error);
        setError(error.message);
      } else {
        setError(null);
      }

      // Call custom callback if provided
      if (onConfigUpdate) {
        onConfigUpdate(event, error);
      }
    });

    setActiveListenersCount(RemoteConfigService.getActiveListenersCount());
  }, [onConfigUpdate]);

  // Refresh remote config values
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await RemoteConfigService.fetchAndActivate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh Remote Config';
      setError(errorMessage);
      console.error('Remote Config refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a specific value
  const getValue = useCallback((key: string): FirebaseRemoteConfigTypes.ConfigValue => {
    try {
      return RemoteConfigService.getValue(key);
    } catch (err) {
      console.error(`Failed to get Remote Config value for '${key}':`, err);
      throw err;
    }
  }, []);

  // Get all values
  const getAll = useCallback(() => {
    try {
      return RemoteConfigService.getAll();
    } catch (err) {
      console.error('Failed to get all Remote Config values:', err);
      throw err;
    }
  }, []);

  // Debug method to log all values
  const debugLogAllValues = useCallback(() => {
    try {
      RemoteConfigService.debugLogAllValues();
    } catch (err) {
      console.error('Failed to debug log Remote Config values:', err);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        listenerRef.current.unsubscribe();
        listenerRef.current = null;
      }
    };
  }, [initialize]);

  // Update real-time updates when enableRealTimeUpdates changes
  useEffect(() => {
    if (isInitialized && enableRealTimeUpdates) {
      setupRealTimeUpdates();
    }
  }, [isInitialized, enableRealTimeUpdates, setupRealTimeUpdates]);

  return {
    getValue,
    getAll,
    isInitialized,
    isLoading,
    error,
    refresh,
    initialize,
    lastUpdate,
    activeListenersCount,
    debugLogAllValues,
  };
}; 
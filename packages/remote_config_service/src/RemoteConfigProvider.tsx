import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import RemoteConfigService from './remote_config_service';
import { ConfigUpdateEvent, ConfigUpdateError, RemoteConfigDefaults, ConfigSettings } from './types';

interface RemoteConfigContextValue {
  // Service instance
  service: typeof RemoteConfigService;
  
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Values
  getValue: (key: string) => FirebaseRemoteConfigTypes.ConfigValue;
  getAll: () => { [key: string]: FirebaseRemoteConfigTypes.ConfigValue };
  
  // Actions
  refresh: () => Promise<void>;
  
  // Real-time updates
  lastUpdate: ConfigUpdateEvent | null;
  activeListenersCount: number;
  
  // Debug
  debugLogAllValues: () => void;
}

const RemoteConfigContext = createContext<RemoteConfigContextValue | null>(null);

interface RemoteConfigProviderProps {
  children: ReactNode;
  defaults?: RemoteConfigDefaults;
  settings?: ConfigSettings;
  enableRealTimeUpdates?: boolean;
  onConfigUpdate?: (event: ConfigUpdateEvent, error?: ConfigUpdateError) => void;
  autoInitialize?: boolean;
}

export const RemoteConfigProvider: React.FC<RemoteConfigProviderProps> = ({
  children,
  defaults,
  settings,
  enableRealTimeUpdates = false,
  onConfigUpdate,
  autoInitialize = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(autoInitialize);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<ConfigUpdateEvent | null>(null);
  const [activeListenersCount, setActiveListenersCount] = useState(0);

  // Initialize remote config
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await RemoteConfigService.initialize(defaults, settings);
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
  };

  // Set up real-time updates
  const setupRealTimeUpdates = () => {
    const listener = RemoteConfigService.onConfigUpdated((event, error) => {
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

    // Return cleanup function
    return listener.unsubscribe;
  };

  // Refresh remote config values
  const refresh = async () => {
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
  };

  // Get a specific value
  const getValue = (key: string): FirebaseRemoteConfigTypes.ConfigValue => {
    try {
      return RemoteConfigService.getValue(key);
    } catch (err) {
      console.error(`Failed to get Remote Config value for '${key}':`, err);
      throw err;
    }
  };

  // Get all values
  const getAll = () => {
    try {
      return RemoteConfigService.getAll();
    } catch (err) {
      console.error('Failed to get all Remote Config values:', err);
      throw err;
    }
  };

  // Debug method to log all values
  const debugLogAllValues = () => {
    try {
      RemoteConfigService.debugLogAllValues();
    } catch (err) {
      console.error('Failed to debug log Remote Config values:', err);
    }
  };

  // Initialize on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize]);

  // Update real-time updates when enableRealTimeUpdates changes
  useEffect(() => {
    if (isInitialized && enableRealTimeUpdates) {
      const cleanup = setupRealTimeUpdates();
      return cleanup;
    }
  }, [isInitialized, enableRealTimeUpdates]);

  const contextValue: RemoteConfigContextValue = {
    service: RemoteConfigService,
    isInitialized,
    isLoading,
    error,
    getValue,
    getAll,
    refresh,
    lastUpdate,
    activeListenersCount,
    debugLogAllValues,
  };

  return (
    <RemoteConfigContext.Provider value={contextValue}>
      {children}
    </RemoteConfigContext.Provider>
  );
};

// Hook to use the remote config context
export const useRemoteConfigContext = (): RemoteConfigContextValue => {
  const context = useContext(RemoteConfigContext);
  if (!context) {
    throw new Error('useRemoteConfigContext must be used within a RemoteConfigProvider');
  }
  return context;
}; 
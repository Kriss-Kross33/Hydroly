import remoteConfig, { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import {
  RemoteConfigServiceInterface,
  RemoteConfigDefaults,
  ConfigSettings,
  ConfigUpdateEvent,
  ConfigUpdateError,
  RemoteConfigListener,
  ConfigUpdateCallback,
} from './types';

class MacroMealsRemoteConfigService implements RemoteConfigServiceInterface {
  private remoteConfigInstance: FirebaseRemoteConfigTypes.Module;
  private listeners: Map<string, ConfigUpdateCallback> = new Map();
  private isInitialized: boolean = false;
  private retryAttempts: number = 0;
  private readonly maxRetryAttempts: number = 3;
  private readonly retryDelayMs: number = 1000;
  private initializationStartTime: number = 0;

  constructor() {
    this.remoteConfigInstance = remoteConfig();
  }

  /**
   * Initialize the remote config service with defaults and settings
   */
  async initialize(defaults?: RemoteConfigDefaults, settings?: ConfigSettings): Promise<void> {
    this.initializationStartTime = Date.now();


    try {
      // Set defaults if provided
      if (defaults) {
        await this.setDefaults(defaults);
      }

      // Set config settings if provided
      if (settings) {
        await this.setConfigSettings(settings);
      }

      // Perform initial fetch and activate
      await this.fetchAndActivate();
      
      // Log all available values after initialization
      try {
        this.getAll();
        
      } catch (error) {
        console.error('[REMOTE CONFIG] ❌ Failed to log all parameters:', error);
      }
      
      this.isInitialized = true;
      // const initializationTime = Date.now() - this.initializationStartTime;
    } catch (error) {
      const initializationTime = Date.now() - this.initializationStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to initialize service:', {
        error: error instanceof Error ? error.message : String(error),
        initializationTimeMs: initializationTime,
        retryAttempts: this.retryAttempts
      });
      throw error;
    }
  }

  /**
   * Set default values for remote config parameters
   */
  async setDefaults(defaults: RemoteConfigDefaults): Promise<void> {

    try {
      await this.remoteConfigInstance.setDefaults(defaults);
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to set defaults:', {
        error: error instanceof Error ? error.message : String(error),
        defaultKeys: Object.keys(defaults)
      });
      throw error;
    }
  }

  /**
   * Set configuration settings
   */
  async setConfigSettings(settings: ConfigSettings): Promise<void> {

    try {
      await this.remoteConfigInstance.setConfigSettings(settings);

    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to set config settings:', {
        error: error instanceof Error ? error.message : String(error),
        settings
      });
      throw error;
    }
  }

  /**
   * Fetch and activate remote config values
   */
  async fetchAndActivate(): Promise<boolean> {
    // const fetchStartTime = Date.now();

    try {
      const fetchedRemotely = await this.remoteConfigInstance.fetchAndActivate();
      // const fetchTime = Date.now() - fetchStartTime;
      
      this.retryAttempts = 0; // Reset retry attempts on success
      return fetchedRemotely;
    } catch (error) {
      // const fetchTime = Date.now() - fetchStartTime;
              console.error('[REMOTE CONFIG] ❌ Failed to fetch and activate:', {
          error: error instanceof Error ? error.message : String(error),
          retryAttempts: this.retryAttempts
        });
      throw error;
    }
  }

  /**
   * Fetch remote config values with optional cache expiration
   */
  async fetch(cacheExpirationSeconds?: number): Promise<void> {
    // const fetchStartTime = Date.now();

    try {
      if (cacheExpirationSeconds !== undefined) {
        await this.remoteConfigInstance.fetch(cacheExpirationSeconds);
      } else {
        await this.remoteConfigInstance.fetch();
      }
      
      // const fetchTime = Date.now() - fetchStartTime;

    } catch (error) {
      // const fetchTime = Date.now() - fetchStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to fetch values:', {
        error: error instanceof Error ? error.message : String(error),
        cacheExpirationSeconds
      });
      throw error;
    }
  }

  /**
   * Activate fetched remote config values
   */
  async activate(): Promise<boolean> {
    // const activateStartTime = Date.now();

    try {
      const activated = await this.remoteConfigInstance.activate();
      // const activateTime = Date.now() - activateStartTime;
      
      return activated;
    } catch (error) {
      // const activateTime = Date.now() - activateStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to activate values:', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get a specific remote config value
   */
  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue {
    try {
      const value = this.remoteConfigInstance.getValue(key);
      // const valueString = value.asString();
      // const source = value.getSource();
      
      
      
      return value;
    } catch (error) {
      console.error(`[REMOTE CONFIG] ❌ Failed to get value for '${key}':`, {
        error: error instanceof Error ? error.message : String(error),
        key,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get all remote config parameters
   */
  getAll(): { [key: string]: FirebaseRemoteConfigTypes.ConfigValue } {
    try {
      const parameters = this.remoteConfigInstance.getAll();
      // const parameterKeys = Object.keys(parameters);
      
      
      
      // Log each parameter's details
      // parameterKeys.forEach(key => {
      //   const value = parameters[key];

      // });
      
      return parameters;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get all parameters:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Subscribe to real-time config updates with error handling and retry logic
   */
  onConfigUpdated(callback: ConfigUpdateCallback): RemoteConfigListener {
    const listenerId = `listener_${Date.now()}_${Math.random()}`;
    
    
    
    const wrappedCallback = async (event: any, error?: any) => {
      try {
        if (error) {
          console.error('[REMOTE CONFIG] ❌ Listener error:', {
            listenerId,
            error: error instanceof Error ? error.message : String(error),
            errorCode: error.code,
            timestamp: new Date().toISOString()
          });
          
          // Handle specific error cases
          if (error.code === 'config_update_not_fetched') {

            await this.handleConfigUpdateError(); 
          }
          
          const configError: ConfigUpdateError = {
            code: error.code || 'unknown_error',
            message: error.message || 'Unknown error occurred',
          };
          
          callback({ updatedKeys: [] }, configError);
          return;
        }

        // Extract updated keys from the event
        const updatedKeys = event?.updatedKeys || [];
        


        // Create the event object
        const configEvent: ConfigUpdateEvent = {
          updatedKeys,
        };

        // Call the original callback
        callback(configEvent);

        // Automatically activate the new config if there are updates
        if (updatedKeys.length > 0) {

          await this.activate();
        }
      } catch (callbackError) {
        console.error('[REMOTE CONFIG] ❌ Error in callback:', {
          listenerId,
          error: callbackError instanceof Error ? callbackError.message : String(callbackError),
          timestamp: new Date().toISOString()
        });
      }
    };

    // Store the callback
    this.listeners.set(listenerId, wrappedCallback);

    // Subscribe to config updates
    const unsubscribe = this.remoteConfigInstance.onConfigUpdated(wrappedCallback);



    return {
      unsubscribe: () => {
        try {
          unsubscribe();
          this.listeners.delete(listenerId);

        } catch (error) {
          console.error('[REMOTE CONFIG] ❌ Error unsubscribing:', {
            listenerId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          });
        }
      },
    };
  }

  /**
   * Handle config update errors with retry logic
   */
  private async handleConfigUpdateError(): Promise<void> {
    if (this.retryAttempts >= this.maxRetryAttempts) {
      console.error('[REMOTE CONFIG] ❌ Max retry attempts reached:', {
        maxAttempts: this.maxRetryAttempts,
        currentAttempts: this.retryAttempts,
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.retryAttempts++;
    const retryDelay = this.retryDelayMs * this.retryAttempts;
    


    try {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Attempt to fetch and activate
      await this.fetchAndActivate();

    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Retry failed:', {
        attempt: this.retryAttempts,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      // Recursively retry if we haven't reached max attempts
      if (this.retryAttempts < this.maxRetryAttempts) {
        await this.handleConfigUpdateError();
      }
    }
  }

  /**
   * Get the last fetch time
   */
  async getLastFetchTime(): Promise<Date | null> {
    try {
      // Note: getLastFetchTime is not available in the current version
      // This is a placeholder for future implementation
      console.warn('[REMOTE CONFIG] ⚠️ getLastFetchTime is not available in the current Firebase Remote Config version');
      return null;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get last fetch time:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Get the last fetch status
   */
  async getLastFetchStatus(): Promise<number> {
    try {
      const status = this.remoteConfigInstance.lastFetchStatus;
      // Convert string status to number or return default
      const statusNumber = typeof status === 'string' ? parseInt(status, 10) || -1 : status || -1;
      

      
      return statusNumber;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get last fetch status:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      return -1;
    }
  }

  /**
   * Get the number of active listeners
   */
  getActiveListenersCount(): number {
    const count = this.listeners.size;

    return count;
  }

  /**
   * Check if the service is initialized
   */
  isServiceInitialized(): boolean {

    return this.isInitialized;
  }

  /**
   * Debug method to log all current remote config values
   */
  debugLogAllValues(): void {
    try {
      // const allParameters = this.getAll();
      
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to debug log all values:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean up all listeners (useful for app shutdown)
   */
  cleanup(): void {
    // const listenerCount = this.listeners.size;
    this.listeners.clear();

  }
}

export default new MacroMealsRemoteConfigService();
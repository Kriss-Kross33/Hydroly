import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { RealmRepository } from "@hydroly/realm-repository";

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

// Realm schema for queued API requests
const QueuedRequestSchema = {
  name: "QueuedRequest",
  primaryKey: "id",
  properties: {
    id: "string",
    method: "string",
    url: "string",
    data: "string?", // JSON stringified
    headers: "string?", // JSON stringified
    timestamp: "double",
    retryCount: "int",
  },
};

const realmConfig = {
  schema: [QueuedRequestSchema as any],
  schemaVersion: 1,
};

class OfflineService {
  private requestQueue: RealmRepository<QueuedRequest>;
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.requestQueue = new RealmRepository<QueuedRequest>({
      realmConfig,
      objectType: "QueuedRequest",
      idKey: "id",
    });

    // Initialize network status
    this.checkNetworkStatus();

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      this.setOnlineStatus(online);
    });
  }

  private async checkNetworkStatus() {
    const state = await NetInfo.fetch();
    const online =
      state.isConnected === true && state.isInternetReachable !== false;
    this.setOnlineStatus(online);
  }

  private setOnlineStatus(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners(online);

      // If we just came online, try to sync queued requests
      if (online) {
        this.syncQueuedRequests();
      }
    }
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach((listener) => listener(online));
  }

  /**
   * Subscribe to network status changes
   */
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.isOnline);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Check if device is currently online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Queue an API request to be executed when online
   */
  async queueRequest(
    request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">
  ): Promise<void> {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.requestQueue.upsertObject(queuedRequest);
    console.log("[OfflineService] Request queued:", queuedRequest.id);
  }

  /**
   * Get all queued requests
   */
  async getQueuedRequests(): Promise<QueuedRequest[]> {
    return await this.requestQueue.getAllObjects();
  }

  /**
   * Remove a queued request after successful execution
   */
  async removeQueuedRequest(id: string): Promise<void> {
    await this.requestQueue.removeItem(id);
  }

  /**
   * Increment retry count for a queued request
   */
  async incrementRetryCount(id: string): Promise<void> {
    const request = await this.requestQueue.getObject(id);
    if (request) {
      await this.requestQueue.upsertObject({
        ...request,
        retryCount: request.retryCount + 1,
      });
    }
  }

  /**
   * Sync queued requests when coming back online
   */
  private async syncQueuedRequests() {
    if (!this.isOnline) return;

    const queued = await this.getQueuedRequests();
    console.log(`[OfflineService] Syncing ${queued.length} queued requests`);

    // This will be handled by the API interceptor or a dedicated sync service
    // For now, we just log it
    for (const request of queued) {
      console.log(
        `[OfflineService] Pending request: ${request.method} ${request.url}`
      );
    }
  }

  /**
   * Store user credentials for offline login
   * Email is stored in AsyncStorage (less sensitive)
   * Password is stored in SecureStore (encrypted, secure)
   */
  async storeCredentials(email: string, password: string): Promise<void> {
    try {
      // Store email in AsyncStorage (less sensitive, but still private)
      await AsyncStorage.setItem("offline_email", email);

      // Store password in SecureStore (encrypted and secure)
      await SecureStore.setItemAsync("offline_password", password);

      console.log(
        "[OfflineService] Credentials stored securely for offline login"
      );
    } catch (error) {
      console.error("[OfflineService] Error storing credentials:", error);
      throw error;
    }
  }

  /**
   * Get stored credentials for offline login
   * Retrieves email from AsyncStorage and password from SecureStore
   */
  async getStoredCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    try {
      const email = await AsyncStorage.getItem("offline_email");
      const password = await SecureStore.getItemAsync("offline_password");

      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error(
        "[OfflineService] Error getting stored credentials:",
        error
      );
      return null;
    }
  }

  /**
   * Clear stored credentials
   * Removes both email (AsyncStorage) and password (SecureStore)
   */
  async clearStoredCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem("offline_email");
      await SecureStore.deleteItemAsync("offline_password");
    } catch (error) {
      console.error("[OfflineService] Error clearing credentials:", error);
    }
  }
}

// Singleton instance
export const offlineService = new OfflineService();

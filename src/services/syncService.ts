/**
 * Sync Service for Pro Users
 *
 * Handles background sync of Realm data to FastAPI
 * - Batched uploads
 * - Opportunistic sync
 * - Non-blocking
 * - Conflict resolution (last write wins)
 */

import { getIdToken } from "@hydroly/firebase-auth";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DayRecord, DailyGoal } from "@/types/water";
import { UserProfile, AppSettings } from "@/types/user";
import { Badge } from "@/types/achievements";

const SYNC_STATE_KEY = "@hydroly_sync_state";
const LAST_SYNC_KEY = "@hydroly_last_sync";

interface SyncState {
  lastSyncTimestamp: number;
  pendingEntries: number;
  isSyncing: boolean;
}

interface SyncPayload {
  firebaseUid: string;
  timestamp: number;
  version: string;
  data: {
    records: Record<string, DayRecord>;
    goal: DailyGoal;
    profile: UserProfile;
    settings: AppSettings;
    badges: Record<string, Badge>;
  };
}

/**
 * Get FastAPI base URL from config
 */
function getFastAPIUrl(): string {
  // TODO: Get from environment config
  return process.env.FASTAPI_URL || "https://api.hydroly.app";
}

/**
 * Check if device is online and on Wi-Fi
 */
async function isOnlineAndWifi(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.type === "wifi";
}

/**
 * Get sync state
 */
async function getSyncState(): Promise<SyncState> {
  const stored = await AsyncStorage.getItem(SYNC_STATE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    lastSyncTimestamp: 0,
    pendingEntries: 0,
    isSyncing: false,
  };
}

/**
 * Update sync state
 */
async function updateSyncState(state: Partial<SyncState>): Promise<void> {
  const current = await getSyncState();
  const updated = { ...current, ...state };
  await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(updated));
}

/**
 * Prepare sync payload from Realm data
 */
async function prepareSyncPayload(
  records: Record<string, DayRecord>,
  goal: DailyGoal,
  profile: UserProfile,
  settings: AppSettings,
  badges: Record<string, Badge>,
  firebaseUid: string
): Promise<SyncPayload> {
  return {
    firebaseUid,
    timestamp: Date.now(),
    version: "1.0.0", // TODO: Get from app version
    data: {
      records,
      goal,
      profile,
      settings,
      badges,
    },
  };
}

/**
 * Sync data to FastAPI
 */
export async function syncToFastAPI(
  records: Record<string, DayRecord>,
  goal: DailyGoal,
  profile: UserProfile,
  settings: AppSettings,
  badges: Record<string, Badge>,
  firebaseUid: string
): Promise<boolean> {
  try {
    // Check if online and on Wi-Fi
    const isWifi = await isOnlineAndWifi();
    if (!isWifi) {
      console.log("[SyncService] Not on Wi-Fi, skipping sync");
      return false;
    }

    // Check if already syncing
    const state = await getSyncState();
    if (state.isSyncing) {
      console.log("[SyncService] Sync already in progress");
      return false;
    }

    // Get Firebase ID token
    const idToken = await getIdToken();
    if (!idToken) {
      console.log("[SyncService] No Firebase ID token, user not authenticated");
      return false;
    }

    // Prepare payload
    const payload = await prepareSyncPayload(
      records,
      goal,
      profile,
      settings,
      badges,
      firebaseUid
    );

    // Mark as syncing
    await updateSyncState({ isSyncing: true });

    // Send to FastAPI
    const response = await fetch(`${getFastAPIUrl()}/api/v1/sync/backup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    // Update sync state
    await updateSyncState({
      lastSyncTimestamp: Date.now(),
      isSyncing: false,
      pendingEntries: 0,
    });

    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

    console.log("[SyncService] Sync successful");
    return true;
  } catch (error) {
    console.error("[SyncService] Sync error:", error);
    await updateSyncState({ isSyncing: false });
    return false;
  }
}

/**
 * Restore data from FastAPI
 */
export async function restoreFromFastAPI(
  firebaseUid: string
): Promise<SyncPayload["data"] | null> {
  try {
    // Get Firebase ID token
    const idToken = await getIdToken();
    if (!idToken) {
      console.log("[SyncService] No Firebase ID token, user not authenticated");
      return null;
    }

    // Fetch latest backup
    const response = await fetch(`${getFastAPIUrl()}/api/v1/sync/restore`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Restore failed: ${response.statusText}`);
    }

    const data: SyncPayload = await response.json();

    // Verify Firebase UID matches
    if (data.firebaseUid !== firebaseUid) {
      throw new Error("Firebase UID mismatch");
    }

    console.log("[SyncService] Restore successful");
    return data.data;
  } catch (error) {
    console.error("[SyncService] Restore error:", error);
    return null;
  }
}

/**
 * Check if sync is needed
 */
export async function shouldSync(
  records: Record<string, DayRecord>
): Promise<boolean> {
  const state = await getSyncState();
  const lastSync = state.lastSyncTimestamp;
  const now = Date.now();

  // Sync if:
  // 1. Never synced before
  // 2. More than 1 hour since last sync
  // 3. More than 10 new entries since last sync
  const timeSinceSync = now - lastSync;
  const oneHour = 60 * 60 * 1000;

  if (lastSync === 0) return true;
  if (timeSinceSync > oneHour) return true;

  // Count entries since last sync (simplified - would need to track entry timestamps)
  const entryCount = Object.keys(records).length;
  if (entryCount > state.pendingEntries + 10) return true;

  return false;
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  lastSync: number | null;
  isSyncing: boolean;
  pendingEntries: number;
}> {
  const state = await getSyncState();
  const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
  const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : null;

  return {
    lastSync,
    isSyncing: state.isSyncing,
    pendingEntries: state.pendingEntries,
  };
}

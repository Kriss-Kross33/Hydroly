export interface Friend {
  id: string;
  name: string;
  friendCode: string;
  addedAt: number;
  lastHydration?: number;
  todayProgress?: number;
  todayGoal?: number;
  currentStreak?: number;
}

export interface FriendRequest {
  id: string;
  fromCode: string;
  fromName: string;
  timestamp: number;
  status: "pending" | "accepted" | "rejected";
}

export interface LeaderboardEntry {
  friendId: string;
  name: string;
  todayProgress: number;
  todayGoal: number;
  percentage: number;
  lastActive: number;
  currentStreak: number;
  rank: number;
}

export interface SharingSettings {
  isEnabled: boolean;
  shareProgress: boolean;
  shareStreak: boolean;
  allowNudges: boolean;
}

export interface Nudge {
  id: string;
  fromFriendId: string;
  fromName: string;
  timestamp: number;
  message: string;
  read: boolean;
}

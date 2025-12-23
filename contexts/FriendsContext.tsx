import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Friend,
  FriendRequest,
  SharingSettings,
  Nudge,
  LeaderboardEntry,
} from "@/types/friends";
import { useWater } from "./WaterContext";
import { useSubscription } from "./SubscriptionContext";

const FRIENDS_STORAGE_KEY = "@water_tracker_friends";
const FRIEND_CODE_STORAGE_KEY = "@water_tracker_friend_code";
const SHARING_SETTINGS_STORAGE_KEY = "@water_tracker_sharing_settings";
const NUDGES_STORAGE_KEY = "@water_tracker_nudges";
const USER_NAME_STORAGE_KEY = "@water_tracker_user_name";

interface FriendsData {
  friends: Friend[];
  requests: FriendRequest[];
}

const DEFAULT_SHARING_SETTINGS: SharingSettings = {
  isEnabled: true,
  shareProgress: true,
  shareStreak: true,
  allowNudges: true,
};

function generateFriendCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export const [FriendsProvider, useFriends] = createContextHook(() => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [myFriendCode, setMyFriendCode] = useState<string>("");
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>(
    DEFAULT_SHARING_SETTINGS
  );
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [userName, setUserNameState] = useState<string>("You");

  const { getTodayRecord, dailyGoal } = useWater();
  const { isPremium } = useSubscription();

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as FriendsData)
        : { friends: [], requests: [] };
    },
  });

  const friendCodeQuery = useQuery({
    queryKey: ["friendCode"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FRIEND_CODE_STORAGE_KEY);
      if (stored) return stored;
      const newCode = generateFriendCode();
      await AsyncStorage.setItem(FRIEND_CODE_STORAGE_KEY, newCode);
      return newCode;
    },
  });

  const sharingSettingsQuery = useQuery({
    queryKey: ["sharingSettings"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SHARING_SETTINGS_STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as SharingSettings)
        : DEFAULT_SHARING_SETTINGS;
    },
  });

  const nudgesQuery = useQuery({
    queryKey: ["nudges"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(NUDGES_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Nudge[]) : [];
    },
  });

  const userNameQuery = useQuery({
    queryKey: ["userName"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(USER_NAME_STORAGE_KEY);
      return stored || "You";
    },
  });

  const saveFriendsMutation = useMutation({
    mutationFn: async (data: FriendsData) => {
      await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveSharingSettingsMutation = useMutation({
    mutationFn: async (settings: SharingSettings) => {
      await AsyncStorage.setItem(
        SHARING_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
      return settings;
    },
  });

  const saveNudgesMutation = useMutation({
    mutationFn: async (nudges: Nudge[]) => {
      await AsyncStorage.setItem(NUDGES_STORAGE_KEY, JSON.stringify(nudges));
      return nudges;
    },
  });

  const saveUserNameMutation = useMutation({
    mutationFn: async (name: string) => {
      await AsyncStorage.setItem(USER_NAME_STORAGE_KEY, name);
      return name;
    },
  });

  useEffect(() => {
    if (friendsQuery.data) {
      setFriends(friendsQuery.data.friends);
      setRequests(friendsQuery.data.requests);
    }
  }, [friendsQuery.data]);

  useEffect(() => {
    if (friendCodeQuery.data) {
      setMyFriendCode(friendCodeQuery.data);
    }
  }, [friendCodeQuery.data]);

  useEffect(() => {
    if (sharingSettingsQuery.data) {
      setSharingSettings(sharingSettingsQuery.data);
    }
  }, [sharingSettingsQuery.data]);

  useEffect(() => {
    if (nudgesQuery.data) {
      setNudges(nudgesQuery.data);
    }
  }, [nudgesQuery.data]);

  useEffect(() => {
    if (userNameQuery.data) {
      setUserNameState(userNameQuery.data);
    }
  }, [userNameQuery.data]);

  const addFriendByCode = (code: string, name: string = "Friend") => {
    if (code === myFriendCode) {
      throw new Error("You can't add yourself as a friend");
    }

    const existingFriend = friends.find((f) => f.friendCode === code);
    if (existingFriend) {
      throw new Error("This friend is already added");
    }

    if (!isPremium && friends.length >= 1) {
      throw new Error("FREE_TIER_LIMIT");
    }

    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name,
      friendCode: code,
      addedAt: Date.now(),
      lastHydration: Date.now(),
      todayProgress: Math.floor(Math.random() * 3000),
      todayGoal: 2500,
      currentStreak: Math.floor(Math.random() * 15),
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveFriendsMutation.mutate({ friends: updatedFriends, requests });
  };

  const removeFriend = (friendId: string) => {
    const updatedFriends = friends.filter((f) => f.id !== friendId);
    setFriends(updatedFriends);
    saveFriendsMutation.mutate({ friends: updatedFriends, requests });
  };

  const updateFriendData = (friendId: string, data: Partial<Friend>) => {
    const updatedFriends = friends.map((f) =>
      f.id === friendId ? { ...f, ...data } : f
    );
    setFriends(updatedFriends);
    saveFriendsMutation.mutate({ friends: updatedFriends, requests });
  };

  const updateSharingSettings = (settings: Partial<SharingSettings>) => {
    const updated = { ...sharingSettings, ...settings };
    setSharingSettings(updated);
    saveSharingSettingsMutation.mutate(updated);
  };

  const sendNudge = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;

    const messages = [
      "💧 Time to hydrate!",
      "🚰 Don't forget to drink water!",
      "💙 Stay hydrated, friend!",
      "🌊 Your body needs water!",
      "✨ Hydration check!",
    ];

    const newNudge: Nudge = {
      id: `nudge_${Date.now()}`,
      fromFriendId: "me",
      fromName: userName,
      timestamp: Date.now(),
      message: messages[Math.floor(Math.random() * messages.length)],
      read: false,
    };

    console.log(`Nudging ${friend.name}: ${newNudge.message}`);
  };

  const receiveNudge = (fromName: string) => {
    const messages = [
      "💧 Time to hydrate!",
      "🚰 Don't forget to drink water!",
      "💙 Stay hydrated, friend!",
      "🌊 Your body needs water!",
      "✨ Hydration check!",
    ];

    const newNudge: Nudge = {
      id: `nudge_${Date.now()}`,
      fromFriendId: "friend",
      fromName,
      timestamp: Date.now(),
      message: messages[Math.floor(Math.random() * messages.length)],
      read: false,
    };

    const updatedNudges = [newNudge, ...nudges];
    setNudges(updatedNudges);
    saveNudgesMutation.mutate(updatedNudges);
  };

  const markNudgeAsRead = (nudgeId: string) => {
    const updatedNudges = nudges.map((n) =>
      n.id === nudgeId ? { ...n, read: true } : n
    );
    setNudges(updatedNudges);
    saveNudgesMutation.mutate(updatedNudges);
  };

  const clearNudges = () => {
    setNudges([]);
    saveNudgesMutation.mutate([]);
  };

  const getLeaderboard = (): LeaderboardEntry[] => {
    if (!sharingSettings.isEnabled || !sharingSettings.shareProgress) {
      return [];
    }

    const myRecord = getTodayRecord();
    const entries: LeaderboardEntry[] = [];

    entries.push({
      friendId: "me",
      name: userName,
      todayProgress: myRecord.netHydration,
      todayGoal: dailyGoal.goal,
      percentage: (myRecord.netHydration / dailyGoal.goal) * 100,
      lastActive: Date.now(),
      currentStreak: 0,
      rank: 0,
    });

    friends.forEach((friend) => {
      if (friend.todayProgress !== undefined && friend.todayGoal) {
        entries.push({
          friendId: friend.id,
          name: friend.name,
          todayProgress: friend.todayProgress,
          todayGoal: friend.todayGoal,
          percentage: (friend.todayProgress / friend.todayGoal) * 100,
          lastActive: friend.lastHydration || 0,
          currentStreak: friend.currentStreak || 0,
          rank: 0,
        });
      }
    });

    entries.sort((a, b) => b.percentage - a.percentage);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  };

  const getInactiveFriends = (): Friend[] => {
    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;

    return friends.filter((friend) => {
      const lastActive = friend.lastHydration || 0;
      return lastActive < threeHoursAgo;
    });
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    saveUserNameMutation.mutate(name);
  };

  return {
    friends,
    requests,
    myFriendCode,
    sharingSettings,
    nudges,
    userName,
    addFriendByCode,
    removeFriend,
    updateFriendData,
    updateSharingSettings,
    sendNudge,
    receiveNudge,
    markNudgeAsRead,
    clearNudges,
    getLeaderboard,
    getInactiveFriends,
    setUserName,
    unreadNudgesCount: nudges.filter((n) => !n.read).length,
    isLoading:
      friendsQuery.isLoading ||
      friendCodeQuery.isLoading ||
      sharingSettingsQuery.isLoading,
    canAddMoreFriends: isPremium || friends.length < 1,
    friendLimit: isPremium ? null : 1,
  };
});

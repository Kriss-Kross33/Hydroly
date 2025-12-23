import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  UserPlus,
  Share2,
  Bell,
  Trophy,
  Clock,
  Flame,
  Copy,
  BellOff,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react-native";
import { useFriends } from "@/contexts/FriendsContext";
import { LeaderboardEntry } from "@/types/friends";
import { useRouter } from "expo-router";

export default function FriendsScreen() {
  const {
    friends,
    myFriendCode,
    sharingSettings,
    nudges,
    addFriendByCode,
    removeFriend,
    updateSharingSettings,
    sendNudge,
    getLeaderboard,
    getInactiveFriends,
    markNudgeAsRead,
    unreadNudgesCount,
    userName,
    setUserName,
    canAddMoreFriends,
    friendLimit,
  } = useFriends();

  const router = useRouter();

  const [friendCode, setFriendCode] = useState<string>("");
  const [friendName, setFriendName] = useState<string>("");
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(userName);

  const leaderboard = getLeaderboard();
  const inactiveFriends = getInactiveFriends();

  const handleAddFriend = () => {
    if (!friendCode.trim()) {
      Alert.alert("Error", "Please enter a friend code");
      return;
    }

    try {
      addFriendByCode(friendCode.toUpperCase(), friendName.trim() || "Friend");
      setFriendCode("");
      setFriendName("");
      setShowAddFriend(false);
      Alert.alert("Success", "Friend added successfully!");
    } catch (error) {
      const err = error as Error;
      if (err.message === "FREE_TIER_LIMIT") {
        Alert.alert(
          "Upgrade to Pro",
          "Free users can only add 1 friend. Upgrade to Pro to add unlimited friends!",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => {
                setShowAddFriend(false);
                router.push("/paywall");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friendName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFriend(friendId),
        },
      ]
    );
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join me on HydraTrack! Use my friend code: ${myFriendCode}`,
      });
    } catch (error) {
      console.error("Error sharing code:", error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(myFriendCode);
    Alert.alert("Copied!", "Your friend code has been copied to clipboard");
  };

  const handleSendNudge = (friendId: string, friendName: string) => {
    sendNudge(friendId);
    Alert.alert("Nudge Sent!", `You nudged ${friendName} to hydrate!`);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setEditingName(false);
    }
  };

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#0EA5E9" size={20} />
            <Text style={styles.sectionTitle}>My Friend Code</Text>
          </View>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Share this code with friends</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{myFriendCode}</Text>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={styles.iconButton}
              >
                <Copy color="#0EA5E9" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShareCode}
                style={styles.iconButton}
              >
                <Share2 color="#0EA5E9" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserPlus color="#0EA5E9" size={20} />
            <Text style={styles.sectionTitle}>Display Name</Text>
          </View>
          <View style={styles.nameCard}>
            {editingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Your name"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleSaveName}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplay}
                onPress={() => {
                  setTempName(userName);
                  setEditingName(true);
                }}
              >
                <Text style={styles.nameText}>{userName}</Text>
                <Text style={styles.nameHint}>Tap to edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye color="#0EA5E9" size={20} />
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
          </View>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                updateSharingSettings({ isEnabled: !sharingSettings.isEnabled })
              }
            >
              <View style={styles.settingLeft}>
                {sharingSettings.isEnabled ? (
                  <Eye color="#10B981" size={20} />
                ) : (
                  <EyeOff color="#EF4444" size={20} />
                )}
                <Text style={styles.settingText}>Sharing Enabled</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  sharingSettings.isEnabled && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    sharingSettings.isEnabled && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {sharingSettings.isEnabled && (
              <>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() =>
                    updateSharingSettings({
                      shareProgress: !sharingSettings.shareProgress,
                    })
                  }
                >
                  <View style={styles.settingLeft}>
                    <Trophy color="#0EA5E9" size={18} />
                    <Text style={styles.settingSubText}>Share Progress</Text>
                  </View>
                  <View
                    style={[
                      styles.toggle,
                      sharingSettings.shareProgress && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        sharingSettings.shareProgress &&
                          styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() =>
                    updateSharingSettings({
                      allowNudges: !sharingSettings.allowNudges,
                    })
                  }
                >
                  <View style={styles.settingLeft}>
                    {sharingSettings.allowNudges ? (
                      <Bell color="#0EA5E9" size={18} />
                    ) : (
                      <BellOff color="#94A3B8" size={18} />
                    )}
                    <Text style={styles.settingSubText}>Allow Nudges</Text>
                  </View>
                  <View
                    style={[
                      styles.toggle,
                      sharingSettings.allowNudges && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        sharingSettings.allowNudges && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {sharingSettings.isEnabled &&
          sharingSettings.shareProgress &&
          leaderboard.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Trophy color="#0EA5E9" size={20} />
                <Text style={styles.sectionTitle}>
                  Today&apos;s Leaderboard
                </Text>
              </View>
              <View style={styles.leaderboardCard}>
                {leaderboard.map((entry: LeaderboardEntry) => (
                  <View
                    key={entry.friendId}
                    style={[
                      styles.leaderboardEntry,
                      entry.friendId === "me" && styles.myEntry,
                    ]}
                  >
                    <View style={styles.leaderboardLeft}>
                      <View
                        style={[
                          styles.rank,
                          entry.rank === 1 && styles.rankGold,
                          entry.rank === 2 && styles.rankSilver,
                          entry.rank === 3 && styles.rankBronze,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankText,
                            entry.rank <= 3 && styles.rankTextTop,
                          ]}
                        >
                          {entry.rank}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.leaderboardName}>{entry.name}</Text>
                        <Text style={styles.leaderboardProgress}>
                          {Math.round(entry.todayProgress)}ml /{" "}
                          {entry.todayGoal}ml
                        </Text>
                      </View>
                    </View>
                    <View style={styles.leaderboardRight}>
                      <Text style={styles.percentage}>
                        {Math.round(entry.percentage)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        {!showAddFriend && canAddMoreFriends && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddFriend(true)}
          >
            <UserPlus color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        )}

        {!showAddFriend && !canAddMoreFriends && (
          <View style={styles.section}>
            <View style={styles.limitCard}>
              <Text style={styles.limitTitle}>Friend Limit Reached</Text>
              <Text style={styles.limitText}>
                Free users can add up to {friendLimit} friend. Upgrade to Pro to
                add unlimited friends and unlock more features!
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push("/paywall")}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showAddFriend && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserPlus color="#0EA5E9" size={20} />
              <Text style={styles.sectionTitle}>Add New Friend</Text>
            </View>
            <View style={styles.addFriendCard}>
              <TextInput
                style={styles.input}
                value={friendName}
                onChangeText={setFriendName}
                placeholder="Friend name (optional)"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                value={friendCode}
                onChangeText={setFriendCode}
                placeholder="Enter friend code"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={8}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddFriend(false);
                    setFriendCode("");
                    setFriendName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddFriend}
                >
                  <Text style={styles.confirmButtonText}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {friends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users color="#0EA5E9" size={20} />
              <Text style={styles.sectionTitle}>
                My Friends ({friends.length})
              </Text>
            </View>
            <View style={styles.friendsList}>
              {friends.map((friend) => {
                const isInactive = inactiveFriends.some(
                  (f) => f.id === friend.id
                );
                return (
                  <View key={friend.id} style={styles.friendCard}>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <View style={styles.friendStats}>
                        <View style={styles.statItem}>
                          <Trophy color="#0EA5E9" size={14} />
                          <Text style={styles.statText}>
                            {Math.round(
                              ((friend.todayProgress || 0) /
                                (friend.todayGoal || 2500)) *
                                100
                            )}
                            %
                          </Text>
                        </View>
                        {friend.currentStreak && friend.currentStreak > 0 && (
                          <View style={styles.statItem}>
                            <Flame color="#F97316" size={14} />
                            <Text style={styles.statText}>
                              {friend.currentStreak} days
                            </Text>
                          </View>
                        )}
                        {isInactive && (
                          <View style={styles.statItem}>
                            <Clock color="#EF4444" size={14} />
                            <Text style={styles.inactiveText}>
                              {formatTime(friend.lastHydration || Date.now())}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.friendActions}>
                      {isInactive && sharingSettings.allowNudges && (
                        <TouchableOpacity
                          style={styles.nudgeButton}
                          onPress={() =>
                            handleSendNudge(friend.id, friend.name)
                          }
                        >
                          <Bell color="#FFFFFF" size={16} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          handleRemoveFriend(friend.id, friend.name)
                        }
                      >
                        <Trash2 color="#EF4444" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {nudges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>Nudges</Text>
              {unreadNudgesCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNudgesCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.nudgesList}>
              {nudges.slice(0, 5).map((nudge) => (
                <TouchableOpacity
                  key={nudge.id}
                  style={[styles.nudgeCard, !nudge.read && styles.nudgeUnread]}
                  onPress={() => markNudgeAsRead(nudge.id)}
                >
                  <View style={styles.nudgeContent}>
                    <Text style={styles.nudgeName}>{nudge.fromName}</Text>
                    <Text style={styles.nudgeMessage}>{nudge.message}</Text>
                    <Text style={styles.nudgeTime}>
                      {formatTime(nudge.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
    marginLeft: 8,
  },
  codeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  code: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#0EA5E9",
    letterSpacing: 2,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
  },
  nameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nameEditContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#0C4A6E",
  },
  saveButton: {
    marginLeft: 12,
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  nameDisplay: {
    flexDirection: "column" as const,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  nameHint: {
    fontSize: 12,
    color: "#94A3B8",
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F9FF",
  },
  settingLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    marginLeft: 12,
  },
  settingSubText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 12,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    padding: 2,
    justifyContent: "center" as const,
  },
  toggleActive: {
    backgroundColor: "#0EA5E9",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end" as const,
  },
  leaderboardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardEntry: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F9FF",
  },
  myEntry: {
    backgroundColor: "#E0F2FE",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  leaderboardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  rankGold: {
    backgroundColor: "#FCD34D",
  },
  rankSilver: {
    backgroundColor: "#D1D5DB",
  },
  rankBronze: {
    backgroundColor: "#FCA574",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#64748B",
  },
  rankTextTop: {
    color: "#FFFFFF",
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0C4A6E",
  },
  leaderboardProgress: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  leaderboardRight: {
    alignItems: "flex-end" as const,
  },
  percentage: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0EA5E9",
  },
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#0EA5E9",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
    marginLeft: 8,
  },
  addFriendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0F2FE",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#0C4A6E",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    alignItems: "center" as const,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#0EA5E9",
    alignItems: "center" as const,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  friendsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F9FF",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    marginBottom: 6,
  },
  friendStats: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#64748B",
  },
  inactiveText: {
    fontSize: 12,
    color: "#EF4444",
  },
  friendActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  nudgeButton: {
    backgroundColor: "#F59E0B",
    padding: 10,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
  },
  nudgesList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nudgeCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  nudgeUnread: {
    backgroundColor: "#FEF3C7",
  },
  nudgeContent: {
    flexDirection: "column" as const,
  },
  nudgeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  nudgeMessage: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  nudgeTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  bottomPadding: {
    height: 30,
  },
  limitCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 8,
  },
  limitText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});

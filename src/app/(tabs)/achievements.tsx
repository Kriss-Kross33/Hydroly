import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useFriends } from "@/contexts/FriendsContext";
import {
  Trophy,
  Flame,
  Lock,
  Sparkles,
  Users,
  ChevronRight,
} from "lucide-react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";

export default function AchievementsScreen() {
  const { badges, streak, earnedBadges, milestones } = useAchievements();
  const { premium } = useSettings();
  const { friends } = useFriends();
  const router = useRouter();

  const allBadges = useMemo(() => Object.values(badges), [badges]);
  const lockedBadges = useMemo(
    () => allBadges.filter((b) => !b.isEarned),
    [allBadges]
  );

  const isPremiumFeature = !premium.isPremium;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isPremiumFeature && (
        <View style={styles.premiumBanner}>
          <Sparkles size={20} color="#F59E0B" />
          <Text style={styles.premiumText}>
            Unlock full achievements with Premium
          </Text>
          <Sparkles size={20} color="#F59E0B" />
        </View>
      )}

      <TouchableOpacity
        style={styles.friendsCard}
        onPress={() => router.push("/friends")}
        activeOpacity={0.7}
      >
        <View style={styles.friendsContent}>
          <Users size={28} color="#0EA5E9" />
          <View style={styles.friendsInfo}>
            <Text style={styles.friendsTitle}>Friends</Text>
            <Text style={styles.friendsSubtitle}>
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </Text>
          </View>
        </View>
        <ChevronRight size={24} color="#94A3B8" />
      </TouchableOpacity>

      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Flame size={32} color="#F59E0B" fill="#F59E0B" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Current Streak</Text>
            <Text style={styles.streakCount}>{streak.current} days</Text>
          </View>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakStatLabel}>Longest Streak</Text>
            <Text style={styles.streakStatValue}>{streak.longest} days</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestonesGrid}>
          {milestones.map((milestone) => (
            <View
              key={milestone.days}
              style={[
                styles.milestoneCard,
                milestone.reached && styles.milestoneCardReached,
              ]}
            >
              <Trophy
                size={28}
                color={milestone.reached ? "#10B981" : "#94A3B8"}
                fill={milestone.reached ? "#10B981" : "transparent"}
              />
              <Text
                style={[
                  styles.milestoneText,
                  milestone.reached && styles.milestoneTextReached,
                ]}
              >
                {milestone.days} Days
              </Text>
              {milestone.reached && (
                <Text style={styles.milestoneDate}>
                  {new Date(milestone.reachedAt!).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earned Badges</Text>
          <Text style={styles.sectionCount}>{earnedBadges.length}</Text>
        </View>
        {earnedBadges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {earnedBadges.map((badge) => (
              <View
                key={badge.id}
                style={[styles.badgeCard, { borderColor: badge.color }]}
              >
                <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {badge.description}
                </Text>
                {badge.earnedAt && (
                  <Text style={styles.badgeDate}>
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Trophy size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No badges earned yet</Text>
            <Text style={styles.emptySubtext}>
              Keep hydrating to unlock achievements!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Locked Badges</Text>
          <Text style={styles.sectionCount}>{lockedBadges.length}</Text>
        </View>
        <View style={styles.badgesGrid}>
          {lockedBadges.slice(0, 6).map((badge) => (
            <View key={badge.id} style={styles.lockedBadgeCard}>
              <Lock size={24} color="#94A3B8" />
              <Text style={styles.lockedBadgeName}>{badge.name}</Text>
              <Text style={styles.lockedBadgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  friendsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  friendsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  friendsInfo: {
    flex: 1,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  friendsSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  streakCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#F59E0B",
  },
  streakDivider: {
    height: 1,
    backgroundColor: "#E0F2FE",
    marginVertical: 16,
  },
  streakStats: {
    flexDirection: "row",
  },
  streakStat: {
    flex: 1,
  },
  streakStatLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  streakStatValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  sectionCount: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0EA5E9",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  milestonesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  milestoneCardReached: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748B",
    marginTop: 8,
  },
  milestoneTextReached: {
    color: "#10B981",
  },
  milestoneDate: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0C4A6E",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: "#94A3B8",
  },
  lockedBadgeCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    opacity: 0.6,
  },
  lockedBadgeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  lockedBadgeDescription: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#64748B",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },
});

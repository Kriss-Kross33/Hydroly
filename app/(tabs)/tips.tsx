import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { HYDRATION_TIPS } from '@/constants/tips';
import { 
  Zap, 
  Brain, 
  Heart, 
  Sparkles, 
  Thermometer, 
  Shield, 
  Activity, 
  Target,
  Droplet,
} from 'lucide-react-native';

const iconMap: Record<string, any> = {
  zap: Zap,
  brain: Brain,
  heart: Heart,
  sparkles: Sparkles,
  thermometer: Thermometer,
  shield: Shield,
  activity: Activity,
  target: Target,
};

const colorMap: Record<string, { bg: string; icon: string }> = {
  zap: { bg: '#FEF3C7', icon: '#F59E0B' },
  brain: { bg: '#E0E7FF', icon: '#6366F1' },
  heart: { bg: '#FCE7F3', icon: '#EC4899' },
  sparkles: { bg: '#FEF3C7', icon: '#EAB308' },
  thermometer: { bg: '#FFEDD5', icon: '#F97316' },
  shield: { bg: '#D1FAE5', icon: '#10B981' },
  activity: { bg: '#DBEAFE', icon: '#3B82F6' },
  target: { bg: '#E0F2FE', icon: '#0EA5E9' },
};

export default function TipsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Droplet size={32} color="#0EA5E9" />
        </View>
        <Text style={styles.headerTitle}>Why Hydration Matters</Text>
        <Text style={styles.headerSubtitle}>
          Discover the amazing benefits of staying hydrated and how water transforms your health
        </Text>
      </View>

      <View style={styles.tipsContainer}>
        {HYDRATION_TIPS.map((tip, index) => {
          const IconComponent = iconMap[tip.icon];
          const colors = colorMap[tip.icon];

          return (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIconContainer, { backgroundColor: colors.bg }]}>
                  <IconComponent size={24} color={colors.icon} />
                </View>
                <Text style={styles.tipNumber}>#{index + 1}</Text>
              </View>
              
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Daily Hydration Tips</Text>
          <View style={styles.footerList}>
            <Text style={styles.footerItem}>💧 Start your day with a glass of water</Text>
            <Text style={styles.footerItem}>⏰ Set hourly reminders to drink</Text>
            <Text style={styles.footerItem}>🍽️ Drink water before each meal</Text>
            <Text style={styles.footerItem}>🏃 Hydrate before, during, and after exercise</Text>
            <Text style={styles.footerItem}>🥤 Keep a water bottle with you</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  tipsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#94A3B8',
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0C4A6E',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
  },
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0C4A6E',
    marginBottom: 16,
  },
  footerList: {
    gap: 12,
  },
  footerItem: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
});

import { StyleSheet, Text, View, Pressable, ScrollView, Animated, Modal } from 'react-native';
import { useWater } from '@/contexts/WaterContext';
import { useAchievements } from '@/contexts/AchievementsContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter } from 'expo-router';
import { Droplet, Minus, Plus, X, Lightbulb, Coffee, Wine, Droplets, Coffee as Tea } from 'lucide-react-native';
import { useEffect, useRef, useState, useMemo } from 'react';
import { BeverageType, BEVERAGE_INFO } from '@/types/beverage';
import { HYDRATION_TIPS } from '@/constants/tips';

export default function HomeScreen() {
  const { getTodayRecord, addWater, removeWater, dailyGoal } = useWater();
  const { updateStreak, unlockBadge } = useAchievements();
  const { features, markUpsellTriggered, shouldShowUpsell } = useSubscription();
  const router = useRouter();
  const todayRecord = getTodayRecord();
  const percentage = Math.min(
    dailyGoal.goal > 0 ? (todayRecord.netHydration / dailyGoal.goal) * 100 : 0,
    100
  );
  
  const [showBeverageModal, setShowBeverageModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(250);
  
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(fillAnimation, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [percentage, fillAnimation]);

  useEffect(() => {
    updateStreak(todayRecord.goalAchieved, todayRecord.date);
    if (todayRecord.goalAchieved && todayRecord.entries.length === 1) {
      unlockBadge('first_day');
    }
    if (todayRecord.netHydration > 3000) {
      unlockBadge('hydration_hero');
    }
  }, [todayRecord.goalAchieved, todayRecord.netHydration, todayRecord.entries.length, todayRecord.date, updateStreak, unlockBadge]);

  const handleAddWater = (amount: number, beverageType: BeverageType = 'water') => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    addWater(amount, beverageType);
    setShowBeverageModal(false);
  };

  const interpolatedHeight = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const interpolatedColor = fillAnimation.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['#E0F2FE', '#38BDF8', '#0EA5E9'],
  });

  const quickAmounts = [250, 500, 750, 1000];

  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return HYDRATION_TIPS[dayOfYear % HYDRATION_TIPS.length];
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Stay Hydrated</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <Animated.View style={[styles.waterContainer, { transform: [{ scale: scaleAnimation }] }]}>
        <View style={styles.glassOuter}>
          <View style={styles.glass}>
            <Animated.View 
              style={[
                styles.waterFill,
                { 
                  height: interpolatedHeight,
                  backgroundColor: interpolatedColor,
                }
              ]} 
            />
            <View style={styles.glassOverlay}>
              <Droplet size={48} color="#0EA5E9" strokeWidth={2} />
              <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
              <Text style={styles.amount}>{Math.round(todayRecord.netHydration)}ml</Text>
              <Text style={styles.goal}>of {dailyGoal.goal}ml</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Add Water</Text>
        <View style={styles.buttonGrid}>
          {quickAmounts.map((amount) => (
            <Pressable 
              key={amount}
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              onPress={() => handleAddWater(amount, 'water')}
            >
              <Text style={styles.addButtonAmount}>{amount}ml</Text>
              <Text style={styles.addButtonLabel}>
                {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'Liter'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {features.beverageIntelligence && (
        <View style={styles.beverageSection}>
          <Text style={styles.sectionTitle}>Other Beverages</Text>
          <Pressable 
            style={({ pressed }) => [styles.beverageButton, pressed && styles.addButtonPressed]}
            onPress={() => setShowBeverageModal(true)}
          >
            <Plus size={20} color="#0EA5E9" />
            <Text style={styles.beverageButtonText}>Track Other Drink</Text>
          </Pressable>
        </View>
      )}

      {!features.beverageIntelligence && (
        <Pressable 
          style={styles.premiumCta}
          onPress={() => {
            if (shouldShowUpsell('beverage_track')) {
              markUpsellTriggered('beverage_track');
            }
            router.push('/paywall');
          }}
        >
          <Text style={styles.premiumCtaText}>Track coffee, tea, and more with Pro</Text>
          <Text style={styles.premiumCtaButton}>Upgrade</Text>
        </Pressable>
      )}

      <View style={styles.tipSection}>
        <View style={styles.tipHeader}>
          <Lightbulb size={20} color="#F59E0B" />
          <Text style={styles.tipHeaderText}>Daily Tip</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>{dailyTip.title}</Text>
          <Text style={styles.tipDescription}>{dailyTip.description}</Text>
        </View>
      </View>

      {todayRecord.entries.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Today&apos;s Log</Text>
          {todayRecord.entries.slice().reverse().map((entry) => {
            const beverage = BEVERAGE_INFO[entry.beverageType || 'water'];
            return (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryInfo}>
                  <View style={styles.entryIconWrapper}>
                    {entry.beverageType === 'water' && <Droplet size={24} color="#0EA5E9" fill="#0EA5E9" />}
                    {entry.beverageType === 'coffee' && <Coffee size={24} color="#92400E" />}
                    {entry.beverageType === 'tea' && <Tea size={24} color="#10B981" />}
                    {entry.beverageType === 'juice' && <Droplets size={24} color="#F59E0B" />}
                    {entry.beverageType === 'soda' && <Droplets size={24} color="#EF4444" />}
                    {entry.beverageType === 'alcohol' && <Wine size={24} color="#7C3AED" />}
                  </View>
                  <View>
                    <Text style={styles.entryAmount}>{entry.amount}ml {beverage.name}</Text>
                    {entry.netHydration !== entry.amount && (
                      <Text style={styles.entryNet}>Net: {Math.round(entry.netHydration || entry.amount)}ml</Text>
                    )}
                  </View>
                  <Text style={styles.entryTime}>
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Text>
                </View>
                <Pressable 
                  onPress={() => removeWater(entry.id)}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
                >
                  <Minus size={18} color="#EF4444" />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={showBeverageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBeverageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Beverage</Text>
              <Pressable onPress={() => setShowBeverageModal(false)}>
                <X size={24} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.amountSelector}>
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountButtons}>
                {[250, 350, 500, 750].map((amount) => (
                  <Pressable
                    key={amount}
                    style={[
                      styles.amountButton,
                      selectedAmount === amount && styles.amountButtonActive,
                    ]}
                    onPress={() => setSelectedAmount(amount)}
                  >
                    <Text
                      style={[
                        styles.amountButtonText,
                        selectedAmount === amount && styles.amountButtonTextActive,
                      ]}
                    >
                      {amount}ml
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <ScrollView style={styles.beverageList}>
              {(Object.keys(BEVERAGE_INFO) as BeverageType[])
                .filter(key => key !== 'water')
                .map((beverageType) => {
                  const beverage = BEVERAGE_INFO[beverageType];
                  const BeverageIcon = beverageType === 'coffee' ? Coffee :
                                       beverageType === 'tea' ? Tea :
                                       beverageType === 'alcohol' ? Wine : Droplets;
                  const iconColor = beverageType === 'coffee' ? '#92400E' :
                                   beverageType === 'tea' ? '#10B981' :
                                   beverageType === 'juice' ? '#F59E0B' :
                                   beverageType === 'soda' ? '#EF4444' : '#7C3AED';
                  return (
                    <Pressable
                      key={beverageType}
                      style={({ pressed }) => [
                        styles.beverageOption,
                        pressed && styles.beverageOptionPressed,
                      ]}
                      onPress={() => handleAddWater(selectedAmount, beverageType)}
                    >
                      <View style={styles.beverageIconWrapper}>
                        <BeverageIcon size={32} color={iconColor} />
                      </View>
                      <View style={styles.beverageInfo}>
                        <Text style={styles.beverageName}>{beverage.name}</Text>
                      </View>
                    </Pressable>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 32,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 17,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  waterContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glassOuter: {
    padding: 8,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  glass: {
    width: 200,
    height: 280,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E0F2FE',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAFBFC',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 20,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  percentage: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginTop: 8,
    letterSpacing: -1,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0EA5E9',
    letterSpacing: -0.5,
  },
  goal: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  addButtonAmount: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#0EA5E9',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  addButtonLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  beverageSection: {
    marginBottom: 24,
  },
  beverageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    borderStyle: 'dashed',
  },
  beverageButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0EA5E9',
  },
  premiumCta: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumCtaText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#92400E',
    flex: 1,
  },
  premiumCtaButton: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0EA5E9',
  },
  tipSection: {
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipHeaderText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    letterSpacing: -0.5,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#92400E',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tipDescription: {
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  historySection: {
    marginBottom: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  entryIconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryAmount: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0C4A6E',
  },
  entryNet: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  entryTime: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  removeButtonPressed: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    letterSpacing: -0.5,
  },
  amountSelector: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0C4A6E',
    marginBottom: 12,
  },
  amountButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  amountButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  amountButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  amountButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#64748B',
  },
  amountButtonTextActive: {
    color: '#FFFFFF',
  },
  beverageList: {
    maxHeight: 400,
  },
  beverageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
  },
  beverageOptionPressed: {
    backgroundColor: '#E0F2FE',
  },
  beverageIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beverageInfo: {
    flex: 1,
  },
  beverageName: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#0C4A6E',
  },
});

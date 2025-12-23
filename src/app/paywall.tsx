import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription, SUBSCRIPTION_PLANS } from '@/contexts/SubscriptionContext';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react-native';
import { useState } from 'react';

export default function PaywallScreen() {
  const router = useRouter();
  const { purchase, startTrial, isOnTrial, getTrialDaysRemaining } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState('pro_yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const proPlans = SUBSCRIPTION_PLANS.filter(p => p.tier === 'pro');
  const trialDays = getTrialDaysRemaining();

  const handlePurchase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await purchase(selectedPlanId);
    setIsProcessing(false);
    router.back();
  };

  const handleStartTrial = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await startTrial();
    setIsProcessing(false);
    router.back();
  };

  const proFeatures = [
    { name: 'No ads', icon: X },
    { name: 'Smart hydration goals', icon: Zap },
    { name: 'Advanced reminders', icon: Sparkles },
    { name: 'Monthly & yearly reports', icon: Check },
    { name: 'Beverage intelligence', icon: Check },
    { name: 'Recovery mode', icon: Check },
    { name: 'Cloud sync', icon: Check },
    { name: 'Data export', icon: Check },
    { name: 'Custom routines', icon: Check },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#64748B" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Crown size={48} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features to build the perfect hydration habit
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {proFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon size={20} color="#0EA5E9" />
                </View>
                <Text style={styles.featureText}>{feature.name}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.plansSectionTitle}>Choose Your Plan</Text>
          {proPlans.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlanId === plan.id && styles.planCardSelected,
                plan.isPopular && styles.planCardPopular,
              ]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                </View>
              )}
              <View style={styles.planContent}>
                <View style={styles.planInfo}>
                  <Text style={styles.planPeriod}>
                    {plan.period === 'monthly' && 'Monthly'}
                    {plan.period === 'yearly' && 'Yearly'}
                    {plan.period === 'lifetime' && 'Lifetime'}
                  </Text>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                </View>
                <Text style={styles.planPrice}>{plan.displayPrice}</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPlanId === plan.id && styles.radioButtonSelected,
              ]}>
                {selectedPlanId === plan.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {!isOnTrial && (
          <Pressable
            style={({ pressed }) => [
              styles.trialButton,
              pressed && styles.trialButtonPressed,
            ]}
            onPress={handleStartTrial}
            disabled={isProcessing}
          >
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={styles.trialButtonText}>
              Start 7-Day Free Trial
            </Text>
          </Pressable>
        )}

        {isOnTrial && trialDays !== null && (
          <View style={styles.trialBanner}>
            <Text style={styles.trialBannerText}>
              {trialDays} days left in your trial
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.purchaseButton,
            pressed && styles.purchaseButtonPressed,
          ]}
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          <Text style={styles.purchaseButtonText}>
            {isProcessing ? 'Processing...' : 'Continue'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Cancel anytime. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
        </Text>

        <Pressable
          style={styles.restoreButton}
          onPress={() => {}}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500' as const,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#0C4A6E',
    fontWeight: '600' as const,
    flex: 1,
  },
  plansSection: {
    marginBottom: 24,
  },
  plansSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  planCardPopular: {
    borderColor: '#F59E0B',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planContent: {
    flex: 1,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0C4A6E',
  },
  planSavings: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#0EA5E9',
    letterSpacing: -0.5,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#0EA5E9',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0EA5E9',
  },
  trialButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trialButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  trialButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  trialBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  trialBannerText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  purchaseButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  disclaimer: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#0EA5E9',
  },
});

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Check,
  Briefcase,
  Users,
  MessageSquare,
  Star,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isRevenueCatEnabled,
} from '@/lib/revenuecatClient';
import type { PurchasesPackage } from 'react-native-purchases';

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Unlimited Job Leads',
    description: 'Access all job requests from clients in your area',
  },
  {
    icon: Users,
    title: 'Direct Client Contact',
    description: 'Reach out to potential clients directly',
  },
  {
    icon: MessageSquare,
    title: 'Priority Messaging',
    description: 'Your messages appear first to clients',
  },
  {
    icon: Star,
    title: 'Featured Profile',
    description: 'Stand out in search results',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    if (!isRevenueCatEnabled()) {
      setError('Subscriptions are only available on mobile devices');
      setIsLoading(false);
      return;
    }

    const result = await getOfferings();
    if (result.ok && result.data.current) {
      const pkg = result.data.current.availablePackages.find(
        (p) => p.identifier === '$rc_monthly'
      );
      setMonthlyPackage(pkg ?? null);
    } else {
      setError('Unable to load subscription options');
    }
    setIsLoading(false);
  };

  const handlePurchase = async () => {
    if (!monthlyPackage) return;

    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await purchasePackage(monthlyPackage);
    setIsPurchasing(false);

    if (result.ok) {
      const hasLeadsAccess = result.data.entitlements.active?.['leads_access'];
      if (hasLeadsAccess) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Welcome to Pro!',
          'You now have full access to job leads. Start connecting with clients!',
          [{ text: 'Get Started', onPress: () => router.back() }]
        );
      }
    } else if (result.reason === 'sdk_error') {
      // User likely cancelled - don't show error
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await restorePurchases();
    setIsRestoring(false);

    if (result.ok) {
      const hasLeadsAccess = result.data.entitlements.active?.['leads_access'];
      if (hasLeadsAccess) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored!', 'Your subscription has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'We could not find an active subscription to restore.');
      }
    } else {
      Alert.alert('Error', 'Unable to restore purchases. Please try again.');
    }
  };

  const price = monthlyPackage?.product?.priceString ?? '$9.99';

  return (
    <View className="flex-1 bg-skillset-bg-dark">
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#0D2830', '#0A1A1F', '#0A1A1F']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Close button */}
          <View className="absolute top-14 right-4 z-10">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <X color="white" size={24} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="items-center pt-8 pb-6 px-6"
            >
              <View className="w-20 h-20 rounded-2xl bg-skillset-teal/20 items-center justify-center mb-4">
                <Zap color="#4A9BAD" size={40} fill="#4A9BAD" />
              </View>
              <Text className="text-white text-3xl font-bold text-center mb-2">
                Skillset Pro
              </Text>
              <Text className="text-slate-400 text-center text-base">
                Unlock unlimited access to job leads{'\n'}and grow your business
              </Text>
            </Animated.View>

            {/* Features */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="px-6 mb-8"
            >
              {FEATURES.map((feature, index) => (
                <Animated.View
                  key={feature.title}
                  entering={FadeInDown.delay(300 + index * 100).duration(400)}
                  className="flex-row items-center bg-skillset-bg-card/50 rounded-xl p-4 mb-3 border border-skillset-border/50"
                >
                  <View className="w-12 h-12 rounded-full bg-skillset-teal/20 items-center justify-center mr-4">
                    <feature.icon color="#4A9BAD" size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base">
                      {feature.title}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      {feature.description}
                    </Text>
                  </View>
                  <Check color="#4A9BAD" size={20} />
                </Animated.View>
              ))}
            </Animated.View>

            {/* Pricing */}
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#4A9BAD" size="large" />
              </View>
            ) : error ? (
              <View className="px-6 mb-6">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            ) : (
              <Animated.View
                entering={FadeInUp.delay(500).duration(500)}
                className="px-6"
              >
                {/* Price card */}
                <View className="bg-skillset-bg-card rounded-2xl p-6 mb-4 border-2 border-skillset-teal">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white text-lg font-semibold">
                      Monthly
                    </Text>
                    <View className="bg-skillset-teal/20 px-3 py-1 rounded-full">
                      <Text className="text-skillset-teal text-xs font-semibold">
                        BEST VALUE
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-4xl font-bold">{price}</Text>
                    <Text className="text-slate-400 text-base ml-1">/month</Text>
                  </View>
                  <Text className="text-slate-400 text-sm mt-2">
                    Cancel anytime. No commitment.
                  </Text>
                </View>

                {/* Subscribe button */}
                <Pressable
                  onPress={handlePurchase}
                  disabled={isPurchasing || !monthlyPackage}
                  className="mb-4"
                >
                  <LinearGradient
                    colors={['#4A9BAD', '#3A8A9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      paddingVertical: 18,
                      opacity: isPurchasing ? 0.7 : 1,
                    }}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-bold text-lg">
                        Subscribe Now
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Restore purchases */}
                <Pressable
                  onPress={handleRestore}
                  disabled={isRestoring}
                  className="py-3"
                >
                  {isRestoring ? (
                    <ActivityIndicator color="#4A9BAD" size="small" />
                  ) : (
                    <Text className="text-skillset-teal text-center font-medium">
                      Restore Purchases
                    </Text>
                  )}
                </Pressable>

                {/* Terms */}
                <Text className="text-slate-500 text-xs text-center mt-4 px-4">
                  Payment will be charged to your App Store account. Subscription
                  automatically renews unless canceled at least 24 hours before the
                  end of the current period.
                </Text>
              </Animated.View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

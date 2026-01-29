import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { ProfessionalProfile } from '@/lib/types';
import { format } from 'date-fns';

const MAX_CHARS = 150;

export default function EditBannerScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfessionalProfile = useAuthStore((s) => s.updateProfessionalProfile);

  const professionalUser = user as ProfessionalProfile;
  const existingBanner = professionalUser?.banner;

  const [bannerText, setBannerText] = useState(existingBanner?.text ?? '');
  const [hasExpiration, setHasExpiration] = useState(!!existingBanner?.expiresAt);
  const [expirationDate, setExpirationDate] = useState<Date>(
    existingBanner?.expiresAt ? new Date(existingBanner.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!bannerText.trim()) {
      setError('Please enter your banner message');
      return;
    }

    if (bannerText.length > MAX_CHARS) {
      setError(`Banner must be ${MAX_CHARS} characters or less`);
      return;
    }

    const banner = {
      text: bannerText.trim(),
      expiresAt: hasExpiration ? expirationDate.toISOString() : undefined,
      createdAt: existingBanner?.createdAt ?? new Date().toISOString(),
    };

    updateProfessionalProfile({ banner });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Banner Updated', 'Your special offer is now live!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleRemoveBanner = () => {
    Alert.alert('Remove Banner', 'Are you sure you want to remove your banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          updateProfessionalProfile({ banner: undefined });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  };

  if (!user || user.role !== 'professional') {
    return (
      <View className="flex-1 bg-skillset-bg-dark items-center justify-center">
        <Text className="text-white">Only professionals can create banners</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-skillset-bg-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#122A30' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Special Offer Banner',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-6">
            {/* Preview */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Preview</Text>
              {bannerText.trim() ? (
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, padding: 12 }}
                >
                  <View className="flex-row items-center">
                    <Sparkles color="white" size={18} />
                    <Text className="text-white font-medium ml-2 flex-1">
                      {bannerText.trim()}
                    </Text>
                  </View>
                </LinearGradient>
              ) : (
                <View className="bg-skillset-bg-card rounded-xl p-4 items-center border border-dashed border-skillset-border">
                  <Megaphone color="#5A7A82" size={24} />
                  <Text className="text-slate-400 text-center mt-2">
                    Your banner preview will appear here
                  </Text>
                </View>
              )}
            </View>

            {/* Banner Text Input */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">Your Message</Text>
                <Text
                  className={`text-sm ${
                    bannerText.length > MAX_CHARS ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {bannerText.length}/{MAX_CHARS}
                </Text>
              </View>
              <TextInput
                className="bg-skillset-bg-card rounded-xl px-4 py-3 text-white text-base border border-skillset-border min-h-[100px]"
                placeholder="e.g. 20% off all electrical work this month! Book now and save."
                placeholderTextColor="#5A7A82"
                value={bannerText}
                onChangeText={setBannerText}
                multiline
                textAlignVertical="top"
                maxLength={MAX_CHARS + 10}
              />
            </View>

            {/* Expiration Toggle */}
            <View className="mb-6">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHasExpiration(!hasExpiration);
                }}
                className="flex-row items-center justify-between bg-skillset-bg-card rounded-xl p-4"
              >
                <View className="flex-row items-center">
                  <Calendar color="#5A7A82" size={20} />
                  <Text className="text-white font-medium ml-3">Set Expiration Date</Text>
                </View>
                <View
                  className={`w-12 h-7 rounded-full justify-center ${
                    hasExpiration ? 'bg-skillset-teal' : 'bg-skillset-bg-input'
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full bg-white mx-1 ${
                      hasExpiration ? 'self-end' : 'self-start'
                    }`}
                  />
                </View>
              </Pressable>

              {hasExpiration && (
                <View className="mt-3">
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="bg-skillset-bg-input rounded-xl p-4 flex-row items-center justify-between"
                  >
                    <Text className="text-white">
                      Expires: {format(expirationDate, 'MMM d, yyyy')}
                    </Text>
                    <Calendar color="#4A9BAD" size={18} />
                  </Pressable>

                  {showDatePicker && (
                    <DateTimePicker
                      value={expirationDate}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (date) setExpirationDate(date);
                      }}
                      textColor="white"
                    />
                  )}
                </View>
              )}
            </View>

            {/* Tips */}
            <View className="bg-skillset-bg-card/50 rounded-xl p-4 mb-6">
              <Text className="text-skillset-teal font-semibold mb-2">Tips for a great banner:</Text>
              <Text className="text-slate-400 text-sm leading-5">
                • Keep it short and attention-grabbing{'\n'}
                • Include specific discounts or offers{'\n'}
                • Add urgency (limited time, first 10 customers){'\n'}
                • Mention the service type
              </Text>
            </View>

            {error ? (
              <Text className="text-red-400 text-center mb-4">{error}</Text>
            ) : null}

            {/* Save Button */}
            <Pressable onPress={handleSave}>
              <LinearGradient
                colors={['#4A9BAD', '#3A7A8A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 16 }}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {existingBanner ? 'Update Banner' : 'Create Banner'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Remove Banner */}
            {existingBanner && (
              <Pressable
                onPress={handleRemoveBanner}
                className="mt-3 py-4"
              >
                <Text className="text-red-400 text-center font-medium">
                  Remove Banner
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

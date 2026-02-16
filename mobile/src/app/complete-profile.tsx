import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Award, FileText, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { ProfessionalProfile } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfessionalProfile = useAuthStore((s) => s.updateProfessionalProfile);

  const [trade, setTrade] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [serviceAreas, setServiceAreas] = useState(user?.city ?? '');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleComplete = () => {
    if (!trade) {
      setError('Please enter your trade/profession');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one service category');
      return;
    }

    if (!yearsExperience || isNaN(Number(yearsExperience))) {
      setError('Please enter valid years of experience');
      return;
    }

    if (!description) {
      setError('Please add a description of your services');
      return;
    }

    const updates: Partial<ProfessionalProfile> = {
      trade,
      serviceCategories: selectedCategories,
      yearsExperience: Number(yearsExperience),
      licenseNumber: licenseNumber || undefined,
      serviceArea: serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      description,
    };

    updateProfessionalProfile(updates);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#1A1D23', '#252932', '#2D323C']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 pt-6">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-workly-teal rounded-2xl items-center justify-center mb-4">
                  <Briefcase color="white" size={32} />
                </View>
                <Text className="text-white text-2xl font-bold">
                  Complete Your Profile
                </Text>
                <Text className="text-slate-400 mt-2 text-center">
                  Help clients find you by adding your professional details
                </Text>
              </View>

              {/* Trade */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  Your Trade/Profession
                </Text>
                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <Award color="#6B7280" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="e.g., Electrician, Plumber, Cleaner"
                    placeholderTextColor="#6B7280"
                    value={trade}
                    onChangeText={setTrade}
                  />
                </View>
              </View>

              {/* Service Categories */}
              <View className="mb-6">
                <CategoryDropdown
                  value={null}
                  onChange={() => {}}
                  multiSelect
                  selectedValues={selectedCategories}
                  onMultiChange={setSelectedCategories}
                  label="Service Categories (select all that apply)"
                  placeholder="Select categories"
                />
              </View>

              {/* Years Experience */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  Years of Experience
                </Text>
                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <TextInput
                    className="flex-1 text-white text-base"
                    placeholder="e.g., 5"
                    placeholderTextColor="#6B7280"
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* License Number */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  License Number (optional)
                </Text>
                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <FileText color="#6B7280" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Your professional license number"
                    placeholderTextColor="#6B7280"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                  />
                </View>
              </View>

              {/* Service Areas */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  Service Areas (comma separated)
                </Text>
                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <MapPin color="#6B7280" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="e.g., Los Angeles, Santa Monica, Pasadena"
                    placeholderTextColor="#6B7280"
                    value={serviceAreas}
                    onChangeText={setServiceAreas}
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  About Your Services
                </Text>
                <View className="bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <TextInput
                    className="text-white text-base min-h-[100px]"
                    placeholder="Describe your services, experience, and what makes you stand out..."
                    placeholderTextColor="#6B7280"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {error ? (
                <Text className="text-red-400 text-center mb-4">{error}</Text>
              ) : null}

              <Pressable onPress={handleComplete}>
                <LinearGradient
                  colors={['#6B8AFE', '#4A6BE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, paddingVertical: 16 }}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Complete Profile
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

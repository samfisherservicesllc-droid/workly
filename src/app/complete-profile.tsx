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
import { Check, Briefcase, Award, FileText, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
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

  const toggleCategory = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
        colors={['#0F172A', '#1E293B', '#334155']}
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
                <View className="w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center mb-4">
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
                <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700">
                  <Award color="#94A3B8" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="e.g., Electrician, Plumber, Cleaner"
                    placeholderTextColor="#64748B"
                    value={trade}
                    onChangeText={setTrade}
                  />
                </View>
              </View>

              {/* Service Categories */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  Service Categories (select all that apply)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => toggleCategory(category.id)}
                        className={`px-4 py-2 rounded-full border ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <View className="flex-row items-center">
                          {isSelected && <Check color="white" size={14} className="mr-1" />}
                          <Text
                            className={isSelected ? 'text-white font-medium' : 'text-slate-300'}
                          >
                            {category.name}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Years Experience */}
              <View className="mb-6">
                <Text className="text-white font-semibold mb-2">
                  Years of Experience
                </Text>
                <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700">
                  <TextInput
                    className="flex-1 text-white text-base"
                    placeholder="e.g., 5"
                    placeholderTextColor="#64748B"
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
                <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700">
                  <FileText color="#94A3B8" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Your professional license number"
                    placeholderTextColor="#64748B"
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
                <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700">
                  <MapPin color="#94A3B8" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="e.g., Los Angeles, Santa Monica, Pasadena"
                    placeholderTextColor="#64748B"
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
                <View className="bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700">
                  <TextInput
                    className="text-white text-base min-h-[100px]"
                    placeholder="Describe your services, experience, and what makes you stand out..."
                    placeholderTextColor="#64748B"
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
                  colors={['#F59E0B', '#D97706']}
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

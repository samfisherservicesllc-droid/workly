import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Briefcase,
  UserCircle,
  MapPin,
  Clock,
  Award,
  FileText,
  MessageSquare,
  Star,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/state/auth-store';
import { useMessagesStore } from '@/lib/state/messages-store';
import { getCategoryById } from '@/lib/categories';
import { User, ProfessionalProfile } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function ProfileViewScreen() {
  const { id: profileId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const startConversation = useMessagesStore((s) => s.startConversation);
  const findExistingConversation = useMessagesStore((s) => s.findExistingConversation);

  // Fetch user from stored users
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('registered-users');
      const users: User[] = stored ? JSON.parse(stored) : [];
      return users.find((u) => u.id === profileId) ?? null;
    },
    enabled: !!profileId,
  });

  const handleMessage = () => {
    if (!currentUser || !profileUser) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if conversation exists
    const existing = findExistingConversation(currentUser.id, profileUser.id);

    if (existing) {
      router.push(`/conversation/${existing.id}`);
    } else {
      // Start new conversation
      const conversationId = startConversation(
        currentUser.id,
        currentUser.name,
        currentUser.photoUrl,
        currentUser.role,
        profileUser.id,
        profileUser.name,
        profileUser.photoUrl,
        profileUser.role
      );
      router.push(`/conversation/${conversationId}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">User not found</Text>
      </View>
    );
  }

  const isProfessional = profileUser.role === 'professional';
  const professionalUser = profileUser as ProfessionalProfile;
  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#FFFFFF',
          headerTitle: profileUser.name,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={{ paddingTop: 20, paddingBottom: 30 }}
        >
          <View className="items-center px-6">
            <View
              className={`w-24 h-24 rounded-full items-center justify-center ${
                isProfessional ? 'bg-amber-500/20' : 'bg-blue-500/20'
              }`}
            >
              {profileUser.photoUrl ? (
                <Image
                  source={{ uri: profileUser.photoUrl }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : isProfessional ? (
                <Briefcase color="#F59E0B" size={40} />
              ) : (
                <UserCircle color="#3B82F6" size={40} />
              )}
            </View>

            <Text className="text-white text-2xl font-bold mt-4">{profileUser.name}</Text>

            <View className="flex-row items-center mt-2">
              <View
                className={`px-3 py-1 rounded-full ${
                  isProfessional ? 'bg-amber-500/20' : 'bg-blue-500/20'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isProfessional ? 'text-amber-400' : 'text-blue-400'
                  }`}
                >
                  {isProfessional ? 'Professional' : 'Client'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-3">
              <MapPin color="#94A3B8" size={16} />
              <Text className="text-slate-400 ml-1">{profileUser.city}</Text>
            </View>

            {/* Message Button */}
            {!isOwnProfile && (
              <Pressable
                onPress={handleMessage}
                className="mt-6 flex-row items-center"
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <MessageSquare color="white" size={20} />
                  <Text className="text-white font-semibold ml-2">Send Message</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* Professional Details */}
        {isProfessional && (
          <View className="px-6 mt-6">
            {/* Trade */}
            {professionalUser.trade && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Award color="#F59E0B" size={20} />
                  <Text className="text-white font-semibold ml-2">Trade</Text>
                </View>
                <Text className="text-slate-300">{professionalUser.trade}</Text>
              </View>
            )}

            {/* Experience & Rating */}
            <View className="flex-row mb-4">
              <View className="flex-1 bg-slate-800 rounded-xl p-4 mr-2">
                <View className="flex-row items-center mb-1">
                  <Clock color="#94A3B8" size={16} />
                  <Text className="text-slate-400 text-sm ml-1">Experience</Text>
                </View>
                <Text className="text-white text-xl font-bold">
                  {professionalUser.yearsExperience} years
                </Text>
              </View>

              {professionalUser.rating && (
                <View className="flex-1 bg-slate-800 rounded-xl p-4 ml-2">
                  <View className="flex-row items-center mb-1">
                    <Star color="#94A3B8" size={16} />
                    <Text className="text-slate-400 text-sm ml-1">Rating</Text>
                  </View>
                  <Text className="text-white text-xl font-bold">
                    {professionalUser.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* License */}
            {professionalUser.licenseNumber && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <FileText color="#94A3B8" size={20} />
                  <Text className="text-white font-semibold ml-2">License Number</Text>
                </View>
                <Text className="text-slate-300">{professionalUser.licenseNumber}</Text>
              </View>
            )}

            {/* Service Categories */}
            {professionalUser.serviceCategories.length > 0 && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-3">Service Categories</Text>
                <View className="flex-row flex-wrap gap-2">
                  {professionalUser.serviceCategories.map((catId) => {
                    const category = getCategoryById(catId);
                    return category ? (
                      <View key={catId} className="bg-slate-700 px-3 py-1.5 rounded-full">
                        <Text className="text-slate-300 text-sm">{category.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {/* Service Areas */}
            {professionalUser.serviceArea.length > 0 && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <MapPin color="#94A3B8" size={20} />
                  <Text className="text-white font-semibold ml-2">Service Areas</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {professionalUser.serviceArea.map((area, index) => (
                    <View key={index} className="bg-slate-700 px-3 py-1.5 rounded-full">
                      <Text className="text-slate-300 text-sm">{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            {professionalUser.description && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-2">About</Text>
                <Text className="text-slate-300 leading-6">{professionalUser.description}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase,
  UserCircle,
  MapPin,
  Clock,
  Award,
  FileText,
  LogOut,
  Edit3,
  Star,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { getCategoryById } from '@/lib/categories';
import { ProfessionalProfile } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!user) return null;

  const isProfessional = user.role === 'professional';
  const professionalUser = user as ProfessionalProfile;

  return (
    <View className="flex-1 bg-slate-900">
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
              {user.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : isProfessional ? (
                <Briefcase color="#F59E0B" size={40} />
              ) : (
                <UserCircle color="#3B82F6" size={40} />
              )}
            </View>

            <Text className="text-white text-2xl font-bold mt-4">{user.name}</Text>

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
              <Text className="text-slate-400 ml-1">{user.city}</Text>
            </View>
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

            {/* Experience */}
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

        {/* Actions */}
        <View className="px-6 mt-6">
          {isProfessional && (
            <Pressable
              onPress={() => router.push('/complete-profile')}
              className="flex-row items-center bg-slate-800 rounded-xl p-4 mb-3 active:bg-slate-700"
            >
              <Edit3 color="#94A3B8" size={20} />
              <Text className="text-white font-medium ml-3">Edit Profile</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center bg-slate-800 rounded-xl p-4 active:bg-slate-700"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-red-400 font-medium ml-3">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import {
  ArrowLeft,
  Camera,
  Video as VideoIcon,
  X,
  Play,
  Images,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { MediaItem, ProfessionalProfile } from '@/lib/types';

const MAX_PORTFOLIO_ITEMS = 12;

export default function EditPortfolioScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfessionalProfile = useAuthStore((s) => s.updateProfessionalProfile);

  const professionalUser = user as ProfessionalProfile | null;
  const [media, setMedia] = useState<MediaItem[]>(
    professionalUser?.portfolioMedia ?? []
  );

  if (!user || user.role !== 'professional') {
    return (
      <View className="flex-1 bg-workly-bg-dark items-center justify-center">
        <Text className="text-white">Only professionals can edit portfolios</Text>
      </View>
    );
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_PORTFOLIO_ITEMS - media.length,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map((asset) => ({
        id: Math.random().toString(36).substring(2, 15),
        type: 'image',
        uri: asset.uri,
        createdAt: new Date().toISOString(),
      }));
      setMedia((prev) => [...prev, ...newMedia].slice(0, MAX_PORTFOLIO_ITEMS));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 0.8,
      videoMaxDuration: 120,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newMedia: MediaItem = {
        id: Math.random().toString(36).substring(2, 15),
        type: 'video',
        uri: asset.uri,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMedia].slice(0, MAX_PORTFOLIO_ITEMS));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeMedia = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    updateProfessionalProfile({ portfolioMedia: media });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Portfolio Updated', 'Your portfolio has been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View className="flex-1 bg-workly-bg-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0F2152' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Edit Portfolio',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-workly-teal/20 rounded-full items-center justify-center mb-3">
              <Images color="#2979FF" size={32} />
            </View>
            <Text className="text-white text-xl font-semibold">
              Showcase Your Work
            </Text>
            <Text className="text-workly-muted text-center mt-2">
              Add photos and videos of your completed projects to attract more
              clients.
            </Text>
          </View>

          {/* Media Count */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-semibold">Portfolio Items</Text>
            <Text className="text-workly-muted">
              {media.length}/{MAX_PORTFOLIO_ITEMS}
            </Text>
          </View>

          {/* Media Grid */}
          {media.length > 0 ? (
            <View className="flex-row flex-wrap gap-3 mb-6">
              {media.map((item) => (
                <View key={item.id} className="relative">
                  {item.type === 'image' ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: 105, height: 105, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-[105px] h-[105px] rounded-xl bg-workly-bg-card items-center justify-center overflow-hidden">
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: 105, height: 105 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                      />
                      <View className="absolute bg-black/50 rounded-full p-2">
                        <Play color="white" size={20} fill="white" />
                      </View>
                    </View>
                  )}
                  <Pressable
                    onPress={() => removeMedia(item.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full items-center justify-center"
                  >
                    <X color="white" size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-workly-bg-card/50 rounded-xl p-8 items-center mb-6">
              <Images color="#4A6FA5" size={48} />
              <Text className="text-workly-muted text-center mt-3">
                No portfolio items yet. Add photos and videos of your work to
                showcase your skills.
              </Text>
            </View>
          )}

          {/* Add Media Buttons */}
          {media.length < MAX_PORTFOLIO_ITEMS && (
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={pickImages}
                className="flex-1 bg-workly-bg-card rounded-xl p-4 items-center border border-workly-border"
              >
                <Camera color="#4A6FA5" size={28} />
                <Text className="text-blue-200 font-medium mt-2">
                  Add Photos
                </Text>
              </Pressable>

              <Pressable
                onPress={pickVideo}
                className="flex-1 bg-workly-bg-card rounded-xl p-4 items-center border border-workly-border"
              >
                <VideoIcon color="#4A6FA5" size={28} />
                <Text className="text-blue-200 font-medium mt-2">
                  Add Video
                </Text>
              </Pressable>
            </View>
          )}

          <Text className="text-workly-text-subtle text-xs text-center mb-6">
            Videos limited to 2 minutes. Supported formats: JPG, PNG, MP4, MOV.
          </Text>

          {/* Save Button */}
          <Pressable onPress={handleSave}>
            <LinearGradient
              colors={['#2979FF', '#1565C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 16 }}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save Portfolio
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

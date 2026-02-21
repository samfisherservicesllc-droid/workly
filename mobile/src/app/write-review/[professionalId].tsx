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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import {
  ArrowLeft,
  Star,
  Camera,
  Video as VideoIcon,
  X,
  Play,
  Building2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { useReviewsStore } from '@/lib/state/reviews-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { MediaItem } from '@/lib/types';

const MAX_WORDS = 250;

export default function WriteReviewScreen() {
  const { professionalId, professionalName } = useLocalSearchParams<{
    professionalId: string;
    professionalName: string;
  }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addReview = useReviewsStore((s) => s.addReview);
  const hasReviewed = useReviewsStore((s) =>
    s.hasClientReviewedProfessional(user?.id ?? '', professionalId ?? '')
  );

  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState('');

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - media.length,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map((asset) => ({
        id: Math.random().toString(36).substring(2, 15),
        type: 'image',
        uri: asset.uri,
        createdAt: new Date().toISOString(),
      }));
      setMedia((prev) => [...prev, ...newMedia].slice(0, 5));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newMedia: MediaItem = {
        id: Math.random().toString(36).substring(2, 15),
        type: 'video',
        uri: asset.uri,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMedia].slice(0, 5));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeMedia = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = () => {
    if (!user || user.role !== 'client') {
      setError('Only clients can leave reviews');
      return;
    }

    if (hasReviewed) {
      setError('You have already reviewed this professional');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    if (!description.trim()) {
      setError('Please write a description of your experience');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setError(`Description must be ${MAX_WORDS} words or less`);
      return;
    }

    const category = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

    addReview({
      professionalId: professionalId ?? '',
      clientId: user.id,
      clientName: user.name,
      clientPhotoUrl: user.photoUrl,
      rating,
      description: description.trim(),
      companyName: companyName.trim() || undefined,
      media,
      serviceCategoryId: selectedCategory ?? undefined,
      serviceCategoryName: category?.name,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Review Submitted', 'Thank you for your feedback!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const renderStars = () => {
    return (
      <View className="flex-row items-center justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => {
              setRating(star);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className="p-2"
          >
            <Star
              size={40}
              color={star <= rating ? '#2979FF' : '#475569'}
              fill={star <= rating ? '#2979FF' : 'transparent'}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  if (hasReviewed) {
    return (
      <View className="flex-1 bg-workly-bg-dark">
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#0F2152' },
            headerTintColor: '#FFFFFF',
            headerTitle: 'Write Review',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} className="mr-4">
                <ArrowLeft color="white" size={24} />
              </Pressable>
            ),
          }}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Star color="#2979FF" size={48} fill="#2979FF" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            Already Reviewed
          </Text>
          <Text className="text-slate-400 text-center mt-2">
            You have already submitted a review for this professional.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-workly-bg-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0F2152' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Write Review',
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
            {/* Professional Name */}
            <View className="items-center mb-6">
              <Text className="text-slate-400 text-sm">Reviewing</Text>
              <Text className="text-white text-xl font-semibold mt-1">
                {professionalName ?? 'Professional'}
              </Text>
            </View>

            {/* Star Rating */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3 text-center">
                How would you rate your experience?
              </Text>
              {renderStars()}
              {rating > 0 && (
                <Text className="text-workly-teal text-center mt-2">
                  {rating === 5
                    ? 'Excellent!'
                    : rating === 4
                    ? 'Great!'
                    : rating === 3
                    ? 'Good'
                    : rating === 2
                    ? 'Fair'
                    : 'Poor'}
                </Text>
              )}
            </View>

            {/* Service Category */}
            <View className="mb-6">
              <CategoryDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                label="Service Category (optional)"
                placeholder="Select a category"
                allowClear
              />
            </View>

            {/* Company/Business Name */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Company/Business Name (optional)
              </Text>
              <Text className="text-slate-500 text-xs mb-3">
                If the professional works for a company, enter the business name
              </Text>
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border">
                <Building2 color="#6B7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="e.g. ABC Plumbing Services"
                  placeholderTextColor="#6B7280"
                  value={companyName}
                  onChangeText={setCompanyName}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">
                  Describe your experience
                </Text>
                <Text
                  className={`text-sm ${
                    wordCount > MAX_WORDS ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {wordCount}/{MAX_WORDS} words
                </Text>
              </View>
              <TextInput
                className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border min-h-[150px]"
                placeholder="Share details about the work quality, professionalism, communication, and whether you would recommend them..."
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Media */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">
                Add Photos or Videos (optional)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
              >
                {media.map((item) => (
                  <View key={item.id} className="mr-3 relative">
                    {item.type === 'image' ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: 100, height: 100, borderRadius: 12 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-[100px] h-[100px] rounded-xl bg-workly-bg-card items-center justify-center overflow-hidden">
                        <Video
                          source={{ uri: item.uri }}
                          style={{ width: 100, height: 100 }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={false}
                        />
                        <View className="absolute bg-black/50 rounded-full p-2">
                          <Play color="white" size={16} fill="white" />
                        </View>
                      </View>
                    )}
                    <Pressable
                      onPress={() => removeMedia(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                    >
                      <X color="white" size={14} />
                    </Pressable>
                  </View>
                ))}

                {media.length < 5 && (
                  <View className="flex-row">
                    <Pressable
                      onPress={pickImage}
                      className="w-[100px] h-[100px] bg-workly-bg-card rounded-xl items-center justify-center border border-dashed border-workly-border mr-3"
                    >
                      <Camera color="#6B7280" size={28} />
                      <Text className="text-slate-500 text-xs mt-1">Photo</Text>
                    </Pressable>

                    <Pressable
                      onPress={pickVideo}
                      className="w-[100px] h-[100px] bg-workly-bg-card rounded-xl items-center justify-center border border-dashed border-workly-border"
                    >
                      <VideoIcon color="#6B7280" size={28} />
                      <Text className="text-slate-500 text-xs mt-1">Video</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
              <Text className="text-slate-500 text-xs mt-2">
                Up to 5 photos/videos. Videos limited to 60 seconds.
              </Text>
            </View>

            {error ? (
              <Text className="text-red-400 text-center mb-4">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <Pressable onPress={handleSubmit}>
              <LinearGradient
                colors={['#2979FF', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 16 }}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Submit Review
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

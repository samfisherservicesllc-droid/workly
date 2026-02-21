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
import { ArrowLeft, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { useClientReviewsStore } from '@/lib/state/client-reviews-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';

const MAX_WORDS = 150;

export default function RateClientScreen() {
  const { clientId, clientName } = useLocalSearchParams<{
    clientId: string;
    clientName: string;
  }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addReview = useClientReviewsStore((s) => s.addReview);
  const hasReviewed = useClientReviewsStore((s) =>
    s.hasProfessionalReviewedClient(user?.id ?? '', clientId ?? '')
  );

  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState('');

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = () => {
    if (!user || user.role !== 'professional') {
      setError('Only professionals can rate clients');
      return;
    }

    if (hasReviewed) {
      setError('You have already rated this client');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    if (!description.trim()) {
      setError('Please write a brief description of your experience');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setError(`Description must be ${MAX_WORDS} words or less`);
      return;
    }

    const category = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

    addReview({
      clientId: clientId ?? '',
      professionalId: user.id,
      professionalName: user.name,
      professionalPhotoUrl: user.photoUrl,
      rating,
      description: description.trim(),
      serviceCategoryId: selectedCategory ?? undefined,
      serviceCategoryName: category?.name,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Rating Submitted', 'Thank you for your feedback!', [
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
              color={star <= rating ? '#3B82F6' : '#1E3A7A'}
              fill={star <= rating ? '#3B82F6' : 'transparent'}
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
            headerTitle: 'Rate Client',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} className="mr-4">
                <ArrowLeft color="white" size={24} />
              </Pressable>
            ),
          }}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Star color="#3B82F6" size={48} fill="#3B82F6" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            Already Rated
          </Text>
          <Text className="text-workly-muted text-center mt-2">
            You have already submitted a rating for this client.
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
          headerTitle: 'Rate Client',
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
            {/* Client Name */}
            <View className="items-center mb-6">
              <Text className="text-workly-muted text-sm">Rating</Text>
              <Text className="text-white text-xl font-semibold mt-1">
                {clientName ?? 'Client'}
              </Text>
            </View>

            {/* Star Rating */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3 text-center">
                How was your experience working with this client?
              </Text>
              {renderStars()}
              {rating > 0 && (
                <Text className="text-blue-400 text-center mt-2">
                  {rating === 5
                    ? 'Excellent client!'
                    : rating === 4
                    ? 'Great client!'
                    : rating === 3
                    ? 'Good client'
                    : rating === 2
                    ? 'Fair'
                    : 'Difficult'}
                </Text>
              )}
            </View>

            {/* Service Category */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">
                Service Provided (optional)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
              >
                {SERVICE_CATEGORIES.slice(0, 20).map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      );
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-500'
                        : 'bg-workly-bg-card'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCategory === category.id
                          ? 'text-white'
                          : 'text-blue-200'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">
                  Describe your experience
                </Text>
                <Text
                  className={`text-sm ${
                    wordCount > MAX_WORDS ? 'text-red-400' : 'text-workly-muted'
                  }`}
                >
                  {wordCount}/{MAX_WORDS} words
                </Text>
              </View>
              <TextInput
                className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border min-h-[120px]"
                placeholder="Share details about communication, payment, respect for your time, clarity of requirements..."
                placeholderTextColor="#4A6FA5"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Tips */}
            <View className="bg-workly-bg-card/50 rounded-xl p-4 mb-6">
              <Text className="text-white font-medium mb-2">Rating Tips</Text>
              <Text className="text-workly-muted text-sm leading-5">
                Consider: Was the client communicative? Did they pay on time? Were
                they respectful of your schedule? Were job requirements clear?
              </Text>
            </View>

            {error ? (
              <Text className="text-red-400 text-center mb-4">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <Pressable onPress={handleSubmit}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 16 }}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Submit Rating
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

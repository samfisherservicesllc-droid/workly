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
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import {
  ArrowLeft,
  MapPin,
  FileText,
  Camera,
  Video as VideoIcon,
  X,
  Play,
  Home,
  Hash,
  Building,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { useJobRequestsStore } from '@/lib/state/job-requests-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { MediaItem, ClientProfile } from '@/lib/types';

const MAX_WORDS = 300;

export default function CreateJobRequestScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addJobRequest = useJobRequestsStore((s) => s.addJobRequest);

  const clientUser = user as ClientProfile;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState(clientUser?.neighborhood ?? '');
  const [city, setCity] = useState(clientUser?.city ?? '');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
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
      setError('Only clients can create job requests');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your job request');
      return;
    }

    if (!description.trim()) {
      setError('Please describe the job you need done');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setError(`Description must be ${MAX_WORDS} words or less`);
      return;
    }

    if (!selectedCategory) {
      setError('Please select a service category');
      return;
    }

    if (!city.trim()) {
      setError('Please enter your city');
      return;
    }

    if (!state.trim()) {
      setError('Please enter your state');
      return;
    }

    if (!zipCode.trim()) {
      setError('Please enter your zip code');
      return;
    }

    const category = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

    addJobRequest({
      clientId: user.id,
      clientName: user.name,
      clientPhotoUrl: user.photoUrl,
      title: title.trim(),
      description: description.trim(),
      serviceCategoryId: selectedCategory,
      serviceCategoryName: category?.name ?? '',
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zipCode: zipCode.trim(),
      media,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Job Request Posted',
      'Your job request is now visible to professionals in your area!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  if (!user || user.role !== 'client') {
    return (
      <View className="flex-1 bg-workly-bg-dark items-center justify-center">
        <Text className="text-white">Only clients can create job requests</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-workly-bg-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#252932' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Post Job Request',
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
            {/* Title */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Job Title</Text>
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border">
                <FileText color="#6B7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="e.g. Need plumber for bathroom leak"
                  placeholderTextColor="#6B7280"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Service Category */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">
                Service Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
              >
                {SERVICE_CATEGORIES.map((category) => (
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
                        ? 'bg-workly-teal'
                        : 'bg-workly-bg-card'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCategory === category.id
                          ? 'text-white'
                          : 'text-slate-300'
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
                  Job Description
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
                className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border min-h-[120px]"
                placeholder="Describe the job in detail. What needs to be done? Any specific requirements or preferences?"
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Location Section */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Location</Text>

              {/* Neighborhood */}
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border mb-3">
                <Home color="#6B7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Neighborhood (optional)"
                  placeholderTextColor="#6B7280"
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                />
              </View>

              {/* City */}
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border mb-3">
                <MapPin color="#6B7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="City"
                  placeholderTextColor="#6B7280"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              {/* State and Zip */}
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border">
                    <Building color="#6B7280" size={20} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-base"
                      placeholder="State"
                      placeholderTextColor="#6B7280"
                      value={state}
                      onChangeText={setState}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  </View>
                </View>
                <View className="flex-1 ml-2">
                  <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border">
                    <Hash color="#6B7280" size={20} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-base"
                      placeholder="Zip Code"
                      placeholderTextColor="#6B7280"
                      value={zipCode}
                      onChangeText={setZipCode}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Media */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">
                Photos or Videos (optional)
              </Text>
              <Text className="text-slate-500 text-sm mb-3">
                Add photos or videos to help professionals understand the job better
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
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 16 }}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Post Job Request
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

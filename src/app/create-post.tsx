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
import { Image } from 'expo-image';
import { X, Camera, Check, MapPin } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/state/auth-store';
import { usePostsStore } from '@/lib/state/posts-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { PostType } from '@/lib/types';

export default function CreatePostScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createPost = usePostsStore((s) => s.createPost);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [city, setCity] = useState(user?.city ?? '');
  const [images, setImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<PostType>(
    user?.role === 'professional' ? 'completed_work' : 'job_done'
  );
  const [error, setError] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!user) return;

    if (!title.trim()) {
      setError('Please add a title');
      return;
    }

    if (!description.trim()) {
      setError('Please add a description');
      return;
    }

    if (!selectedCategory) {
      setError('Please select a service category');
      return;
    }

    if (!city.trim()) {
      setError('Please add a city/location');
      return;
    }

    createPost({
      authorId: user.id,
      authorName: user.name,
      authorPhotoUrl: user.photoUrl,
      authorRole: user.role,
      type: postType,
      title: title.trim(),
      description: description.trim(),
      images,
      serviceCategoryId: selectedCategory,
      city: city.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View className="flex-1 bg-workly-bg-dark">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-workly-border">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <X color="#5A7A82" size={24} />
          </Pressable>
          <Text className="text-white text-lg font-semibold">New Post</Text>
          <Pressable
            onPress={handleSubmit}
            className="w-10 h-10 bg-workly-teal rounded-full items-center justify-center"
          >
            <Check color="white" size={20} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Post Type Selection */}
            <View className="px-4 pt-4">
              <Text className="text-white font-semibold mb-3">Post Type</Text>
              <View className="flex-row">
                <Pressable
                  onPress={() => {
                    setPostType('completed_work');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 py-3 rounded-xl mr-2 ${
                    postType === 'completed_work' ? 'bg-workly-teal' : 'bg-workly-bg-card'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      postType === 'completed_work' ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    Completed Work
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setPostType('job_done');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 py-3 rounded-xl ml-2 ${
                    postType === 'job_done' ? 'bg-workly-teal' : 'bg-workly-bg-card'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      postType === 'job_done' ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    Job I Had Done
                  </Text>
                </Pressable>
              </View>
              <Text className="text-slate-500 text-xs mt-2">
                {postType === 'completed_work'
                  ? 'Share work you completed as a professional'
                  : 'Share a job you hired someone to do'}
              </Text>
            </View>

            {/* Title */}
            <View className="px-4 mt-6">
              <Text className="text-white font-semibold mb-2">Title</Text>
              <TextInput
                className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border"
                placeholder="e.g., Kitchen remodel completed"
                placeholderTextColor="#5A7A82"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View className="px-4 mt-4">
              <Text className="text-white font-semibold mb-2">Description</Text>
              <TextInput
                className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border min-h-[100px]"
                placeholder="Describe the work, materials used, timeline, etc."
                placeholderTextColor="#5A7A82"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Service Category */}
            <View className="px-4 mt-4">
              <Text className="text-white font-semibold mb-3">Service Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {SERVICE_CATEGORIES.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      selectedCategory === category.id ? 'bg-workly-teal' : 'bg-workly-bg-card'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCategory === category.id ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Location */}
            <View className="px-4 mt-4">
              <Text className="text-white font-semibold mb-2">Location</Text>
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-4 py-3 border border-workly-border">
                <MapPin color="#5A7A82" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="City where work was done"
                  placeholderTextColor="#5A7A82"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            {/* Images */}
            <View className="px-4 mt-4">
              <Text className="text-white font-semibold mb-3">Photos (up to 5)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {images.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image
                      source={{ uri }}
                      style={{ width: 120, height: 120, borderRadius: 12 }}
                      contentFit="cover"
                    />
                    <Pressable
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                    >
                      <X color="white" size={14} />
                    </Pressable>
                  </View>
                ))}

                {images.length < 5 && (
                  <Pressable
                    onPress={pickImage}
                    className="w-[120px] h-[120px] bg-workly-bg-card rounded-xl items-center justify-center border border-dashed border-workly-border"
                  >
                    <Camera color="#5A7A82" size={32} />
                    <Text className="text-slate-500 text-xs mt-2">Add Photo</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>

            {error ? (
              <Text className="text-red-400 text-center mt-4 px-4">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <View className="px-4 mt-6">
              <Pressable onPress={handleSubmit}>
                <LinearGradient
                  colors={['#4A9BAD', '#3A7A8A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, paddingVertical: 16 }}
                >
                  <Text className="text-white text-center font-semibold text-lg">Post</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

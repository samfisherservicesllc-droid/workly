import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MapPin,
  Filter,
  ChevronDown,
  Briefcase,
  UserCircle,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { usePostsStore } from '@/lib/state/posts-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { Post, FeedFilter } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { formatDistanceToNow } from 'date-fns';

export default function FeedScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const posts = usePostsStore((s) => s.posts);
  const reactions = usePostsStore((s) => s.reactions);
  const filters = usePostsStore((s) => s.filters);
  const setFilters = usePostsStore((s) => s.setFilters);
  const reactToPost = usePostsStore((s) => s.reactToPost);
  const getFilteredPosts = usePostsStore((s) => s.getFilteredPosts);

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPosts = useMemo(
    () => getFilteredPosts(user?.id),
    [posts, reactions, filters, user?.id, getFilteredPosts]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleReaction = (postId: string, reaction: 'like' | 'dislike') => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reactToPost(postId, user.id, reaction);
  };

  const handleShare = async (post: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (await Sharing.isAvailableAsync()) {
        // In a real app, this would be a deep link
        await Sharing.shareAsync(`https://proconnect.app/post/${post.id}`, {
          dialogTitle: `Check out this ${post.serviceCategoryName} work!`,
        });
      }
    } catch {
      // Share cancelled or failed
    }
  };

  const handleFilterType = (type: FeedFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({ type });
  };

  const handleCategoryFilter = (categoryId: string | undefined) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({ categoryId });
    setShowFilters(false);
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
      <View className="bg-workly-bg-card mx-4 mb-4 rounded-2xl overflow-hidden">
        {/* Author Header */}
        <Pressable
          onPress={() => router.push(`/profile/${post.authorId}`)}
          className="flex-row items-center p-4"
        >
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              post.authorRole === 'professional' ? 'bg-workly-teal/20' : 'bg-blue-500/20'
            }`}
          >
            {post.authorPhotoUrl ? (
              <Image
                source={{ uri: post.authorPhotoUrl }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : post.authorRole === 'professional' ? (
              <Briefcase color="#4A9BAD" size={24} />
            ) : (
              <UserCircle color="#3B82F6" size={24} />
            )}
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-semibold">{post.authorName}</Text>
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  post.authorRole === 'professional' ? 'bg-workly-teal/20' : 'bg-blue-500/20'
                }`}
              >
                <Text
                  className={`text-xs ${
                    post.authorRole === 'professional' ? 'text-workly-teal-light' : 'text-blue-400'
                  }`}
                >
                  {post.authorRole === 'professional' ? 'Pro' : 'Client'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mt-0.5">
              <MapPin color="#5A7A82" size={12} />
              <Text className="text-slate-400 text-xs ml-1">{post.city}</Text>
              <Text className="text-slate-500 text-xs ml-2">• {timeAgo}</Text>
            </View>
          </View>
        </Pressable>

        {/* Post Content */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center mb-2">
            <View className="bg-workly-bg-input px-3 py-1 rounded-full">
              <Text className="text-slate-300 text-sm">{post.serviceCategoryName}</Text>
            </View>
            <View className="bg-workly-bg-input/50 px-3 py-1 rounded-full ml-2">
              <Text className="text-slate-400 text-xs">
                {post.type === 'completed_work' ? 'Completed Work' : 'Job Done'}
              </Text>
            </View>
          </View>
          <Text className="text-white font-medium text-lg mb-1">{post.title}</Text>
          <Text className="text-slate-300">{post.description}</Text>
        </View>

        {/* Images */}
        {post.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 pb-3"
            style={{ flexGrow: 0 }}
          >
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{
                  width: post.images.length === 1 ? 320 : 240,
                  height: 200,
                  borderRadius: 12,
                  marginRight: 8,
                }}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Actions */}
        <View className="flex-row items-center px-4 py-3 border-t border-workly-border">
          <Pressable
            onPress={() => handleReaction(post.id, 'like')}
            className={`flex-row items-center mr-6 ${
              post.userReaction === 'like' ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <ThumbsUp
              color={post.userReaction === 'like' ? '#22C55E' : '#94A3B8'}
              size={20}
              fill={post.userReaction === 'like' ? '#22C55E' : 'transparent'}
            />
            <Text
              className={`ml-1.5 ${
                post.userReaction === 'like' ? 'text-green-500' : 'text-slate-400'
              }`}
            >
              {post.likes}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleReaction(post.id, 'dislike')}
            className={`flex-row items-center mr-6 ${
              post.userReaction === 'dislike' ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <ThumbsDown
              color={post.userReaction === 'dislike' ? '#EF4444' : '#94A3B8'}
              size={20}
              fill={post.userReaction === 'dislike' ? '#EF4444' : 'transparent'}
            />
            <Text
              className={`ml-1.5 ${
                post.userReaction === 'dislike' ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {post.dislikes}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleShare(post)}
            className="flex-row items-center opacity-70"
          >
            <Share2 color="#94A3B8" size={20} />
            <Text className="text-slate-400 ml-1.5">Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-workly-bg-dark">
      {/* Filter Tabs */}
      <View className="px-4 py-3 border-b border-workly-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row">
            {(['all', 'clients', 'professionals'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => handleFilterType(type)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  filters.type === type ? 'bg-workly-teal' : 'bg-workly-bg-card'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.type === type ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'clients' ? 'Clients' : 'Pros'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className={`flex-row items-center px-3 py-2 rounded-full ${
              filters.categoryId ? 'bg-workly-teal' : 'bg-workly-bg-card'
            }`}
          >
            <Filter color={filters.categoryId ? 'white' : '#94A3B8'} size={16} />
            <ChevronDown
              color={filters.categoryId ? 'white' : '#94A3B8'}
              size={16}
              className="ml-1"
            />
          </Pressable>
        </View>

        {/* Category Filter Dropdown */}
        {showFilters && (
          <View className="mt-3 bg-workly-bg-card rounded-xl p-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-medium">Filter by Category</Text>
              {filters.categoryId && (
                <Pressable onPress={() => handleCategoryFilter(undefined)}>
                  <View className="flex-row items-center">
                    <X color="#94A3B8" size={14} />
                    <Text className="text-slate-400 text-sm ml-1">Clear</Text>
                  </View>
                </Pressable>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              {SERVICE_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryFilter(category.id)}
                  className={`px-3 py-2 rounded-full mr-2 ${
                    filters.categoryId === category.id ? 'bg-workly-teal' : 'bg-workly-bg-input'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      filters.categoryId === category.id ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-workly-bg-card rounded-full items-center justify-center mb-4">
            <Briefcase color="#5A7A82" size={32} />
          </View>
          <Text className="text-white text-xl font-semibold text-center">No posts yet</Text>
          <Text className="text-slate-400 text-center mt-2">
            Be the first to share your work or a job you had done!
          </Text>
          <Pressable
            onPress={() => router.push('/create-post')}
            className="mt-6"
          >
            <LinearGradient
              colors={['#4A9BAD', '#3A7A8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }}
            >
              <Text className="text-white font-semibold">Create Post</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={filteredPosts}
          renderItem={renderPost}
          estimatedItemSize={350}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A9BAD" />
          }
        />
      )}
    </View>
  );
}

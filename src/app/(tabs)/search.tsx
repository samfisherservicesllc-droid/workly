import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search as SearchIcon,
  MapPin,
  Star,
  Briefcase,
  UserCircle,
  Clock,
  X,
  Filter,
  ChevronDown,
  FileText,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { useProfessionalsStore, SearchFilters } from '@/lib/state/professionals-store';
import { usePostsStore } from '@/lib/state/posts-store';
import { useReviewsStore } from '@/lib/state/reviews-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { ProfessionalProfile, Post } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';

type SearchMode = 'professionals' | 'leads';

export default function SearchScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadProfessionals = useProfessionalsStore((s) => s.loadProfessionals);
  const searchProfessionals = useProfessionalsStore((s) => s.searchProfessionals);
  const posts = usePostsStore((s) => s.posts);
  const getAverageRating = useReviewsStore((s) => s.getAverageRating);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(
    user?.role === 'professional' ? 'leads' : 'professionals'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  // Search professionals
  const professionalResults = useMemo(() => {
    return searchProfessionals(searchQuery, filters);
  }, [searchQuery, filters, searchProfessionals]);

  // Search job leads (posts from clients)
  const leadResults = useMemo(() => {
    let results = posts.filter((p) => p.authorRole === 'client');

    const lowerQuery = searchQuery.toLowerCase().trim();
    if (lowerQuery) {
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.serviceCategoryName.toLowerCase().includes(lowerQuery) ||
          p.city.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters.categoryId) {
      results = results.filter((p) => p.serviceCategoryId === filters.categoryId);
    }

    if (filters.city) {
      const lowerCity = filters.city.toLowerCase();
      results = results.filter((p) => p.city.toLowerCase().includes(lowerCity));
    }

    // Sort by date (newest first)
    results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return results;
  }, [posts, searchQuery, filters]);

  const handleModeSwitch = (mode: SearchMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchMode(mode);
    setFilters({});
  };

  const handleCategoryFilter = (categoryId: string | undefined) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters((prev) => ({ ...prev, categoryId }));
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({});
    setShowFilters(false);
  };

  const renderProfessional = useCallback(
    ({ item: pro }: { item: ProfessionalProfile }) => {
      const ratingData = getAverageRating(pro.id);

      return (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/profile/${pro.id}`);
          }}
          className="bg-skillset-bg-card mx-4 mb-3 rounded-2xl p-4 active:opacity-80"
        >
          <View className="flex-row">
            {/* Avatar */}
            <View className="w-16 h-16 rounded-full bg-skillset-teal/20 items-center justify-center">
              {pro.photoUrl ? (
                <Image
                  source={{ uri: pro.photoUrl }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <Briefcase color="#4A9BAD" size={28} />
              )}
            </View>

            {/* Info */}
            <View className="flex-1 ml-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold text-lg">{pro.name}</Text>
                {ratingData.count > 0 && (
                  <View className="flex-row items-center">
                    <Star color="#4A9BAD" size={14} fill="#4A9BAD" />
                    <Text className="text-skillset-teal-light text-sm ml-1">
                      {ratingData.rating.toFixed(1)}
                    </Text>
                    <Text className="text-slate-500 text-xs ml-1">
                      ({ratingData.count})
                    </Text>
                  </View>
                )}
              </View>

              {pro.trade && (
                <Text className="text-skillset-teal text-sm mt-0.5">{pro.trade}</Text>
              )}

              <View className="flex-row items-center mt-2">
                <MapPin color="#5A7A82" size={12} />
                <Text className="text-slate-400 text-xs ml-1">{pro.city}</Text>
                <View className="w-1 h-1 bg-slate-600 rounded-full mx-2" />
                <Clock color="#5A7A82" size={12} />
                <Text className="text-slate-400 text-xs ml-1">
                  {pro.yearsExperience} yrs exp
                </Text>
              </View>

              {/* Service Categories */}
              {pro.serviceCategories.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2"
                  style={{ flexGrow: 0 }}
                >
                  {pro.serviceCategories.slice(0, 3).map((catId) => {
                    const category = SERVICE_CATEGORIES.find((c) => c.id === catId);
                    return category ? (
                      <View
                        key={catId}
                        className="bg-skillset-bg-input px-2 py-1 rounded mr-2"
                      >
                        <Text className="text-slate-300 text-xs">{category.name}</Text>
                      </View>
                    ) : null;
                  })}
                  {pro.serviceCategories.length > 3 && (
                    <View className="bg-skillset-bg-input px-2 py-1 rounded">
                      <Text className="text-slate-500 text-xs">
                        +{pro.serviceCategories.length - 3} more
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [router, getAverageRating]
  );

  const renderLead = useCallback(
    ({ item: post }: { item: Post }) => {
      const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

      return (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/profile/${post.authorId}`);
          }}
          className="bg-skillset-bg-card mx-4 mb-3 rounded-2xl p-4 active:opacity-80"
        >
          {/* Header */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
              {post.authorPhotoUrl ? (
                <Image
                  source={{ uri: post.authorPhotoUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <UserCircle color="#3B82F6" size={20} />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-medium">{post.authorName}</Text>
              <View className="flex-row items-center">
                <MapPin color="#5A7A82" size={10} />
                <Text className="text-slate-500 text-xs ml-1">{post.city}</Text>
                <Text className="text-slate-600 text-xs ml-2">• {timeAgo}</Text>
              </View>
            </View>
            <View className="bg-blue-500/20 px-2 py-1 rounded-full">
              <Text className="text-blue-400 text-xs">Lead</Text>
            </View>
          </View>

          {/* Content */}
          <View className="mt-3">
            <View className="flex-row items-center mb-2">
              <View className="bg-skillset-bg-input px-3 py-1 rounded-full">
                <Text className="text-slate-300 text-sm">{post.serviceCategoryName}</Text>
              </View>
            </View>
            <Text className="text-white font-medium">{post.title}</Text>
            <Text className="text-slate-400 text-sm mt-1" numberOfLines={2}>
              {post.description}
            </Text>
          </View>

          {/* Images preview */}
          {post.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              style={{ flexGrow: 0 }}
            >
              {post.images.slice(0, 3).map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }}
                  contentFit="cover"
                />
              ))}
              {post.images.length > 3 && (
                <View className="w-20 h-20 rounded-lg bg-skillset-bg-input items-center justify-center">
                  <Text className="text-slate-400 text-sm">
                    +{post.images.length - 3}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* CTA */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/profile/${post.authorId}`);
            }}
            className="mt-3 bg-skillset-teal/20 py-2 rounded-xl"
          >
            <Text className="text-skillset-teal text-center font-medium">
              Contact Client
            </Text>
          </Pressable>
        </Pressable>
      );
    },
    [router]
  );

  const hasActiveFilters = filters.categoryId || filters.city;

  return (
    <View className="flex-1 bg-skillset-bg-dark">
      {/* Search Header */}
      <View className="px-4 pt-2 pb-3">
        {/* Search Input */}
        <View className="flex-row items-center bg-skillset-bg-card rounded-xl px-4 py-3 border border-skillset-border">
          <SearchIcon color="#5A7A82" size={20} />
          <TextInput
            className="flex-1 ml-3 text-white text-base"
            placeholder={
              searchMode === 'professionals'
                ? 'Search professionals, trades...'
                : 'Search job leads...'
            }
            placeholderTextColor="#5A7A82"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X color="#5A7A82" size={18} />
            </Pressable>
          )}
        </View>

        {/* Mode Toggle */}
        <View className="flex-row mt-3">
          <Pressable
            onPress={() => handleModeSwitch('professionals')}
            className={`flex-1 py-3 rounded-xl mr-2 ${
              searchMode === 'professionals' ? 'bg-skillset-teal' : 'bg-skillset-bg-card'
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Briefcase
                color={searchMode === 'professionals' ? 'white' : '#5A7A82'}
                size={18}
              />
              <Text
                className={`ml-2 font-medium ${
                  searchMode === 'professionals' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Find Pros
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => handleModeSwitch('leads')}
            className={`flex-1 py-3 rounded-xl ml-2 ${
              searchMode === 'leads' ? 'bg-skillset-teal' : 'bg-skillset-bg-card'
            }`}
          >
            <View className="flex-row items-center justify-center">
              <FileText
                color={searchMode === 'leads' ? 'white' : '#5A7A82'}
                size={18}
              />
              <Text
                className={`ml-2 font-medium ${
                  searchMode === 'leads' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Find Leads
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Filter Toggle */}
        <View className="flex-row items-center justify-between mt-3">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(!showFilters);
            }}
            className={`flex-row items-center px-3 py-2 rounded-full ${
              hasActiveFilters ? 'bg-skillset-teal' : 'bg-skillset-bg-card'
            }`}
          >
            <Filter color={hasActiveFilters ? 'white' : '#5A7A82'} size={16} />
            <Text
              className={`ml-2 text-sm ${
                hasActiveFilters ? 'text-white' : 'text-slate-400'
              }`}
            >
              Filters
            </Text>
            <ChevronDown
              color={hasActiveFilters ? 'white' : '#5A7A82'}
              size={16}
              className="ml-1"
            />
          </Pressable>

          {hasActiveFilters && (
            <Pressable onPress={clearFilters}>
              <Text className="text-skillset-teal text-sm">Clear all</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <View className="mt-3 bg-skillset-bg-card rounded-xl p-4">
            <Text className="text-white font-medium mb-3">Service Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {SERVICE_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    handleCategoryFilter(
                      filters.categoryId === category.id ? undefined : category.id
                    )
                  }
                  className={`px-3 py-2 rounded-full mr-2 ${
                    filters.categoryId === category.id
                      ? 'bg-skillset-teal'
                      : 'bg-skillset-bg-input'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      filters.categoryId === category.id
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
        )}
      </View>

      {/* Results */}
      {searchMode === 'professionals' ? (
        professionalResults.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 bg-skillset-bg-card rounded-full items-center justify-center mb-4">
              <Briefcase color="#5A7A82" size={32} />
            </View>
            <Text className="text-white text-xl font-semibold text-center">
              {searchQuery ? 'No professionals found' : 'Search for professionals'}
            </Text>
            <Text className="text-slate-400 text-center mt-2">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Find skilled tradespeople in your area'}
            </Text>
          </View>
        ) : (
          <FlashList
            data={professionalResults}
            renderItem={renderProfessional}
            estimatedItemSize={160}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          />
        )
      ) : leadResults.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-skillset-bg-card rounded-full items-center justify-center mb-4">
            <FileText color="#5A7A82" size={32} />
          </View>
          <Text className="text-white text-xl font-semibold text-center">
            {searchQuery ? 'No leads found' : 'Search for job leads'}
          </Text>
          <Text className="text-slate-400 text-center mt-2">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Find clients looking for your services'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={leadResults}
          renderItem={renderLead}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

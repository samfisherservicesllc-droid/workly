import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
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
  Building,
  Sparkles,
  Tag,
  Play,
  Home,
  Lock,
  Zap,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { useProfessionalsStore, SearchFilters } from '@/lib/state/professionals-store';
import { useJobRequestsStore, JobRequestFilters } from '@/lib/state/job-requests-store';
import { useReviewsStore } from '@/lib/state/reviews-store';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { ProfessionalProfile, JobRequest } from '@/lib/types';
import { hasEntitlement, isRevenueCatEnabled } from '@/lib/revenuecatClient';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';

type SearchMode = 'professionals' | 'leads';

export default function SearchScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadProfessionals = useProfessionalsStore((s) => s.loadProfessionals);
  const searchProfessionals = useProfessionalsStore((s) => s.searchProfessionals);
  const searchJobRequests = useJobRequestsStore((s) => s.searchJobRequests);
  const getAverageRating = useReviewsStore((s) => s.getAverageRating);

  const isProfessional = user?.role === 'professional';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(
    isProfessional ? 'leads' : 'professionals'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters & JobRequestFilters>({});
  const [hasLeadsAccess, setHasLeadsAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check subscription status
  useEffect(() => {
    const checkAccess = async () => {
      if (!isProfessional) {
        setIsCheckingAccess(false);
        return;
      }

      if (!isRevenueCatEnabled()) {
        // If RevenueCat is not enabled, grant access for testing
        setHasLeadsAccess(true);
        setIsCheckingAccess(false);
        return;
      }

      const result = await hasEntitlement('leads_access');
      if (result.ok) {
        setHasLeadsAccess(result.data);
      }
      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [isProfessional]);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  // Search professionals
  const professionalResults = useMemo(() => {
    return searchProfessionals(searchQuery, filters);
  }, [searchQuery, filters, searchProfessionals]);

  // Search job requests (leads for professionals)
  const jobRequestResults = useMemo(() => {
    return searchJobRequests(searchQuery, filters);
  }, [searchQuery, filters, searchJobRequests]);

  const handleModeSwitch = (mode: SearchMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If switching to leads and no access, show paywall
    if (mode === 'leads' && !hasLeadsAccess && isRevenueCatEnabled()) {
      router.push('/paywall');
      return;
    }

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

          {/* Banner */}
          {pro.banner && (
            <View className="mt-3 bg-amber-500/20 rounded-lg px-3 py-2 flex-row items-center">
              <Sparkles color="#F59E0B" size={14} />
              <Text className="text-amber-400 text-xs ml-2 flex-1" numberOfLines={1}>
                {pro.banner.text}
              </Text>
            </View>
          )}
        </Pressable>
      );
    },
    [router, getAverageRating]
  );

  const renderJobRequest = useCallback(
    ({ item: jobRequest }: { item: JobRequest }) => {
      const timeAgo = formatDistanceToNow(new Date(jobRequest.createdAt), { addSuffix: true });

      return (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/profile/${jobRequest.clientId}`);
          }}
          className="bg-skillset-bg-card mx-4 mb-3 rounded-2xl p-4 active:opacity-80"
        >
          {/* Header */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
              {jobRequest.clientPhotoUrl ? (
                <Image
                  source={{ uri: jobRequest.clientPhotoUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <UserCircle color="#3B82F6" size={20} />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-medium">{jobRequest.clientName}</Text>
              <View className="flex-row items-center flex-wrap">
                <MapPin color="#5A7A82" size={10} />
                <Text className="text-slate-500 text-xs ml-1">
                  {jobRequest.neighborhood ? `${jobRequest.neighborhood}, ` : ''}{jobRequest.city}, {jobRequest.state}
                </Text>
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
                <Text className="text-slate-300 text-sm">{jobRequest.serviceCategoryName}</Text>
              </View>
              <View className="bg-skillset-bg-input px-2 py-1 rounded ml-2">
                <Text className="text-slate-400 text-xs">{jobRequest.zipCode}</Text>
              </View>
            </View>
            <Text className="text-white font-medium">{jobRequest.title}</Text>
            <Text className="text-slate-400 text-sm mt-1" numberOfLines={2}>
              {jobRequest.description}
            </Text>
          </View>

          {/* Media preview */}
          {jobRequest.media.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              style={{ flexGrow: 0 }}
            >
              {jobRequest.media.slice(0, 3).map((item) => (
                <View key={item.id} className="mr-2">
                  {item.type === 'image' ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: 80, height: 80, borderRadius: 8 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-lg bg-skillset-bg-input items-center justify-center overflow-hidden">
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: 80, height: 80 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                      />
                      <View className="absolute bg-black/50 rounded-full p-1">
                        <Play color="white" size={12} fill="white" />
                      </View>
                    </View>
                  )}
                </View>
              ))}
              {jobRequest.media.length > 3 && (
                <View className="w-20 h-20 rounded-lg bg-skillset-bg-input items-center justify-center">
                  <Text className="text-slate-400 text-sm">
                    +{jobRequest.media.length - 3}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* CTA */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/profile/${jobRequest.clientId}`);
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

  const hasActiveFilters = filters.categoryId || filters.city || filters.state || filters.keywords;

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
                : 'Search job requests...'
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

        {/* Mode Toggle - Only show for professionals */}
        {isProfessional && (
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
                  Professionals
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
        )}

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
            {/* Location Filters */}
            <Text className="text-white font-medium mb-3">Location</Text>
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center bg-skillset-bg-input rounded-xl px-3 py-2.5 border border-skillset-border">
                  <MapPin color="#5A7A82" size={16} />
                  <TextInput
                    className="flex-1 ml-2 text-white text-sm"
                    placeholder="City"
                    placeholderTextColor="#5A7A82"
                    value={filters.city ?? ''}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, city: text || undefined }))
                    }
                  />
                  {filters.city && (
                    <Pressable
                      onPress={() => setFilters((prev) => ({ ...prev, city: undefined }))}
                    >
                      <X color="#5A7A82" size={14} />
                    </Pressable>
                  )}
                </View>
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row items-center bg-skillset-bg-input rounded-xl px-3 py-2.5 border border-skillset-border">
                  <Building color="#5A7A82" size={16} />
                  <TextInput
                    className="flex-1 ml-2 text-white text-sm"
                    placeholder="State"
                    placeholderTextColor="#5A7A82"
                    value={filters.state ?? ''}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, state: text || undefined }))
                    }
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                  {filters.state && (
                    <Pressable
                      onPress={() => setFilters((prev) => ({ ...prev, state: undefined }))}
                    >
                      <X color="#5A7A82" size={14} />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Keywords Filter */}
            <Text className="text-white font-medium mb-3">Keywords</Text>
            <View className="flex-row items-center bg-skillset-bg-input rounded-xl px-3 py-2.5 border border-skillset-border mb-4">
              <Tag color="#5A7A82" size={16} />
              <TextInput
                className="flex-1 ml-2 text-white text-sm"
                placeholder="e.g. emergency, weekend, licensed"
                placeholderTextColor="#5A7A82"
                value={filters.keywords ?? ''}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, keywords: text || undefined }))
                }
              />
              {filters.keywords && (
                <Pressable
                  onPress={() => setFilters((prev) => ({ ...prev, keywords: undefined }))}
                >
                  <X color="#5A7A82" size={14} />
                </Pressable>
              )}
            </View>

            {/* Service Category */}
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
      ) : isCheckingAccess ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4A9BAD" size="large" />
        </View>
      ) : !hasLeadsAccess && isRevenueCatEnabled() ? (
        // Locked state - no subscription
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-skillset-teal/20 rounded-full items-center justify-center mb-6">
            <Lock color="#4A9BAD" size={40} />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Unlock Job Requests
          </Text>
          <Text className="text-slate-400 text-center mb-6">
            Subscribe to Skillset Pro to access job requests from clients in your area
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/paywall');
            }}
          >
            <LinearGradient
              colors={['#4A9BAD', '#3A8A9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Zap color="white" size={20} fill="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Subscribe Now
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : jobRequestResults.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-skillset-bg-card rounded-full items-center justify-center mb-4">
            <FileText color="#5A7A82" size={32} />
          </View>
          <Text className="text-white text-xl font-semibold text-center">
            {searchQuery ? 'No job requests found' : 'No job requests yet'}
          </Text>
          <Text className="text-slate-400 text-center mt-2">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Check back later for new job requests from clients'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={jobRequestResults}
          renderItem={renderJobRequest}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

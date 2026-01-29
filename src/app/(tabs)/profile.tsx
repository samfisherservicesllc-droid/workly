import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
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
  Calendar,
  Images,
  Play,
  Plus,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { useReviewsStore } from '@/lib/state/reviews-store';
import { getCategoryById } from '@/lib/categories';
import { ProfessionalProfile, Review } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getReviewsForProfessional = useReviewsStore((s) => s.getReviewsForProfessional);
  const getAverageRating = useReviewsStore((s) => s.getAverageRating);

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
  const reviews = isProfessional ? getReviewsForProfessional(user.id) : [];
  const ratingData = isProfessional ? getAverageRating(user.id) : { rating: 0, count: 0 };
  const memberSince = format(new Date(user.createdAt), 'MMMM yyyy');

  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? '#4A9BAD' : '#475569'}
            fill={star <= rating ? '#4A9BAD' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderReview = (review: Review) => {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });

    return (
      <View key={review.id} className="bg-skillset-bg-card rounded-xl p-4 mb-3">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
            {review.clientPhotoUrl ? (
              <Image
                source={{ uri: review.clientPhotoUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <UserCircle color="#3B82F6" size={20} />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-medium">{review.clientName}</Text>
            <View className="flex-row items-center mt-0.5">
              {renderStars(review.rating)}
              <Text className="text-slate-500 text-xs ml-2">{timeAgo}</Text>
            </View>
          </View>
        </View>

        {review.serviceCategoryName && (
          <View className="mb-2">
            <View className="bg-skillset-bg-input/50 px-2 py-1 rounded self-start">
              <Text className="text-slate-400 text-xs">{review.serviceCategoryName}</Text>
            </View>
          </View>
        )}

        <Text className="text-slate-300 leading-5">{review.description}</Text>

        {review.media.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            style={{ flexGrow: 0 }}
          >
            {review.media.map((item) => (
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
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-skillset-bg-dark">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#122A30', '#0A1A1F']}
          style={{ paddingTop: 20, paddingBottom: 30 }}
        >
          <View className="items-center px-6">
            <View
              className={`w-24 h-24 rounded-full items-center justify-center ${
                isProfessional ? 'bg-skillset-teal/20' : 'bg-blue-500/20'
              }`}
            >
              {user.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : isProfessional ? (
                <Briefcase color="#4A9BAD" size={40} />
              ) : (
                <UserCircle color="#3B82F6" size={40} />
              )}
            </View>

            <Text className="text-white text-2xl font-bold mt-4">{user.name}</Text>

            <View className="flex-row items-center mt-2">
              <View
                className={`px-3 py-1 rounded-full ${
                  isProfessional ? 'bg-skillset-teal/20' : 'bg-blue-500/20'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isProfessional ? 'text-skillset-teal-light' : 'text-blue-400'
                  }`}
                >
                  {isProfessional ? 'Professional' : 'Client'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-3">
              <MapPin color="#5A7A82" size={16} />
              <Text className="text-slate-400 ml-1">{user.city}</Text>
            </View>

            {/* Member Since */}
            <View className="flex-row items-center mt-2">
              <Calendar color="#5A7A82" size={14} />
              <Text className="text-slate-500 text-sm ml-1">Member since {memberSince}</Text>
            </View>

            {/* Create Post Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/create-post');
              }}
              className="mt-5"
            >
              <LinearGradient
                colors={['#4A9BAD', '#3A7A8A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus color="white" size={20} />
                <Text className="text-white font-semibold text-base ml-2">
                  {isProfessional ? 'Share Your Work' : 'Share a Job Done'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Professional Details */}
        {isProfessional && (
          <View className="px-6 mt-6">
            {/* Trade */}
            {professionalUser.trade && (
              <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Award color="#4A9BAD" size={20} />
                  <Text className="text-white font-semibold ml-2">Trade</Text>
                </View>
                <Text className="text-slate-300">{professionalUser.trade}</Text>
              </View>
            )}

            {/* Experience & Rating */}
            <View className="flex-row mb-4">
              <View className="flex-1 bg-skillset-bg-card rounded-xl p-4 mr-2">
                <View className="flex-row items-center mb-1">
                  <Clock color="#5A7A82" size={16} />
                  <Text className="text-slate-400 text-sm ml-1">Experience</Text>
                </View>
                <Text className="text-white text-xl font-bold">
                  {professionalUser.yearsExperience} years
                </Text>
              </View>

              <View className="flex-1 bg-skillset-bg-card rounded-xl p-4 ml-2">
                <View className="flex-row items-center mb-1">
                  <Star color="#5A7A82" size={16} />
                  <Text className="text-slate-400 text-sm ml-1">Rating</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-white text-xl font-bold">
                    {ratingData.count > 0 ? ratingData.rating.toFixed(1) : 'N/A'}
                  </Text>
                  {ratingData.count > 0 && (
                    <Text className="text-slate-500 text-sm ml-1">({ratingData.count})</Text>
                  )}
                </View>
              </View>
            </View>

            {/* License */}
            {professionalUser.licenseNumber && (
              <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <FileText color="#5A7A82" size={20} />
                  <Text className="text-white font-semibold ml-2">License Number</Text>
                </View>
                <Text className="text-slate-300">{professionalUser.licenseNumber}</Text>
              </View>
            )}

            {/* Service Categories */}
            {professionalUser.serviceCategories.length > 0 && (
              <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-3">Service Categories</Text>
                <View className="flex-row flex-wrap gap-2">
                  {professionalUser.serviceCategories.map((catId) => {
                    const category = getCategoryById(catId);
                    return category ? (
                      <View key={catId} className="bg-skillset-bg-input px-3 py-1.5 rounded-full">
                        <Text className="text-slate-300 text-sm">{category.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {/* Service Areas */}
            {professionalUser.serviceArea.length > 0 && (
              <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <MapPin color="#5A7A82" size={20} />
                  <Text className="text-white font-semibold ml-2">Service Areas</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {professionalUser.serviceArea.map((area, index) => (
                    <View key={index} className="bg-skillset-bg-input px-3 py-1.5 rounded-full">
                      <Text className="text-slate-300 text-sm">{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            {professionalUser.description && (
              <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-2">About</Text>
                <Text className="text-slate-300 leading-6">{professionalUser.description}</Text>
              </View>
            )}

            {/* Portfolio */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Images color="#5A7A82" size={20} />
                  <Text className="text-white font-semibold ml-2">Portfolio</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/edit-portfolio')}
                  className="bg-skillset-bg-input px-3 py-1.5 rounded-lg"
                >
                  <Text className="text-skillset-teal text-sm font-medium">Edit</Text>
                </Pressable>
              </View>

              {professionalUser.portfolioMedia && professionalUser.portfolioMedia.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                >
                  {professionalUser.portfolioMedia.map((item) => (
                    <View key={item.id} className="mr-3">
                      {item.type === 'image' ? (
                        <Image
                          source={{ uri: item.uri }}
                          style={{ width: 120, height: 120, borderRadius: 12 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="w-[120px] h-[120px] rounded-xl bg-skillset-bg-card items-center justify-center overflow-hidden">
                          <Video
                            source={{ uri: item.uri }}
                            style={{ width: 120, height: 120 }}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                          />
                          <View className="absolute bg-black/50 rounded-full p-2">
                            <Play color="white" size={20} fill="white" />
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Pressable
                  onPress={() => router.push('/edit-portfolio')}
                  className="bg-skillset-bg-card/50 rounded-xl p-6 items-center border border-dashed border-skillset-border"
                >
                  <Images color="#5A7A82" size={32} />
                  <Text className="text-slate-400 text-center mt-2">
                    Add photos and videos to showcase your work
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Reviews Section */}
            <View className="mt-2 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Star color="#4A9BAD" size={20} fill="#4A9BAD" />
                  <Text className="text-white font-semibold ml-2">
                    Your Reviews ({reviews.length})
                  </Text>
                </View>
                {ratingData.count > 0 && (
                  <View className="flex-row items-center">
                    <Text className="text-skillset-teal font-bold mr-1">
                      {ratingData.rating.toFixed(1)}
                    </Text>
                    {renderStars(Math.round(ratingData.rating), 12)}
                  </View>
                )}
              </View>

              {reviews.length > 0 ? (
                reviews.slice(0, 3).map(renderReview)
              ) : (
                <View className="bg-skillset-bg-card/50 rounded-xl p-6 items-center">
                  <Star color="#5A7A82" size={32} />
                  <Text className="text-slate-400 text-center mt-2">
                    No reviews yet. Complete great work to earn reviews!
                  </Text>
                </View>
              )}

              {reviews.length > 3 && (
                <Pressable
                  onPress={() => router.push(`/profile/${user.id}`)}
                  className="bg-skillset-bg-card rounded-xl p-3 items-center mt-2"
                >
                  <Text className="text-skillset-teal font-medium">
                    View All {reviews.length} Reviews
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Client - Member Since Card */}
        {!isProfessional && (
          <View className="px-6 mt-6">
            <View className="bg-skillset-bg-card rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <Calendar color="#3B82F6" size={20} />
                <Text className="text-white font-semibold ml-2">Member Since</Text>
              </View>
              <Text className="text-slate-300 mt-2">{memberSince}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="px-6 mt-2">
          {isProfessional && (
            <Pressable
              onPress={() => router.push('/complete-profile')}
              className="flex-row items-center bg-skillset-bg-card rounded-xl p-4 mb-3 active:bg-skillset-bg-input"
            >
              <Edit3 color="#5A7A82" size={20} />
              <Text className="text-white font-medium ml-3">Edit Profile</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center bg-skillset-bg-card rounded-xl p-4 active:bg-skillset-bg-input"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-red-400 font-medium ml-3">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

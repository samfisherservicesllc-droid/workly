import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageSquare, Briefcase, UserCircle } from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { useMessagesStore } from '@/lib/state/messages-store';
import { Conversation } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const getConversationsForUser = useMessagesStore((s) => s.getConversationsForUser);

  const userConversations = user ? getConversationsForUser(user.id) : [];

  const renderConversation = ({ item: conversation }: { item: Conversation }) => {
    if (!user) return null;

    // Find the other participant
    const otherIndex = conversation.participants.findIndex((p) => p !== user.id);
    const otherName = conversation.participantNames[otherIndex];
    const otherPhoto = conversation.participantPhotos[otherIndex];
    const otherRole = conversation.participantRoles[otherIndex];

    const timeAgo = conversation.lastMessageAt
      ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
      : '';

    return (
      <Pressable
        onPress={() => router.push(`/conversation/${conversation.id}`)}
        className="flex-row items-center px-4 py-4 border-b border-workly-border active:bg-workly-bg-card/50"
      >
        <View
          className={`w-14 h-14 rounded-full items-center justify-center ${
            otherRole === 'professional' ? 'bg-workly-teal/20' : 'bg-blue-500/20'
          }`}
        >
          {otherPhoto ? (
            <Image
              source={{ uri: otherPhoto }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
          ) : otherRole === 'professional' ? (
            <Briefcase color="#2979FF" size={26} />
          ) : (
            <UserCircle color="#3B82F6" size={26} />
          )}
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-white font-semibold" numberOfLines={1}>
                {otherName}
              </Text>
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  otherRole === 'professional' ? 'bg-workly-teal/20' : 'bg-blue-500/20'
                }`}
              >
                <Text
                  className={`text-xs ${
                    otherRole === 'professional' ? 'text-workly-teal-light' : 'text-blue-400'
                  }`}
                >
                  {otherRole === 'professional' ? 'Pro' : 'Client'}
                </Text>
              </View>
            </View>
            {timeAgo && <Text className="text-workly-text-subtle text-xs">{timeAgo}</Text>}
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-workly-muted flex-1 mr-2" numberOfLines={1}>
              {conversation.lastMessage || 'No messages yet'}
            </Text>
            {conversation.unreadCount > 0 && (
              <View className="bg-workly-teal rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                <Text className="text-white text-xs font-bold">{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-workly-bg-dark">
      {userConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-workly-bg-card rounded-full items-center justify-center mb-4">
            <MessageSquare color="#4A6FA5" size={32} />
          </View>
          <Text className="text-white text-xl font-semibold text-center">No messages yet</Text>
          <Text className="text-workly-muted text-center mt-2">
            Start a conversation by tapping on a profile from the feed
          </Text>
        </View>
      ) : (
        <FlashList
          data={userConversations}
          renderItem={renderConversation}
          estimatedItemSize={80}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

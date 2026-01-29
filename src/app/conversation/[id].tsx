import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, Send, Briefcase, UserCircle, Flag } from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { useMessagesStore } from '@/lib/state/messages-store';
import { Message } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import * as Haptics from 'expo-haptics';
import ReportModal from '@/components/ReportModal';

export default function ConversationScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const conversation = useMessagesStore((s) => s.getConversation(conversationId ?? ''));
  const messages = useMessagesStore((s) => s.getMessages(conversationId ?? ''));
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);

  const [messageText, setMessageText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (conversationId && user) {
      markAsRead(conversationId, user.id);
    }
  }, [conversationId, user?.id]);

  if (!user || !conversation) {
    return (
      <View className="flex-1 bg-skillset-bg-dark items-center justify-center">
        <Text className="text-white">Conversation not found</Text>
      </View>
    );
  }

  // Find the other participant
  const otherIndex = conversation.participants.findIndex((p) => p !== user.id);
  const otherUserId = conversation.participants[otherIndex];
  const otherName = conversation.participantNames[otherIndex];
  const otherPhoto = conversation.participantPhotos[otherIndex];
  const otherRole = conversation.participantRoles[otherIndex];

  const handleSend = () => {
    if (!messageText.trim()) return;

    sendMessage(conversationId ?? '', user.id, otherUserId, messageText.trim());
    setMessageText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReportModal(true);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isOwnMessage = message.senderId === user.id;

    return (
      <View
        className={`px-4 py-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}
      >
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            isOwnMessage
              ? 'bg-skillset-teal rounded-br-sm'
              : 'bg-skillset-bg-card rounded-bl-sm'
          }`}
        >
          <Text className={isOwnMessage ? 'text-white' : 'text-slate-200'}>
            {message.content}
          </Text>
        </View>
        <Text className="text-slate-500 text-xs mt-1">
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-skillset-bg-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#122A30' },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </Pressable>
          ),
          headerTitle: () => (
            <Pressable
              onPress={() => router.push(`/profile/${otherUserId}`)}
              className="flex-row items-center"
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  otherRole === 'professional' ? 'bg-skillset-teal/20' : 'bg-blue-500/20'
                }`}
              >
                {otherPhoto ? (
                  <Image
                    source={{ uri: otherPhoto }}
                    style={{ width: 36, height: 36, borderRadius: 18 }}
                  />
                ) : otherRole === 'professional' ? (
                  <Briefcase color="#4A9BAD" size={18} />
                ) : (
                  <UserCircle color="#3B82F6" size={18} />
                )}
              </View>
              <View className="ml-3">
                <Text className="text-white font-semibold">{otherName}</Text>
                <Text
                  className={`text-xs ${
                    otherRole === 'professional' ? 'text-skillset-teal-light' : 'text-blue-400'
                  }`}
                >
                  {otherRole === 'professional' ? 'Professional' : 'Client'}
                </Text>
              </View>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleReport}
              className="w-10 h-10 items-center justify-center"
            >
              <Flag color="#5A7A82" size={20} />
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center ${
                otherRole === 'professional' ? 'bg-skillset-teal/20' : 'bg-blue-500/20'
              }`}
            >
              {otherRole === 'professional' ? (
                <Briefcase color="#4A9BAD" size={32} />
              ) : (
                <UserCircle color="#3B82F6" size={32} />
              )}
            </View>
            <Text className="text-white font-semibold mt-4">{otherName}</Text>
            <Text className="text-slate-400 text-center mt-2">
              Start a conversation about their services
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Message Input */}
        <SafeAreaView edges={['bottom']} className="border-t border-skillset-border">
          <View className="flex-row items-center px-4 py-3">
            <TextInput
              className="flex-1 bg-skillset-bg-card rounded-full px-4 py-3 text-white text-base mr-3"
              placeholder="Type a message..."
              placeholderTextColor="#5A7A82"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={handleSend}
              disabled={!messageText.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                messageText.trim() ? 'bg-skillset-teal' : 'bg-skillset-bg-card'
              }`}
            >
              <Send
                color={messageText.trim() ? 'white' : '#5A7A82'}
                size={20}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={otherUserId}
        reportedUserName={otherName}
      />
    </View>
  );
}

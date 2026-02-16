import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, UserRole } from '../types';

interface MessagesState {
  conversations: Conversation[];
  messages: Message[];

  // Actions
  startConversation: (
    userId: string,
    userName: string,
    userPhoto: string | undefined,
    userRole: UserRole,
    otherUserId: string,
    otherUserName: string,
    otherUserPhoto: string | undefined,
    otherUserRole: UserRole
  ) => string;
  sendMessage: (conversationId: string, senderId: string, receiverId: string, content: string) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
  getConversationsForUser: (userId: string) => Conversation[];
  findExistingConversation: (userId: string, otherUserId: string) => Conversation | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],

      startConversation: (
        userId,
        userName,
        userPhoto,
        userRole,
        otherUserId,
        otherUserName,
        otherUserPhoto,
        otherUserRole
      ) => {
        // Check if conversation already exists
        const existing = get().conversations.find(
          (c) =>
            c.participants.includes(userId) && c.participants.includes(otherUserId)
        );

        if (existing) return existing.id;

        const newConversation: Conversation = {
          id: generateId(),
          participants: [userId, otherUserId],
          participantNames: [userName, otherUserName],
          participantPhotos: [userPhoto, otherUserPhoto],
          participantRoles: [userRole, otherUserRole],
          unreadCount: 0,
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
        }));

        return newConversation.id;
      },

      sendMessage: (conversationId, senderId, receiverId, content) => {
        const newMessage: Message = {
          id: generateId(),
          conversationId,
          senderId,
          receiverId,
          content,
          createdAt: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: content,
                  lastMessageAt: newMessage.createdAt,
                  unreadCount: c.unreadCount + 1,
                }
              : c
          ),
        }));
      },

      markAsRead: (conversationId, userId) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.conversationId === conversationId && m.receiverId === userId
              ? { ...m, read: true }
              : m
          ),
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        }));
      },

      getConversation: (conversationId) => {
        return get().conversations.find((c) => c.id === conversationId);
      },

      getMessages: (conversationId) => {
        return get()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      getConversationsForUser: (userId) => {
        return get()
          .conversations.filter((c) => c.participants.includes(userId))
          .sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
          });
      },

      findExistingConversation: (userId, otherUserId) => {
        return get().conversations.find(
          (c) =>
            c.participants.includes(userId) && c.participants.includes(otherUserId)
        );
      },
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, PostReaction, FeedFilters } from '../types';
import { getCategoryName } from '../categories';

interface PostsState {
  posts: Post[];
  reactions: PostReaction[];
  filters: FeedFilters;

  // Actions
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'dislikes' | 'userReaction' | 'serviceCategoryName'>) => void;
  reactToPost: (postId: string, userId: string, reaction: 'like' | 'dislike') => void;
  removeReaction: (postId: string, userId: string) => void;
  setFilters: (filters: Partial<FeedFilters>) => void;
  getFilteredPosts: (userId?: string) => Post[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      reactions: [],
      filters: {
        type: 'all',
        categoryId: undefined,
        city: undefined,
      },

      createPost: (postData) => {
        const newPost: Post = {
          ...postData,
          id: generateId(),
          serviceCategoryName: getCategoryName(postData.serviceCategoryId),
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          userReaction: null,
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      },

      reactToPost: (postId, userId, reaction) => {
        const { reactions } = get();

        // Check if user already reacted
        const existingReaction = reactions.find(
          (r) => r.postId === postId && r.userId === userId
        );

        if (existingReaction) {
          // Update existing reaction
          if (existingReaction.reaction === reaction) {
            // Same reaction, remove it
            set((state) => ({
              reactions: state.reactions.filter(
                (r) => !(r.postId === postId && r.userId === userId)
              ),
              posts: state.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      [reaction === 'like' ? 'likes' : 'dislikes']:
                        p[reaction === 'like' ? 'likes' : 'dislikes'] - 1,
                    }
                  : p
              ),
            }));
          } else {
            // Different reaction, switch
            set((state) => ({
              reactions: state.reactions.map((r) =>
                r.postId === postId && r.userId === userId
                  ? { ...r, reaction }
                  : r
              ),
              posts: state.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      likes: reaction === 'like' ? p.likes + 1 : p.likes - 1,
                      dislikes: reaction === 'dislike' ? p.dislikes + 1 : p.dislikes - 1,
                    }
                  : p
              ),
            }));
          }
        } else {
          // New reaction
          const newReaction: PostReaction = {
            id: generateId(),
            postId,
            userId,
            reaction,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            reactions: [...state.reactions, newReaction],
            posts: state.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    [reaction === 'like' ? 'likes' : 'dislikes']:
                      p[reaction === 'like' ? 'likes' : 'dislikes'] + 1,
                  }
                : p
            ),
          }));
        }
      },

      removeReaction: (postId, userId) => {
        const { reactions } = get();
        const existingReaction = reactions.find(
          (r) => r.postId === postId && r.userId === userId
        );

        if (!existingReaction) return;

        set((state) => ({
          reactions: state.reactions.filter(
            (r) => !(r.postId === postId && r.userId === userId)
          ),
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  [existingReaction.reaction === 'like' ? 'likes' : 'dislikes']:
                    p[existingReaction.reaction === 'like' ? 'likes' : 'dislikes'] - 1,
                }
              : p
          ),
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      getFilteredPosts: (userId) => {
        const { posts, reactions, filters } = get();

        let filtered = [...posts];

        // Filter by type
        if (filters.type === 'clients') {
          filtered = filtered.filter((p) => p.authorRole === 'client');
        } else if (filters.type === 'professionals') {
          filtered = filtered.filter((p) => p.authorRole === 'professional');
        }

        // Filter by category
        if (filters.categoryId) {
          filtered = filtered.filter((p) => p.serviceCategoryId === filters.categoryId);
        }

        // Filter by city
        if (filters.city) {
          filtered = filtered.filter(
            (p) => p.city.toLowerCase().includes(filters.city!.toLowerCase())
          );
        }

        // Add user reaction to each post
        if (userId) {
          filtered = filtered.map((p) => {
            const userReaction = reactions.find(
              (r) => r.postId === p.id && r.userId === userId
            );
            return {
              ...p,
              userReaction: userReaction?.reaction ?? null,
            };
          });
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
      },
    }),
    {
      name: 'posts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

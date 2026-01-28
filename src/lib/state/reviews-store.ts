import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review, MediaItem } from '../types';

interface ReviewsState {
  reviews: Review[];

  // Actions
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getReviewsForProfessional: (professionalId: string) => Review[];
  getAverageRating: (professionalId: string) => { rating: number; count: number };
  hasClientReviewedProfessional: (clientId: string, professionalId: string) => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      getReviewsForProfessional: (professionalId) => {
        return get()
          .reviews.filter((r) => r.professionalId === professionalId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getAverageRating: (professionalId) => {
        const reviews = get().reviews.filter((r) => r.professionalId === professionalId);
        if (reviews.length === 0) return { rating: 0, count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
          rating: sum / reviews.length,
          count: reviews.length,
        };
      },

      hasClientReviewedProfessional: (clientId, professionalId) => {
        return get().reviews.some(
          (r) => r.clientId === clientId && r.professionalId === professionalId
        );
      },
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClientReview } from '../types';

interface ClientReviewsState {
  reviews: ClientReview[];

  // Actions
  addReview: (review: Omit<ClientReview, 'id' | 'createdAt'>) => void;
  getReviewsForClient: (clientId: string) => ClientReview[];
  getAverageRating: (clientId: string) => { rating: number; count: number };
  hasProfessionalReviewedClient: (professionalId: string, clientId: string) => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useClientReviewsStore = create<ClientReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (reviewData) => {
        const newReview: ClientReview = {
          ...reviewData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      getReviewsForClient: (clientId) => {
        return get()
          .reviews.filter((r) => r.clientId === clientId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getAverageRating: (clientId) => {
        const reviews = get().reviews.filter((r) => r.clientId === clientId);
        if (reviews.length === 0) return { rating: 0, count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
          rating: sum / reviews.length,
          count: reviews.length,
        };
      },

      hasProfessionalReviewedClient: (professionalId, clientId) => {
        return get().reviews.some(
          (r) => r.professionalId === professionalId && r.clientId === clientId
        );
      },
    }),
    {
      name: 'client-reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

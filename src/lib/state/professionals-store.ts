import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfessionalProfile, User } from '../types';

interface ProfessionalsState {
  professionals: ProfessionalProfile[];

  // Actions
  loadProfessionals: () => Promise<void>;
  searchProfessionals: (query: string, filters?: SearchFilters) => ProfessionalProfile[];
  getProfessionalById: (id: string) => ProfessionalProfile | undefined;
}

export interface SearchFilters {
  categoryId?: string;
  city?: string;
  state?: string;
  minRating?: number;
  minExperience?: number;
}

export const useProfessionalsStore = create<ProfessionalsState>()(
  persist(
    (set, get) => ({
      professionals: [],

      loadProfessionals: async () => {
        const storedUsers = await AsyncStorage.getItem('registered-users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        const professionals = users.filter(
          (u): u is ProfessionalProfile => u.role === 'professional'
        );

        set({ professionals });
      },

      searchProfessionals: (query: string, filters?: SearchFilters) => {
        const { professionals } = get();
        const lowerQuery = query.toLowerCase().trim();

        let results = [...professionals];

        // Text search
        if (lowerQuery) {
          results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(lowerQuery) ||
              p.trade.toLowerCase().includes(lowerQuery) ||
              p.description?.toLowerCase().includes(lowerQuery) ||
              p.city.toLowerCase().includes(lowerQuery) ||
              p.serviceArea.some((area) => area.toLowerCase().includes(lowerQuery))
          );
        }

        // Category filter
        if (filters?.categoryId) {
          results = results.filter((p) =>
            p.serviceCategories.includes(filters.categoryId!)
          );
        }

        // City filter
        if (filters?.city) {
          const lowerCity = filters.city.toLowerCase();
          results = results.filter(
            (p) =>
              p.city.toLowerCase().includes(lowerCity) ||
              p.serviceArea.some((area) => area.toLowerCase().includes(lowerCity))
          );
        }

        // State filter
        if (filters?.state) {
          const lowerState = filters.state.toLowerCase();
          results = results.filter(
            (p) =>
              p.city.toLowerCase().includes(lowerState) ||
              p.serviceArea.some((area) => area.toLowerCase().includes(lowerState))
          );
        }

        // Min rating filter
        if (filters?.minRating) {
          results = results.filter((p) => (p.rating ?? 0) >= filters.minRating!);
        }

        // Min experience filter
        if (filters?.minExperience) {
          results = results.filter((p) => p.yearsExperience >= filters.minExperience!);
        }

        // Sort by rating (descending), then by experience
        results.sort((a, b) => {
          const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          return b.yearsExperience - a.yearsExperience;
        });

        return results;
      },

      getProfessionalById: (id: string) => {
        const { professionals } = get();
        return professionals.find((p) => p.id === id);
      },
    }),
    {
      name: 'professionals-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

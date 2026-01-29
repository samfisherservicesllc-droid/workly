import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobRequest, MediaItem } from '../types';

interface JobRequestsState {
  jobRequests: JobRequest[];

  // Actions
  addJobRequest: (request: Omit<JobRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateJobRequest: (id: string, updates: Partial<JobRequest>) => void;
  deleteJobRequest: (id: string) => void;
  getJobRequestsByClient: (clientId: string) => JobRequest[];
  getOpenJobRequests: () => JobRequest[];
  searchJobRequests: (query: string, filters?: JobRequestFilters) => JobRequest[];
}

export interface JobRequestFilters {
  categoryId?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  keywords?: string;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useJobRequestsStore = create<JobRequestsState>()(
  persist(
    (set, get) => ({
      jobRequests: [],

      addJobRequest: (request) => {
        const newRequest: JobRequest = {
          ...request,
          id: generateId(),
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          jobRequests: [newRequest, ...state.jobRequests],
        }));
      },

      updateJobRequest: (id, updates) => {
        set((state) => ({
          jobRequests: state.jobRequests.map((req) =>
            req.id === id
              ? { ...req, ...updates, updatedAt: new Date().toISOString() }
              : req
          ),
        }));
      },

      deleteJobRequest: (id) => {
        set((state) => ({
          jobRequests: state.jobRequests.filter((req) => req.id !== id),
        }));
      },

      getJobRequestsByClient: (clientId) => {
        return get().jobRequests.filter((req) => req.clientId === clientId);
      },

      getOpenJobRequests: () => {
        return get().jobRequests.filter((req) => req.status === 'open');
      },

      searchJobRequests: (query, filters) => {
        let results = get().jobRequests.filter((req) => req.status === 'open');
        const lowerQuery = query.toLowerCase().trim();

        // Text search
        if (lowerQuery) {
          results = results.filter(
            (req) =>
              req.title.toLowerCase().includes(lowerQuery) ||
              req.description.toLowerCase().includes(lowerQuery) ||
              req.serviceCategoryName.toLowerCase().includes(lowerQuery) ||
              req.city.toLowerCase().includes(lowerQuery) ||
              req.neighborhood.toLowerCase().includes(lowerQuery)
          );
        }

        // Category filter
        if (filters?.categoryId) {
          results = results.filter((req) => req.serviceCategoryId === filters.categoryId);
        }

        // City filter
        if (filters?.city) {
          const lowerCity = filters.city.toLowerCase();
          results = results.filter((req) =>
            req.city.toLowerCase().includes(lowerCity) ||
            req.neighborhood.toLowerCase().includes(lowerCity)
          );
        }

        // State filter
        if (filters?.state) {
          const lowerState = filters.state.toLowerCase();
          results = results.filter((req) =>
            req.state.toLowerCase().includes(lowerState)
          );
        }

        // Zip code filter
        if (filters?.zipCode) {
          results = results.filter((req) =>
            req.zipCode.startsWith(filters.zipCode!)
          );
        }

        // Keywords filter
        if (filters?.keywords) {
          const keywords = filters.keywords.toLowerCase().split(/\s+/).filter(Boolean);
          results = results.filter((req) => {
            const searchableText = [
              req.title,
              req.description,
              req.neighborhood,
            ].join(' ').toLowerCase();
            return keywords.every((keyword) => searchableText.includes(keyword));
          });
        }

        // Sort by date (newest first)
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return results;
      },
    }),
    {
      name: 'job-requests-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

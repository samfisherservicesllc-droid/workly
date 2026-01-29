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

// Mock job requests for testing
const MOCK_JOB_REQUESTS: JobRequest[] = [
  {
    id: 'job1',
    clientId: 'client1',
    clientName: 'Sarah Johnson',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    title: 'Bathroom sink leaking under cabinet',
    description: 'My bathroom sink has been leaking for about a week now. Water is pooling under the cabinet and I need it fixed ASAP. The leak seems to be coming from the drain pipe connection.',
    serviceCategoryId: 'plumbing',
    serviceCategoryName: 'Plumbing',
    neighborhood: 'Downtown',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job2',
    clientId: 'client2',
    clientName: 'Michael Chen',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    title: 'Need living room and bedroom painted',
    description: 'Looking for a professional painter to paint my living room and master bedroom. Both rooms are standard size. I want to go from beige to a light gray color. Paint will be provided.',
    serviceCategoryId: 'painting',
    serviceCategoryName: 'Painting',
    neighborhood: 'East Side',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job3',
    clientId: 'client3',
    clientName: 'Emily Rodriguez',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    title: 'AC not cooling properly',
    description: 'My central AC unit is running but not cooling the house below 80 degrees. It\'s a 3-ton unit installed about 5 years ago. Might need refrigerant or could be a bigger issue.',
    serviceCategoryId: 'hvac',
    serviceCategoryName: 'HVAC',
    neighborhood: 'Mueller',
    city: 'Austin',
    state: 'TX',
    zipCode: '78723',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job4',
    clientId: 'client4',
    clientName: 'David Williams',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    title: 'Install ceiling fan in bedroom',
    description: 'I have a ceiling fan I purchased that needs to be installed in my master bedroom. There\'s already an electrical box in the ceiling from a previous light fixture. Need someone with electrical experience.',
    serviceCategoryId: 'electrical',
    serviceCategoryName: 'Electrical',
    neighborhood: 'Round Rock',
    city: 'Round Rock',
    state: 'TX',
    zipCode: '78665',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job5',
    clientId: 'client5',
    clientName: 'Jessica Thompson',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    title: 'Deep clean 3BR apartment - moving out',
    description: 'Moving out of my 3 bedroom apartment and need a thorough deep clean to get my deposit back. Includes kitchen, 2 bathrooms, all bedrooms, and common areas. Available this weekend.',
    serviceCategoryId: 'deep-cleaning',
    serviceCategoryName: 'Deep Cleaning',
    neighborhood: 'Domain',
    city: 'Austin',
    state: 'TX',
    zipCode: '78758',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    updatedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job6',
    clientId: 'client6',
    clientName: 'Robert Martinez',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    title: 'Build wooden deck in backyard',
    description: 'Looking for a carpenter to build a 12x16 wooden deck in my backyard. Want pressure-treated lumber with composite decking boards. Need someone who can pull permits if required.',
    serviceCategoryId: 'deck-patio',
    serviceCategoryName: 'Deck & Patio',
    neighborhood: 'Cedar Park',
    city: 'Cedar Park',
    state: 'TX',
    zipCode: '78613',
    media: [],
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useJobRequestsStore = create<JobRequestsState>()(
  persist(
    (set, get) => ({
      jobRequests: MOCK_JOB_REQUESTS,

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

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ClientProfile, ProfessionalProfile, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, city: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateProfessionalProfile: (updates: Partial<ProfessionalProfile>) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Simulate API call - in production, this would be a real auth endpoint
        await new Promise((resolve) => setTimeout(resolve, 800));

        // For demo, check if we have stored users
        const storedUsers = await AsyncStorage.getItem('registered-users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      register: async (email: string, password: string, name: string, role: UserRole, city: string) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const storedUsers = await AsyncStorage.getItem('registered-users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        // Check if email already exists
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          set({ isLoading: false });
          return false;
        }

        const baseUser = {
          id: generateId(),
          email,
          name,
          city,
          createdAt: new Date().toISOString(),
        };

        let newUser: User;

        if (role === 'client') {
          newUser = {
            ...baseUser,
            role: 'client',
          } as ClientProfile;
        } else {
          newUser = {
            ...baseUser,
            role: 'professional',
            trade: '',
            serviceCategories: [],
            yearsExperience: 0,
            serviceArea: [city],
            description: '',
          } as ProfessionalProfile;
        }

        users.push(newUser);
        await AsyncStorage.setItem('registered-users', JSON.stringify(users));

        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates } as User;
        set({ user: updatedUser });

        // Also update in stored users
        AsyncStorage.getItem('registered-users').then((stored) => {
          const users: User[] = stored ? JSON.parse(stored) : [];
          const index = users.findIndex((u) => u.id === currentUser.id);
          if (index !== -1) {
            users[index] = updatedUser;
            AsyncStorage.setItem('registered-users', JSON.stringify(users));
          }
        });
      },

      updateProfessionalProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser || currentUser.role !== 'professional') return;

        const updatedUser = { ...currentUser, ...updates } as ProfessionalProfile;
        set({ user: updatedUser });

        // Also update in stored users
        AsyncStorage.getItem('registered-users').then((stored) => {
          const users: User[] = stored ? JSON.parse(stored) : [];
          const index = users.findIndex((u) => u.id === currentUser.id);
          if (index !== -1) {
            users[index] = updatedUser;
            AsyncStorage.setItem('registered-users', JSON.stringify(users));
          }
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Post, ProfessionalProfile, ClientProfile } from './types';

// Sample professionals
const sampleProfessionals: ProfessionalProfile[] = [
  {
    id: 'pro-1',
    email: 'mike.johnson@email.com',
    role: 'professional',
    name: 'Mike Johnson',
    city: 'Los Angeles',
    createdAt: '2024-01-15T10:00:00Z',
    trade: 'Master Electrician',
    serviceCategories: ['electrical', 'handyman'],
    yearsExperience: 12,
    licenseNumber: 'CA-ELE-123456',
    serviceArea: ['Los Angeles', 'Santa Monica', 'Pasadena'],
    description:
      'Licensed master electrician with over 12 years of experience. Specializing in residential rewiring, panel upgrades, and smart home installations.',
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: 'pro-2',
    email: 'sarah.green@email.com',
    role: 'professional',
    name: 'Sarah Green',
    city: 'San Francisco',
    createdAt: '2024-02-20T14:30:00Z',
    trade: 'Landscape Designer',
    serviceCategories: ['landscaping'],
    yearsExperience: 8,
    serviceArea: ['San Francisco', 'Oakland', 'Berkeley'],
    description:
      'Creating beautiful outdoor spaces that blend functionality with aesthetics. Sustainable design practices and native plant expertise.',
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: 'pro-3',
    email: 'david.chen@email.com',
    role: 'professional',
    name: 'David Chen',
    city: 'Seattle',
    createdAt: '2024-01-08T09:15:00Z',
    trade: 'Professional Cleaner',
    serviceCategories: ['house-cleaning'],
    yearsExperience: 5,
    serviceArea: ['Seattle', 'Bellevue', 'Redmond'],
    description:
      'Eco-friendly deep cleaning services for homes and offices. We use only non-toxic, environmentally safe products.',
    rating: 4.7,
    reviewCount: 203,
  },
  {
    id: 'pro-4',
    email: 'amanda.martinez@email.com',
    role: 'professional',
    name: 'Amanda Martinez',
    city: 'Denver',
    createdAt: '2024-03-01T11:45:00Z',
    trade: 'Licensed Plumber',
    serviceCategories: ['plumbing', 'handyman'],
    yearsExperience: 15,
    licenseNumber: 'CO-PLB-789012',
    serviceArea: ['Denver', 'Aurora', 'Lakewood'],
    description:
      'Full-service plumbing for residential and commercial properties. Emergency services available 24/7.',
    rating: 4.9,
    reviewCount: 156,
  },
];

// Sample clients
const sampleClients: ClientProfile[] = [
  {
    id: 'client-1',
    email: 'john.doe@email.com',
    role: 'client',
    name: 'John Doe',
    city: 'Los Angeles',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'client-2',
    email: 'emily.wilson@email.com',
    role: 'client',
    name: 'Emily Wilson',
    city: 'San Francisco',
    createdAt: '2024-02-15T16:30:00Z',
  },
  {
    id: 'client-3',
    email: 'robert.taylor@email.com',
    role: 'client',
    name: 'Robert Taylor',
    city: 'Seattle',
    createdAt: '2024-03-10T12:00:00Z',
  },
];

// Sample posts
const samplePosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'pro-1',
    authorName: 'Mike Johnson',
    authorRole: 'professional',
    type: 'completed_work',
    title: 'Complete electrical panel upgrade',
    description:
      'Just finished upgrading a 100-amp panel to 200-amp for a growing family. Added dedicated circuits for EV charger and home office. Clean install with proper labeling.',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    serviceCategoryId: 'electrical',
    serviceCategoryName: 'Electrical',
    city: 'Los Angeles',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 24,
    dislikes: 1,
  },
  {
    id: 'post-2',
    authorId: 'client-1',
    authorName: 'John Doe',
    authorRole: 'client',
    type: 'job_done',
    title: 'Amazing backyard transformation',
    description:
      'Sarah Green did an incredible job transforming our neglected backyard into a beautiful garden oasis. Highly recommend her landscape design services!',
    images: [
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    ],
    serviceCategoryId: 'landscaping',
    serviceCategoryName: 'Landscaping',
    city: 'San Francisco',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    dislikes: 0,
  },
  {
    id: 'post-3',
    authorId: 'pro-2',
    authorName: 'Sarah Green',
    authorRole: 'professional',
    type: 'completed_work',
    title: 'Drought-resistant front yard',
    description:
      'Converted a thirsty lawn into a stunning drought-resistant landscape. Native California plants, decorative gravel, and drip irrigation. Water bill cut by 60%!',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    ],
    serviceCategoryId: 'landscaping',
    serviceCategoryName: 'Landscaping',
    city: 'San Francisco',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 67,
    dislikes: 2,
  },
  {
    id: 'post-4',
    authorId: 'client-2',
    authorName: 'Emily Wilson',
    authorRole: 'client',
    type: 'job_done',
    title: 'Deep clean made my home feel new',
    description:
      'Had David Chen\'s team do a deep clean before our baby arrived. Every corner was spotless and they used all eco-friendly products. Peace of mind for our growing family.',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    ],
    serviceCategoryId: 'house-cleaning',
    serviceCategoryName: 'House Cleaning',
    city: 'Seattle',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    likes: 32,
    dislikes: 0,
  },
  {
    id: 'post-5',
    authorId: 'pro-4',
    authorName: 'Amanda Martinez',
    authorRole: 'professional',
    type: 'completed_work',
    title: 'Emergency water heater replacement',
    description:
      'Replaced a failed 40-gallon water heater with a new high-efficiency tankless unit. Family had hot water same day. Always prepared for emergencies!',
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
    ],
    serviceCategoryId: 'plumbing',
    serviceCategoryName: 'Plumbing',
    city: 'Denver',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    likes: 28,
    dislikes: 1,
  },
  {
    id: 'post-6',
    authorId: 'pro-3',
    authorName: 'David Chen',
    authorRole: 'professional',
    type: 'completed_work',
    title: 'Move-out deep cleaning complete',
    description:
      'Completed a comprehensive move-out cleaning for a 3-bedroom apartment. All deposits secured for our client. Includes carpet steam cleaning and window washing.',
    images: [
      'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800',
    ],
    serviceCategoryId: 'house-cleaning',
    serviceCategoryName: 'House Cleaning',
    city: 'Seattle',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    likes: 19,
    dislikes: 0,
  },
];

export async function seedSampleData(): Promise<void> {
  // Check if we already have data
  const existingUsers = await AsyncStorage.getItem('registered-users');
  const existingPosts = await AsyncStorage.getItem('posts-storage');

  // Only seed if no users exist yet
  if (!existingUsers) {
    const allUsers: User[] = [...sampleProfessionals, ...sampleClients];
    await AsyncStorage.setItem('registered-users', JSON.stringify(allUsers));
    console.log('Seeded sample users');
  }

  // Only seed posts if storage doesn't exist
  if (!existingPosts) {
    const postsStorage = {
      state: {
        posts: samplePosts,
        reactions: [],
        filters: {
          type: 'all',
          categoryId: undefined,
          city: undefined,
        },
      },
      version: 0,
    };
    await AsyncStorage.setItem('posts-storage', JSON.stringify(postsStorage));
    console.log('Seeded sample posts');
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    'registered-users',
    'auth-storage',
    'posts-storage',
    'messages-storage',
  ]);
  console.log('Cleared all data');
}

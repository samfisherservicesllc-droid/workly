// Service Categories - extensible database-driven categories
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// User Types
export type UserRole = 'client' | 'professional';

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  photoUrl?: string;
  city: string;
  createdAt: string;
}

export interface ClientProfile extends BaseUser {
  role: 'client';
  neighborhood?: string; // Neighborhood within the city
  feedRadius: number; // Radius in miles for feed filtering (default 9)
  rating?: number; // Client rating from professionals
  reviewCount?: number; // Number of reviews from professionals
}

// Media item for portfolio and reviews
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  uri: string;
  thumbnailUri?: string; // For videos
  createdAt: string;
}

export interface ProfessionalProfile extends BaseUser {
  role: 'professional';
  trade: string;
  serviceCategories: string[]; // Array of ServiceCategory IDs
  yearsExperience: number;
  licenseNumber?: string;
  serviceArea: string[]; // Cities/areas served
  feedRadius: number; // Radius in miles for feed filtering (default 20)
  description: string;
  rating?: number;
  reviewCount?: number;
  // Portfolio media (photos and videos)
  portfolioMedia?: MediaItem[];
}

export type User = ClientProfile | ProfessionalProfile;

// Posts
export type PostType = 'completed_work' | 'job_done';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorRole: UserRole;
  type: PostType;
  title: string;
  description: string;
  images: string[];
  serviceCategoryId: string;
  serviceCategoryName: string;
  city: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  // Track user's reaction
  userReaction?: 'like' | 'dislike' | null;
}

// Post Reactions
export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  reaction: 'like' | 'dislike';
  createdAt: string;
}

// Messages
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  participantNames: string[];
  participantPhotos: (string | undefined)[];
  participantRoles: UserRole[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// Feed Filters
export type FeedFilter = 'all' | 'clients' | 'professionals';

export interface FeedFilters {
  type: FeedFilter;
  categoryId?: string;
  city?: string;
}

// Reviews (from clients about professionals)
export interface Review {
  id: string;
  professionalId: string;
  clientId: string;
  clientName: string;
  clientPhotoUrl?: string;
  rating: number; // 1-5 stars
  description: string; // Up to 250 words
  media: MediaItem[]; // Photos and videos
  serviceCategoryId?: string;
  serviceCategoryName?: string;
  createdAt: string;
}

// Client Reviews (from professionals about clients)
export interface ClientReview {
  id: string;
  clientId: string;
  professionalId: string;
  professionalName: string;
  professionalPhotoUrl?: string;
  rating: number; // 1-5 stars
  description: string; // Feedback about working with the client
  serviceCategoryId?: string;
  serviceCategoryName?: string;
  createdAt: string;
}

// Reports
export type ReportReason =
  | 'harassment'
  | 'spam'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'scam'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

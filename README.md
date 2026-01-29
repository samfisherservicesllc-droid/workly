# Workly - Local Service Professional Marketplace

A mobile-first app connecting clients with local service professionals. No general social features - focused purely on service discovery and proof of work.

## Brand Colors

Based on the Workly brand with teal accents:

- **Primary Teal**: #4A9BAD
- **Teal Light**: #5DB5C8
- **Teal Dark**: #3A7A8A
- **Background Dark**: #0A1A1F
- **Card Background**: #122A30
- **Input Background**: #1A3A42
- **Border**: #2A4A52

## Features

### User Types
- **Clients**: Find and hire local service professionals
- **Professionals**: Showcase completed work and attract new clients

### Core Functionality

#### Authentication
- Email/password registration and login
- Role selection (Client or Professional)
- Profile completion flow for professionals

#### Profiles
- **Clients**: Name, location, optional photo, member since date
- **Professionals**:
  - Service categories (multi-select from extensible list)
  - Trade/profession
  - Years of experience
  - License number (optional)
  - Service areas (multiple cities)
  - Description
  - Portfolio media (photos and videos)
  - Member since date
  - Reviews from clients

#### Service Categories (Extensible)
- Landscaping, Flooring, Roofing
- Furniture Assembly, House Cleaning
- Babysitting, Dog Sitting, House Sitting
- Plumbing, Electrical, Painting
- Moving, Handyman, HVAC

#### Main Feed
- Professionals post completed work
- Clients post jobs they had done
- Each post tagged by service category + location

#### Feed Filters
- All posts
- Client posts only
- Professional posts only
- Filter by service category

#### Engagement
- Like/dislike per post (1 per user, toggleable)
- Share post link
- Direct 1-to-1 messaging between clients and professionals

#### Report System
- Report users for harassment, spam, fake profiles, scams, or inappropriate content
- Available from profile pages and conversation screens
- Multi-step report flow with reason selection and description
- Prevents duplicate reports from the same user

#### Reviews System
- 5-star rating system
- Written reviews (up to 250 words)
- Photo and video attachments on reviews
- Service category tagging
- Reviews displayed on professional profiles
- Average rating calculation

#### Portfolio
- Professionals can add up to 12 photos/videos
- Showcase completed work visually
- Videos limited to 2 minutes

### Navigation
- **Feed Tab**: Main feed with posts and filters
- **Search Tab**: Find professionals or job leads
- **Messages Tab**: Direct conversations with badge for unread
- **Profile Tab**: View and edit your profile, portfolio, see reviews

### Search Functionality
- **Find Professionals**: Search by name, trade, location, or service category
- **Find Leads**: Search job posts from clients looking for services (Pro subscription required)
- **Filters**: Filter by service category, city, state, keywords
- **Professional Cards**: Show ratings, experience, and service categories
- **Lead Cards**: Show job details with contact option

### Job Requests
- Clients can post job requests visible to professionals
- Include title, description, service category, location details
- Attach photos/videos to describe the job
- Professionals with Pro subscription can view and respond to job requests

### Subscription (Workly Pro)
- **Price**: $9.99/month
- **Benefits**:
  - Access to all job leads from clients
  - Direct client contact
  - Priority messaging
  - Featured profile in search
- **Entitlement**: `leads_access`
- **Implementation**: RevenueCat for subscription management

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── _layout.tsx    # Tab configuration
│   │   ├── index.tsx      # Feed screen
│   │   ├── search.tsx     # Search professionals & leads
│   │   ├── messages.tsx   # Messages list
│   │   └── profile.tsx    # User profile
│   ├── _layout.tsx        # Root navigation
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration with role selection
│   ├── complete-profile.tsx # Professional profile setup
│   ├── create-post.tsx    # Create new post (modal)
│   ├── edit-portfolio.tsx # Edit portfolio media (modal)
│   ├── edit-banner.tsx    # Edit promotional banner (modal)
│   ├── create-job-request.tsx # Create job request (modal)
│   ├── paywall.tsx        # Subscription paywall (modal)
│   ├── write-review/[professionalId].tsx # Write review (modal)
│   ├── conversation/[id].tsx # Chat screen
│   └── profile/[id].tsx   # View other profiles + reviews
├── components/            # Reusable UI components
└── lib/
    ├── types.ts           # TypeScript interfaces
    ├── categories.ts      # Service categories config
    ├── seed-data.ts       # Sample data for testing
    └── state/
        ├── auth-store.ts  # Authentication state (Zustand)
        ├── posts-store.ts # Posts and reactions (Zustand)
        ├── messages-store.ts # Conversations (Zustand)
        ├── reviews-store.ts # Reviews (Zustand)
        ├── professionals-store.ts # Professional search (Zustand)
        └── job-requests-store.ts # Job requests (Zustand)
```

## Data Models

### User (Client)
```typescript
{
  id, email, role: 'client',
  name, city, photoUrl?, createdAt
}
```

### User (Professional)
```typescript
{
  id, email, role: 'professional',
  name, city, photoUrl?, createdAt,
  trade, serviceCategories[], yearsExperience,
  licenseNumber?, serviceArea[], description,
  rating?, reviewCount?, portfolioMedia[]
}
```

### Post
```typescript
{
  id, authorId, authorName, authorRole,
  type: 'completed_work' | 'job_done',
  title, description, images[],
  serviceCategoryId, serviceCategoryName,
  city, createdAt, likes, dislikes
}
```

### Review
```typescript
{
  id, professionalId, clientId, clientName,
  clientPhotoUrl?, rating (1-5), description,
  media[], serviceCategoryId?, createdAt
}
```

### MediaItem
```typescript
{
  id, type: 'image' | 'video',
  uri, thumbnailUri?, createdAt
}
```

### Conversation
```typescript
{
  id, participants[], participantNames[],
  participantPhotos[], participantRoles[],
  lastMessage?, lastMessageAt?, unreadCount
}
```

## Tech Stack

- **Framework**: Expo SDK 53 with React Native
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind for RN)
- **State Management**: Zustand with AsyncStorage persistence
- **Async State**: React Query
- **UI Components**: FlashList, expo-image, expo-av, lucide-react-native
- **Animations**: react-native-reanimated

## Sample Data

The app comes pre-loaded with sample professionals, clients, and posts to demonstrate functionality. Sample users can be used for testing:

- **Professionals**: mike.johnson@email.com, sarah.green@email.com, david.chen@email.com, amanda.martinez@email.com
- **Clients**: john.doe@email.com, emily.wilson@email.com, robert.taylor@email.com

(Any password works for demo purposes)

## Design

- Dark teal theme with turquoise accents (Workly brand)
- Mobile-optimized touch interactions
- Haptic feedback on actions
- Clean, professional aesthetic inspired by iOS HIG
- Video thumbnails with play icons
- Star rating display components

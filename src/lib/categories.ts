import { ServiceCategory } from './types';

// Expanded service categories organized by type
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // === HANDYMAN & GENERAL ===
  {
    id: 'handyman',
    name: 'Handyman',
    icon: 'Wrench',
    description: 'General repairs, fixes, and odd jobs',
  },
  {
    id: 'furniture-assembly',
    name: 'Furniture Assembly',
    icon: 'Armchair',
    description: 'Assemble and install furniture',
  },
  {
    id: 'mounting-installation',
    name: 'Mounting & Installation',
    icon: 'Tv',
    description: 'TV mounting, shelves, fixtures',
  },

  // === SKILLED TRADES ===
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'Droplets',
    description: 'Pipes, fixtures, and water systems',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    description: 'Wiring, outlets, and electrical work',
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: 'Wind',
    description: 'Heating, ventilation, air conditioning',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: 'Hammer',
    description: 'Woodwork, cabinets, trim, framing',
  },
  {
    id: 'welding',
    name: 'Welding',
    icon: 'Flame',
    description: 'Metal fabrication and welding',
  },
  {
    id: 'masonry',
    name: 'Masonry',
    icon: 'Blocks',
    description: 'Brick, stone, concrete work',
  },

  // === HOME EXTERIOR ===
  {
    id: 'roofing',
    name: 'Roofing',
    icon: 'Home',
    description: 'Roof repair and installation',
  },
  {
    id: 'siding',
    name: 'Siding',
    icon: 'LayoutGrid',
    description: 'Siding installation and repair',
  },
  {
    id: 'gutters',
    name: 'Gutters',
    icon: 'ArrowDown',
    description: 'Gutter installation and cleaning',
  },
  {
    id: 'windows-doors',
    name: 'Windows & Doors',
    icon: 'DoorOpen',
    description: 'Window and door installation',
  },
  {
    id: 'fencing',
    name: 'Fencing',
    icon: 'Fence',
    description: 'Fence installation and repair',
  },
  {
    id: 'deck-patio',
    name: 'Deck & Patio',
    icon: 'Layers',
    description: 'Deck building and patio work',
  },

  // === HOME INTERIOR ===
  {
    id: 'flooring',
    name: 'Flooring',
    icon: 'Grid2X2',
    description: 'Hardwood, tile, laminate, carpet',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting',
  },
  {
    id: 'drywall',
    name: 'Drywall',
    icon: 'Square',
    description: 'Drywall installation and repair',
  },
  {
    id: 'tiling',
    name: 'Tiling',
    icon: 'Grid3X3',
    description: 'Tile installation for floors and walls',
  },
  {
    id: 'kitchen-remodel',
    name: 'Kitchen Remodel',
    icon: 'Utensils',
    description: 'Kitchen renovation and upgrades',
  },
  {
    id: 'bathroom-remodel',
    name: 'Bathroom Remodel',
    icon: 'Bath',
    description: 'Bathroom renovation and upgrades',
  },
  {
    id: 'basement-finishing',
    name: 'Basement Finishing',
    icon: 'Building2',
    description: 'Basement renovation and finishing',
  },

  // === LANDSCAPING & OUTDOOR ===
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: 'Trees',
    description: 'Lawn care, gardening, outdoor design',
  },
  {
    id: 'lawn-care',
    name: 'Lawn Care',
    icon: 'Leaf',
    description: 'Mowing, edging, lawn maintenance',
  },
  {
    id: 'tree-service',
    name: 'Tree Service',
    icon: 'TreeDeciduous',
    description: 'Tree trimming, removal, stump grinding',
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    icon: 'Droplet',
    description: 'Sprinkler systems and irrigation',
  },
  {
    id: 'pool-service',
    name: 'Pool Service',
    icon: 'Waves',
    description: 'Pool cleaning and maintenance',
  },
  {
    id: 'pressure-washing',
    name: 'Pressure Washing',
    icon: 'Sparkles',
    description: 'Power washing driveways, decks, siding',
  },
  {
    id: 'snow-removal',
    name: 'Snow Removal',
    icon: 'Snowflake',
    description: 'Snow plowing and removal',
  },

  // === CLEANING SERVICES ===
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    icon: 'SprayCan',
    description: 'Residential cleaning services',
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning',
    icon: 'Sparkle',
    description: 'Move-in/out, spring cleaning',
  },
  {
    id: 'carpet-cleaning',
    name: 'Carpet Cleaning',
    icon: 'Brush',
    description: 'Professional carpet and upholstery',
  },
  {
    id: 'window-cleaning',
    name: 'Window Cleaning',
    icon: 'SunDim',
    description: 'Interior and exterior windows',
  },
  {
    id: 'junk-removal',
    name: 'Junk Removal',
    icon: 'Trash2',
    description: 'Hauling and disposal services',
  },

  // === MOVING & DELIVERY ===
  {
    id: 'moving',
    name: 'Moving',
    icon: 'Truck',
    description: 'Local and long-distance moving',
  },
  {
    id: 'packing',
    name: 'Packing Services',
    icon: 'Package',
    description: 'Professional packing and unpacking',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    icon: 'PackageCheck',
    description: 'Furniture and large item delivery',
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: 'Warehouse',
    description: 'Storage solutions and organization',
  },

  // === AUTOMOTIVE ===
  {
    id: 'auto-mechanic',
    name: 'Auto Mechanic',
    icon: 'Car',
    description: 'Car repair and maintenance',
  },
  {
    id: 'auto-detailing',
    name: 'Auto Detailing',
    icon: 'CarFront',
    description: 'Car washing and detailing',
  },
  {
    id: 'tire-service',
    name: 'Tire Service',
    icon: 'Circle',
    description: 'Tire installation and repair',
  },

  // === HOME SYSTEMS ===
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    icon: 'Refrigerator',
    description: 'Washer, dryer, refrigerator repair',
  },
  {
    id: 'garage-door',
    name: 'Garage Door',
    icon: 'GalleryHorizontal',
    description: 'Garage door repair and installation',
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    icon: 'Key',
    description: 'Lock installation and repair',
  },
  {
    id: 'security-systems',
    name: 'Security Systems',
    icon: 'Shield',
    description: 'Alarm and camera installation',
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    icon: 'Smartphone',
    description: 'Smart device setup and automation',
  },

  // === PEST & HOME SAFETY ===
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: 'Bug',
    description: 'Extermination and prevention',
  },
  {
    id: 'mold-remediation',
    name: 'Mold Remediation',
    icon: 'AlertTriangle',
    description: 'Mold removal and prevention',
  },
  {
    id: 'insulation',
    name: 'Insulation',
    icon: 'Thermometer',
    description: 'Home insulation installation',
  },

  // === PERSONAL SERVICES ===
  {
    id: 'babysitting',
    name: 'Babysitting',
    icon: 'Baby',
    description: 'Childcare and babysitting',
  },
  {
    id: 'senior-care',
    name: 'Senior Care',
    icon: 'HeartHandshake',
    description: 'Elderly assistance and companionship',
  },
  {
    id: 'dog-sitting',
    name: 'Pet Sitting',
    icon: 'Dog',
    description: 'Pet care and dog walking',
  },
  {
    id: 'pet-grooming',
    name: 'Pet Grooming',
    icon: 'Scissors',
    description: 'Professional pet grooming',
  },
  {
    id: 'house-sitting',
    name: 'House Sitting',
    icon: 'KeyRound',
    description: 'Home watching while away',
  },
  {
    id: 'personal-assistant',
    name: 'Personal Assistant',
    icon: 'ClipboardList',
    description: 'Errands and task assistance',
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: 'GraduationCap',
    description: 'Academic tutoring and lessons',
  },
  {
    id: 'personal-training',
    name: 'Personal Training',
    icon: 'Dumbbell',
    description: 'Fitness training and coaching',
  },

  // === EVENTS & SPECIALTY ===
  {
    id: 'photography',
    name: 'Photography',
    icon: 'Camera',
    description: 'Event and portrait photography',
  },
  {
    id: 'videography',
    name: 'Videography',
    icon: 'Video',
    description: 'Video production and editing',
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: 'ChefHat',
    description: 'Food preparation and catering',
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    icon: 'PartyPopper',
    description: 'Event coordination and planning',
  },
  {
    id: 'dj-services',
    name: 'DJ Services',
    icon: 'Music',
    description: 'Music and entertainment',
  },

  // === TECH SERVICES ===
  {
    id: 'computer-repair',
    name: 'Computer Repair',
    icon: 'Monitor',
    description: 'PC and laptop repair',
  },
  {
    id: 'it-support',
    name: 'IT Support',
    icon: 'HardDrive',
    description: 'Tech support and networking',
  },
  {
    id: 'web-design',
    name: 'Web Design',
    icon: 'Globe',
    description: 'Website design and development',
  },
];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? 'Unknown';
}

// Get categories grouped by type for UI organization
export const CATEGORY_GROUPS = [
  { title: 'Handyman & General', ids: ['handyman', 'furniture-assembly', 'mounting-installation'] },
  { title: 'Skilled Trades', ids: ['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'masonry'] },
  { title: 'Home Exterior', ids: ['roofing', 'siding', 'gutters', 'windows-doors', 'fencing', 'deck-patio'] },
  { title: 'Home Interior', ids: ['flooring', 'painting', 'drywall', 'tiling', 'kitchen-remodel', 'bathroom-remodel', 'basement-finishing'] },
  { title: 'Landscaping & Outdoor', ids: ['landscaping', 'lawn-care', 'tree-service', 'irrigation', 'pool-service', 'pressure-washing', 'snow-removal'] },
  { title: 'Cleaning Services', ids: ['house-cleaning', 'deep-cleaning', 'carpet-cleaning', 'window-cleaning', 'junk-removal'] },
  { title: 'Moving & Delivery', ids: ['moving', 'packing', 'delivery', 'storage'] },
  { title: 'Automotive', ids: ['auto-mechanic', 'auto-detailing', 'tire-service'] },
  { title: 'Home Systems', ids: ['appliance-repair', 'garage-door', 'locksmith', 'security-systems', 'smart-home'] },
  { title: 'Home Safety', ids: ['pest-control', 'mold-remediation', 'insulation'] },
  { title: 'Personal Services', ids: ['babysitting', 'senior-care', 'dog-sitting', 'pet-grooming', 'house-sitting', 'personal-assistant', 'tutoring', 'personal-training'] },
  { title: 'Events & Specialty', ids: ['photography', 'videography', 'catering', 'event-planning', 'dj-services'] },
  { title: 'Tech Services', ids: ['computer-repair', 'it-support', 'web-design'] },
];

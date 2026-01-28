import { ServiceCategory } from './types';

// Default service categories - extensible
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: 'Trees',
    description: 'Lawn care, gardening, and outdoor design',
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: 'Grid2X2',
    description: 'Hardwood, tile, carpet installation',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    icon: 'Home',
    description: 'Roof repair and installation',
  },
  {
    id: 'furniture-assembly',
    name: 'Furniture Assembly',
    icon: 'Armchair',
    description: 'Assemble and install furniture',
  },
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    icon: 'Sparkles',
    description: 'Residential cleaning services',
  },
  {
    id: 'babysitting',
    name: 'Babysitting',
    icon: 'Baby',
    description: 'Childcare and babysitting',
  },
  {
    id: 'dog-sitting',
    name: 'Dog Sitting',
    icon: 'Dog',
    description: 'Pet care and dog walking',
  },
  {
    id: 'house-sitting',
    name: 'House Sitting',
    icon: 'Key',
    description: 'Home watching while away',
  },
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
    id: 'painting',
    name: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting',
  },
  {
    id: 'moving',
    name: 'Moving',
    icon: 'Truck',
    description: 'Packing and moving services',
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: 'Wrench',
    description: 'General repairs and fixes',
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: 'Wind',
    description: 'Heating, ventilation, air conditioning',
  },
];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? 'Unknown';
}

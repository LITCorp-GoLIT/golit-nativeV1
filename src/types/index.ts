export interface Experience {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  location: string;
  price: number;
  image_url: string | null;
  primary_image_url: string | null;
  category: string | null;
  duration: string | null;
  schedule: string | null;
  host_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  status: string | null;
  rating: number | null;
  total_reviews: number | null;
  booking_type: 'free' | 'paid' | 'contact';
  event_date: string | null;
  start_time: string | null;
  created_at: string | null;
}

export interface Host {
  id: string;
  business_name: string | null;
  business_type: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  city: string | null;
  country: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  facebook: string | null;
  tiktok: string | null;
  total_experiences: number | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
}

export type RootStackParamList = {
  MainTabs: undefined;
  ExperienceDetail: { id: string };
  HostPublic: { id: string };
  Auth: { returnScreen?: keyof RootStackParamList } | undefined;
  CheckoutSummary: { experienceId: string };
};

export type TabParamList = {
  Discover: undefined;
  Social: undefined;
  Saved: undefined;
  Profile: undefined;
  Search: undefined;
};

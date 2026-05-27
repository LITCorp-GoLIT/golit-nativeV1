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

export interface Signal {
  id: string;
  title: string;
  category: string | null;
  signal_type: string | null;
  venue_name: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  popularity_score: number | null;
  business_id?: string | null;
}

export interface Booking {
  id: string;
  activity_id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'pending_payment';
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  special_requests: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  type: 'experience' | 'activity';
  title: string;
  image: string | null;
  price: number;
  location: string | null;
  quantity: number;
  bookingType: 'free' | 'paid' | 'contact';
  metadata?: {
    duration?: string;
    category?: string;
    date?: string;
    time?: string;
  };
}

export interface ChatConversation {
  id: string;
  user_id: string;
  host_id: string;
  experience_id: string | null;
  last_message_at: string | null;
  created_at: string | null;
  last_message?: string;
  unread_count?: number;
  host_name?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
  user_avatar?: string | null;
}

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  ExperienceDetail: { id: string };
  SignalDetail: { id: string };
  Checkout: { experienceId: string };
  OrderConfirmation: { bookingId: string; experienceTitle: string };
  MyBookings: undefined;
  PayPalWebView: { approvalUrl: string; bookingId: string };
  ChatList: undefined;
  ChatRoom: { conversationId: string; hostName: string };
  BecomeHost: undefined;
  HostDashboard: undefined;
  QRScan: { hostId: string };
  Settings: undefined;
};

export type TabParamList = {
  Discover: undefined;
  Social: undefined;
  Saved: undefined;
  Profile: undefined;
  Search: undefined;
};

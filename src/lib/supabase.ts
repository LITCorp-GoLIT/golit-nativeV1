import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://cokytsozudtrjqdobcor.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNva3l0c296dWR0cmpxZG9iY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTAzNzMsImV4cCI6MjA1Njg2NjM3M30.fMH60qX1TqXwmpmvhPb9pW_3e9K4tQVkxzTfOMU0N8Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

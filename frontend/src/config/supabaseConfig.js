import { createClient } from '@supabase/supabase-js';

// Replace with YOUR actual values from Step 2
const supabaseUrl = 'https://azkcdpratrgjijtmsujb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a2NkcHJhdHJnamlqdG1zdWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njc3MjAsImV4cCI6MjA3MDI0MzcyMH0.1kH21xU0hMqnK6pzDR-tLfVlghw-3GJf7hlb84USxbE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage configuration
export const STORAGE_CONFIG = {
  BUCKETS: {
    WARRANTY_IMAGES: 'warranty-images',
    PRODUCT_MANUALS: 'product-manuals'
  },
  
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

// Test connection
supabase
  .from('user_profiles')
  .select('count', { count: 'exact' })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connected! User profiles:', count);
    }
  });

export default supabase;
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for debugging
// This creates a non-functional client that won't attempt to connect to Supabase
const createMockClient = (): SupabaseClient => {
  console.log('[DEBUG] Using mock Supabase client');
  
  // Return a mock client with the same interface but non-functional methods
  return createClient('https://mock.supabase.co', 'mock-key', {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
    }
  });
};

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client - using mock client for debugging
export const supabase = createMockClient();

// Log that we're using the mock client
console.log('[DEBUG] Supabase connection disabled for debugging. Using mock data.');

// Import the Database type from our types file
import type { Database } from '../types/supabase';

// Export the Database type for convenience
export type { Database };

// Database schema types - use the types from supabase.ts
export type Tables = {
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    favorite_trails: string[] | null;
    completed_trails: string[] | null;
    planned_trails: string[] | null;
    created_at: string;
    updated_at: string;
  };
  
  trail_ratings: {
    id: string;
    user_id: string;
    trail_id: string;
    rating: number;
    comment: string | null;
    tips: string | null;
    photos: string[] | null;
    created_at: string;
  };
};

/**
 * Upload an image to Supabase storage (disabled for debugging)
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path Optional path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket: string, path?: string): Promise<string | null> {
  console.log('[DEBUG] Image upload attempted but Supabase is disabled for debugging');
  return 'mock-image-url';
}

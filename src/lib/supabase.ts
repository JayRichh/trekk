import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'trekk-auth',
  },
});

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
 * Upload an image to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path Optional path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket: string, path?: string): Promise<string | null> {
  try {
    // Create unique filename using timestamp and uuid
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Full path including any subfolder
    const fullPath = path ? `${path}/${fileName}` : fileName;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

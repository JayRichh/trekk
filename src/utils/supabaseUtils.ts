import type { Trail, Review, Region } from '../types/trail';
import { supabase } from '../lib/supabase';

// Check if a table exists in Supabase
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // When using mock client, always return false to force fallback to mock data
    console.log(`[DEBUG] Mock client: Pretending table ${tableName} doesn't exist`);
    return false;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

export async function getTrailsFromSupabase(
  options: {
    page: number;
    pageSize: number;
    filters?: {
      difficulty?: string;
      region?: string;
      length?: string;
      elevation?: string;
      searchQuery?: string;
    };
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }
): Promise<{ data: Trail[] | null; count: number | null; error: any }> {
  console.log('[DEBUG] Mock client: Using mock implementation of getTrailsFromSupabase');
  // Always return null data with a fake error to force fallback to mock data
  return { 
    data: null, 
    count: null, 
    error: new Error('Using mock Supabase client - forced fallback to mock data') 
  };
}

export async function getTrailByIdFromSupabase(id: string): Promise<{ data: Trail | null; error: any }> {
  console.log(`[DEBUG] Mock client: Using mock implementation of getTrailByIdFromSupabase for trail ${id}`);
  // Always return null data with an error to force fallback to mock data
  return { 
    data: null, 
    error: new Error('Using mock Supabase client - forced fallback to mock data') 
  };
}

export async function getRegionsFromSupabase(): Promise<{ data: Region[] | null; error: any }> {
  console.log('[DEBUG] Mock client: Using mock implementation of getRegionsFromSupabase');
  // Always return null data with an error to force fallback to mock data
  return { 
    data: null, 
    error: new Error('Using mock Supabase client - forced fallback to mock data') 
  };
}

export async function getTrailRatings(trailId: string): Promise<{ data: Review[] | null; error: any }> {
  console.log(`[DEBUG] Mock client: Using mock implementation of getTrailRatings for trail ${trailId}`);
  // Return empty reviews array - this is fine as it's not critical for the app
  return { data: [], error: null };
}

export async function attachRatingsToTrails(trails: Trail[], trailIds: string[]): Promise<void> {
  console.log('[DEBUG] Mock client: Using mock implementation of attachRatingsToTrails');
  // Simply ensure each trail has an empty reviews array
  trails.forEach(trail => {
    trail.reviews = trail.reviews || [];
  });
}

export async function submitRating(
  trailId: string, 
  rating: number, 
  comment?: string,
  tips?: string,
  photos?: string[]
): Promise<{ success: boolean; error: any }> {
  console.log('[DEBUG] Mock client: Using mock implementation of submitRating');
  console.log(`[DEBUG] Would have submitted rating: ${rating} for trail: ${trailId}`);
  if (comment) console.log(`[DEBUG] Comment: ${comment}`);
  if (tips) console.log(`[DEBUG] Tips: ${tips}`);
  if (photos && photos.length) console.log(`[DEBUG] Photos: ${photos.length} photo(s)`);
  
  // Return success to avoid UI errors
  return { success: true, error: null };
}

import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { apiService } from '../services/apiService';
import { v4 as uuidv4 } from 'uuid';

export interface Rating {
  id: string;
  user_id: string;
  trail_id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  trail?: {
    name: string;
    imageUrl?: string;
  };
}

export function useRatings() {
  const { user } = useAuth();
  const ratings = ref<Rating[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all ratings for the current user
  const fetchUserRatings = async () => {
    if (!user.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: err } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.value.id)
        .order('updated_at', { ascending: false });
        
      if (err) throw err;
      
      ratings.value = data || [];
      
      // Load trail info for each rating
      await loadTrailDetails();
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      error.value = err.message || 'Failed to fetch ratings';
    } finally {
      loading.value = false;
    }
  };
  
  // Load trail details for all ratings
  const loadTrailDetails = async () => {
    if (!ratings.value.length) return;
    
    try {
      // For each unique trail_id, fetch the trail details
      const uniqueTrailIds = [...new Set(ratings.value.map(r => r.trail_id))];
      
      // Batch process to avoid too many requests
      const batchSize = 10;
      for (let i = 0; i < uniqueTrailIds.length; i += batchSize) {
        const batchIds = uniqueTrailIds.slice(i, i + batchSize);
        const trailsData = await Promise.all(
          batchIds.map(async id => {
            try {
              return await apiService.getTrailById(id);
            } catch (error) {
              console.error(`Error fetching trail details for ${id}:`, error);
              return { id, name: `Trail ${id}`, imageUrl: null };
            }
          })
        );
        
        // Update ratings with trail info
        trailsData.forEach(trail => {
          ratings.value.forEach(rating => {
            if (rating.trail_id === trail.id) {
              rating.trail = {
                name: trail.name,
                imageUrl: trail.imageUrl
              };
            }
          });
        });
      }
    } catch (err: any) {
      console.error('Error loading trail details:', err);
    }
  };
  
  // Upload an image for a rating
  const uploadRatingImage = async (file: File) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `ratings/${user.value.id}/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('rating-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('rating-images')
        .getPublicUrl(filePath);
      
      return {
        success: true,
        url: publicUrl
      };
    } catch (err: any) {
      console.error('Error uploading image:', err);
      return {
        success: false,
        error: err.message || 'Failed to upload image'
      };
    }
  };
  
  // Create a new rating
  const createRating = async (ratingData: {
    trail_id: string;
    rating: number;
    comment?: string;
    tips?: string;
    image_url?: string;
  }) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const newRating = {
        user_id: user.value.id,
        trail_id: ratingData.trail_id,
        rating: ratingData.rating,
        comment: ratingData.comment || '',
        tips: ratingData.tips || '',
        image_url: ratingData.image_url || ''
      };
      
      const { data, error: err } = await supabase
        .from('ratings')
        .insert(newRating)
        .select()
        .single();
        
      if (err) throw err;
      
      // Add to local state
      if (data) {
        ratings.value = [data, ...ratings.value];
        await loadTrailDetails();
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating rating:', err);
      error.value = err.message || 'Failed to create rating';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Update an existing rating
  const updateRating = async (id: string, updates: { rating?: number; comment?: string; image_url?: string }) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: err } = await supabase
        .from('ratings')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.value.id) // Ensure user can only update their own ratings
        .select()
        .single();
        
      if (err) throw err;
      
      // Update local state
      if (data) {
        const index = ratings.value.findIndex(r => r.id === id);
        if (index !== -1) {
          ratings.value[index] = { ...ratings.value[index], ...data };
        }
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating rating:', err);
      error.value = err.message || 'Failed to update rating';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a rating
  const deleteRating = async (id: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const { error: err } = await supabase
        .from('ratings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id); // Ensure user can only delete their own ratings
        
      if (err) throw err;
      
      // Update local state
      ratings.value = ratings.value.filter(r => r.id !== id);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting rating:', err);
      error.value = err.message || 'Failed to delete rating';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Get ratings for a specific trail
  const fetchTrailRatings = async (trailId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: err } = await supabase
        .from('ratings')
        .select('*, profiles(display_name, avatar_url)')
        .eq('trail_id', trailId)
        .order('created_at', { ascending: false });
        
      if (err) throw err;
      
      return data || [];
    } catch (err: any) {
      console.error(`Error fetching ratings for trail ${trailId}:`, err);
      error.value = err.message || `Failed to fetch ratings for trail ${trailId}`;
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Helper to check if user has rated a trail
  const hasUserRatedTrail = async (trailId: string) => {
    if (!user.value) return false;
    
    try {
      const { data, error: err } = await supabase
        .from('ratings')
        .select('id')
        .eq('trail_id', trailId)
        .eq('user_id', user.value.id)
        .single();
        
      if (err && err.code !== 'PGRST116') throw err; // PGRST116 = Not found
      
      return !!data;
    } catch (err) {
      console.error(`Error checking if user rated trail ${trailId}:`, err);
      return false;
    }
  };

  return {
    ratings,
    loading,
    error,
    fetchUserRatings,
    createRating,
    updateRating,
    deleteRating,
    fetchTrailRatings,
    hasUserRatedTrail,
    uploadRatingImage
  };
}

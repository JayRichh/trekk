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
  tips?: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  trail?: {
    name: string;
    imageUrl?: string | null;
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
    console.log(`[DEBUG] fetchUserRatings: Using mock data for debugging`);
    
    try {
      // Return mock ratings data
      const mockRatingsData: Rating[] = [
        {
          id: 'mock-rating-1',
          user_id: user.value?.id || 'mock-user',
          trail_id: 'trail-1',
          rating: 4,
          comment: 'Beautiful trail with amazing views. Moderately challenging but well worth it.',
          tips: 'Bring plenty of water and start early to avoid crowds.',
          image_url: '/images/fallback/trail-default.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          trail: {
            name: 'Alpine Lake Loop',
            imageUrl: '/images/fallback/trail-default.jpg'
          }
        },
        {
          id: 'mock-rating-2',
          user_id: user.value?.id || 'mock-user',
          trail_id: 'trail-2',
          rating: 5,
          comment: 'One of the best hikes I\'ve ever done. The summit view is incredible!',
          tips: 'The last mile is steep - trekking poles recommended.',
          image_url: null,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          trail: {
            name: 'Mountain Summit Trail',
            imageUrl: '/images/fallback/trail-default.jpg'
          }
        }
      ];
      
      console.log(`[DEBUG] fetchUserRatings: Using ${mockRatingsData.length} mock rating items`);
      ratings.value = mockRatingsData;
      
      console.log(`[DEBUG] fetchUserRatings: Mock rating data ready`);
    } catch (err: any) {
      console.error('Error setting mock ratings:', err);
      error.value = err.message || 'Failed to set mock ratings';
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
  
  // Upload an image for a rating (mock version)
  const uploadRatingImage = async (file: File) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    try {
      console.log(`[DEBUG] Mock client: Would upload image: ${file.name} (${file.size} bytes)`);
      
      // Return a mock URL
      return {
        success: true,
        url: '/images/fallback/trail-default.jpg'
      };
    } catch (err: any) {
      console.error('Error with mock image upload:', err);
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
      console.log(`[DEBUG] Mock client: Would create rating ${ratingData.rating} stars for trail ${ratingData.trail_id}`);
      
      // Create a mock rating with generated ID
      const mockRating: Rating = {
        id: `mock-rating-${Date.now()}`,
        user_id: user.value.id,
        trail_id: ratingData.trail_id,
        rating: ratingData.rating,
        comment: ratingData.comment || null,
        tips: ratingData.tips || null,
        image_url: ratingData.image_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to local state
      ratings.value = [mockRating, ...ratings.value];
      
      // Get trail details
      try {
        const trail = await apiService.getTrailById(ratingData.trail_id);
        if (trail) {
          mockRating.trail = {
            name: trail.name,
            imageUrl: trail.imageUrl
          };
        }
      } catch (error) {
        console.error(`Error fetching trail details for ${ratingData.trail_id}:`, error);
      }
      
      return { success: true, data: mockRating };
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
      console.log(`[DEBUG] Mock client: Would update rating ${id} with:`, updates);
      
      // Update local state
      const index = ratings.value.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rating not found');
      }
      
      const currentRating = ratings.value[index];
      if (!currentRating) {
        throw new Error('Rating not found');
      }
      
      // Create updated rating object
      const updatedRating: Rating = {
        ...currentRating,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      ratings.value[index] = updatedRating;
      
      return { success: true, data: updatedRating };
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
      console.log(`[DEBUG] Mock client: Would delete rating ${id}`);
      
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
      console.log(`[DEBUG] Mock client: Would fetch ratings for trail ${trailId}`);
      
      // Define the type for trail ratings to ensure consistency
      type TrailRatingResponse = {
        id: string;
        user_id: string;
        trail_id: string;
        rating: number;
        comment: string | null;
        tips: string | null;
        image_url: string | null;
        created_at: string;
        profiles: { display_name: string; avatar_url: string | null };
      };
      
      // Create mock trail ratings data
      const mockTrailRatings: TrailRatingResponse[] = [
        {
          id: 'mock-trail-rating-1',
          user_id: 'other-user-1',
          trail_id: trailId,
          rating: 5,
          comment: 'Absolutely stunning trail! The views are breathtaking.',
          tips: 'Go early to avoid crowds.',
          image_url: '/images/fallback/trail-default.jpg',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: { display_name: 'Alex Hiker', avatar_url: null }
        },
        {
          id: 'mock-trail-rating-2',
          user_id: 'other-user-2',
          trail_id: trailId,
          rating: 4,
          comment: 'Great trail, well maintained. A bit crowded on weekends.',
          tips: null,
          image_url: null,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: { display_name: 'Trail Enthusiast', avatar_url: null }
        }
      ];
      
      // If user has rated this trail, include their rating
      const userRating = ratings.value.find(r => r.trail_id === trailId);
      if (userRating) {
        // Convert user rating to the correct response format
        mockTrailRatings.unshift({
          id: userRating.id,
          user_id: userRating.user_id,
          trail_id: userRating.trail_id,
          rating: userRating.rating,
          comment: userRating.comment || '',
          tips: userRating.tips || null,
          image_url: userRating.image_url,
          created_at: userRating.created_at,
          profiles: { display_name: 'You', avatar_url: null }
        });
      }
      
      return mockTrailRatings;
    } catch (err: any) {
      console.error(`Error creating mock ratings for trail ${trailId}:`, err);
      error.value = err.message || `Failed to create mock ratings for trail ${trailId}`;
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Helper to check if user has rated a trail
  const hasUserRatedTrail = async (trailId: string) => {
    if (!user.value) return false;
    
    // Make sure ratings are loaded
    if (ratings.value.length === 0) {
      console.log(`[DEBUG] No local ratings, loading mock ratings first`);
      await fetchUserRatings();
    }
    
    // Check if it's in the local ratings data
    const found = ratings.value.some(r => r.trail_id === trailId);
    console.log(`[DEBUG] Ratings check for trail ${trailId}: ${found ? 'Found' : 'Not found'}`);
    return found;
  };
  
  // Get user's rating for a specific trail
  const getUserRatingForTrail = async (trailId: string) => {
    if (!user.value) return null;
    
    try {
      console.log(`[DEBUG] Mock client: Would get user rating for trail ${trailId}`);
      
      // Make sure ratings are loaded
      if (ratings.value.length === 0) {
        await fetchUserRatings();
      }
      
      // Check local state for the rating
      return ratings.value.find(r => r.trail_id === trailId) || null;
    } catch (err) {
      console.error(`Error getting mock user rating for trail ${trailId}:`, err);
      return null;
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
    getUserRatingForTrail,
    uploadRatingImage
  };
}

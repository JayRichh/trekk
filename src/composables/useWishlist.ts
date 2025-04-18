import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { apiService } from '../services/apiService';

export interface WishlistItem {
  id: string;
  user_id: string;
  trail_id: string;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  trail?: {
    name: string;
    imageUrl?: string | null;
    difficulty?: string | null;
    length?: number | null;
  };
}

export function useWishlist() {
  const { user } = useAuth();
  const wishlistItems = ref<WishlistItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all wishlist items for the current user
  const fetchUserWishlist = async () => {
    if (!user.value) {
      console.log('[DEBUG] fetchUserWishlist: No user found, skipping fetch');
      return;
    }
    
    loading.value = true;
    error.value = null;
    console.log(`[DEBUG] fetchUserWishlist: Fetching wishlist for user ${user.value.id}`);
    
    try {
      const { data, error: err } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.value.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (err) throw err;
      
      console.log(`[DEBUG] fetchUserWishlist: Retrieved ${data?.length || 0} wishlist items`);
      wishlistItems.value = data || [];
      
      // Load trail info for each wishlist item
      await loadTrailDetails();
      console.log(`[DEBUG] fetchUserWishlist: Loaded trail details, wishlist ready`);
    } catch (err: any) {
      console.error('Error fetching wishlist:', err);
      error.value = err.message || 'Failed to fetch wishlist';
    } finally {
      loading.value = false;
    }
    
    return wishlistItems.value;
  };
  
  // Load trail details for all wishlist items
  const loadTrailDetails = async () => {
    if (!wishlistItems.value.length) return;
    
    try {
      // For each unique trail_id, fetch the trail details
      const uniqueTrailIds = [...new Set(wishlistItems.value.map(item => item.trail_id))];
      
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
              return { id, name: `Trail ${id}`, imageUrl: null, difficulty: 'unknown', length: 0 };
            }
          })
        );
        
        // Update wishlist items with trail info
        trailsData.forEach(trail => {
          wishlistItems.value.forEach(item => {
            if (item.trail_id === trail.id) {
              item.trail = {
                name: trail.name,
                imageUrl: trail.imageUrl,
                difficulty: trail.difficulty,
                length: trail.length
              };
            }
          });
        });
      }
    } catch (err: any) {
      console.error('Error loading trail details:', err);
    }
  };
  
  // Add a trail to wishlist
  const addToWishlist = async (trailId: string, notes?: string, priority?: number) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      // Check if already in wishlist
      const exists = await isInWishlist(trailId);
      if (exists) {
        return { success: false, error: 'Trail already in wishlist' };
      }
      
      const newItem = {
        user_id: user.value.id,
        trail_id: trailId,
        notes: notes || '',
        priority: priority !== undefined ? priority : 0
      };
      
      const { data, error: err } = await supabase
        .from('wishlists')
        .insert(newItem)
        .select()
        .single();
        
      if (err) throw err;
      
      // Add to local state
      if (data) {
        wishlistItems.value = [data, ...wishlistItems.value];
        
        // Load trail details for the new item
        try {
          const trail = await apiService.getTrailById(trailId);
          // Check if data and wishlistItems still exist (might have changed during async operation)
          if (data && wishlistItems.value) {
            const index = wishlistItems.value.findIndex(item => item.id === data.id);
            if (index !== -1 && wishlistItems.value[index]) {
              wishlistItems.value[index].trail = {
                name: trail.name || 'Unknown',
                imageUrl: trail.imageUrl || null,
                difficulty: trail.difficulty || null,
                length: trail.length || null
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching trail details for ${trailId}:`, error);
        }
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding to wishlist:', err);
      error.value = err.message || 'Failed to add to wishlist';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Update wishlist item
  const updateWishlistItem = async (id: string, updates: { notes?: string; priority?: number }) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: err } = await supabase
        .from('wishlists')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.value.id) // Ensure user can only update their own wishlist
        .select()
        .single();
        
      if (err) throw err;
      
      // Update local state
      if (data) {
        const index = wishlistItems.value.findIndex(item => item.id === id);
        if (index !== -1) {
          wishlistItems.value[index] = { ...wishlistItems.value[index], ...data };
        }
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating wishlist item:', err);
      error.value = err.message || 'Failed to update wishlist item';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Remove from wishlist
  const removeFromWishlist = async (id: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const { error: err } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id); // Ensure user can only delete their own wishlist items
        
      if (err) throw err;
      
      // Update local state
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== id);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error removing from wishlist:', err);
      error.value = err.message || 'Failed to remove from wishlist';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Check if a trail is in the user's wishlist
  const isInWishlist = async (trailId: string): Promise<boolean> => {
    if (!user.value) return false;
    
    console.log(`[DEBUG] isInWishlist: Checking trail ${trailId} for user ${user.value.id}`);
    
    // Always ensure we have the latest wishlist data
    if (wishlistItems.value.length === 0) {
      console.log(`[DEBUG] isInWishlist: Local wishlist empty, fetching from database first`);
      await fetchUserWishlist();
    }
    
    // Check local state first after ensuring it's loaded
    if (wishlistItems.value.length > 0) {
      const found = wishlistItems.value.some(item => item.trail_id === trailId);
      console.log(`[DEBUG] isInWishlist: Local state check result: ${found ? 'Found in local state' : 'Not in local state'}`);
      
      if (found) return true;
    }
    
    console.log(`[DEBUG] isInWishlist: Not found in local state, checking database directly`);
    
    // Double check with database for certainty
    try {
      const { data, error: err } = await supabase
        .from('wishlists')
        .select('id, trail_id, user_id')
        .eq('trail_id', trailId)
        .eq('user_id', user.value.id);
      
      if (err) {
        console.error(`[DEBUG] isInWishlist: Database query error:`, err);
        throw err;
      }
      
      // Log the exact parameters and results for debugging
      console.log(`[DEBUG] isInWishlist: Database query parameters - trail_id: "${trailId}", user_id: "${user.value.id}"`);
      console.log(`[DEBUG] isInWishlist: Database query result:`, data);
      
      // Check if any rows were returned
      const found = Array.isArray(data) && data.length > 0;
      console.log(`[DEBUG] isInWishlist: Database check result: ${found ? `Found with id ${data?.[0]?.id}` : 'Not found'}, rows: ${data?.length || 0}`);
      
      // If found in database but not in local state, refresh local state
      if (found && !wishlistItems.value.some(item => item.trail_id === trailId)) {
        console.log(`[DEBUG] isInWishlist: Data inconsistency detected, refreshing wishlist`);
        await fetchUserWishlist();
      }
      
      return found;
    } catch (err) {
      console.error(`Error checking if trail ${trailId} is in wishlist:`, err);
      return false;
    }
  };
  
  // Toggle wishlist status (add if not in wishlist, remove if it is)
  const toggleWishlist = async (trailId: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    const inWishlist = await isInWishlist(trailId);
    
    if (inWishlist) {
      // Find item id
      const item = wishlistItems.value.find(item => item.trail_id === trailId);
      if (item) {
        return removeFromWishlist(item.id);
      } else {
        // Fetch from DB if not in local state
        try {
          const { data, error: err } = await supabase
            .from('wishlists')
            .select('id')
            .eq('trail_id', trailId)
            .eq('user_id', user.value.id)
            .single();
            
          if (err) throw err;
          
          if (data) {
            return removeFromWishlist(data.id);
          }
        } catch (err: any) {
          console.error('Error toggling wishlist:', err);
          return { success: false, error: err.message || 'Failed to toggle wishlist' };
        }
      }
    } else {
      return addToWishlist(trailId);
    }
    
    return { success: false, error: 'Unknown error toggling wishlist' };
  };

  return {
    wishlistItems,
    loading,
    error,
    fetchUserWishlist,
    addToWishlist,
    updateWishlistItem,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };
}

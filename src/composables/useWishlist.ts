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
    console.log(`[DEBUG] fetchUserWishlist: Using mock data for debugging`);
    
    try {
      // Return mock wishlist data
      const mockWishlistData: WishlistItem[] = [
        {
          id: 'mock-wish-1',
          user_id: user.value?.id || 'mock-user',
          trail_id: 'trail-1',
          notes: 'Want to hike this in summer',
          priority: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          trail: {
            name: 'Alpine Lake Loop',
            imageUrl: '/images/fallback/trail-default.jpg',
            difficulty: 'moderate',
            length: 8.5
          }
        },
        {
          id: 'mock-wish-2',
          user_id: user.value?.id || 'mock-user',
          trail_id: 'trail-2',
          notes: 'Perfect for weekend trip',
          priority: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          trail: {
            name: 'Mountain Summit Trail',
            imageUrl: '/images/fallback/trail-default.jpg',
            difficulty: 'difficult',
            length: 12.3
          }
        }
      ];
      
      console.log(`[DEBUG] fetchUserWishlist: Using ${mockWishlistData.length} mock wishlist items`);
      wishlistItems.value = mockWishlistData;
      
      console.log(`[DEBUG] fetchUserWishlist: Mock wishlist data ready`);
    } catch (err: any) {
      console.error('Error setting mock wishlist:', err);
      error.value = err.message || 'Failed to set mock wishlist';
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
      
      console.log(`[DEBUG] Mock client: Would add trail ${trailId} to wishlist with priority ${priority}`);
      
      // Create a mock item
      const mockData: WishlistItem = {
        id: `mock-wish-${Date.now()}`,
        user_id: user.value.id,
        trail_id: trailId,
        notes: notes || '',
        priority: priority !== undefined ? priority : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to local state
      wishlistItems.value = [mockData, ...wishlistItems.value];
      
      // Load trail details for the new item
      try {
        const trail = await apiService.getTrailById(trailId);
        // Check if mockData and wishlistItems still exist (might have changed during async operation)
        if (mockData && wishlistItems.value) {
          const index = wishlistItems.value.findIndex(item => item.id === mockData.id);
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
      
      return { success: true, data: mockData };
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
      console.log(`[DEBUG] Mock client: Would update wishlist item ${id} with:`, updates);
      
      // Update local state
      const index = wishlistItems.value.findIndex(item => item.id === id);
      if (index !== -1) {
        // Create a properly typed updated item
        const currentItem = wishlistItems.value[index];
        
        // Ensure currentItem exists (should always be true since index !== -1)
        if (!currentItem) {
          throw new Error('Wishlist item not found');
        }
        
        const updatedItem: WishlistItem = { 
          id: currentItem.id,
          user_id: currentItem.user_id,
          trail_id: currentItem.trail_id,
          notes: updates.notes !== undefined ? updates.notes : currentItem.notes,
          priority: updates.priority !== undefined ? updates.priority : currentItem.priority,
          created_at: currentItem.created_at,
          updated_at: new Date().toISOString(),
          trail: currentItem.trail
        };
        wishlistItems.value[index] = updatedItem;
        
        return { success: true, data: updatedItem };
      } else {
        throw new Error('Item not found in wishlist');
      }
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
      console.log(`[DEBUG] Mock client: Would remove wishlist item ${id}`);
      
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
      console.log(`[DEBUG] isInWishlist: Local wishlist empty, fetching mock data first`);
      await fetchUserWishlist();
    }
    
    // Check local state first after ensuring it's loaded
    if (wishlistItems.value.length > 0) {
      const found = wishlistItems.value.some(item => item.trail_id === trailId);
      console.log(`[DEBUG] isInWishlist: Local state check result: ${found ? 'Found in local state' : 'Not in local state'}`);
      return found;
    }
    
    return false;
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
        console.error(`[DEBUG] Inconsistent state: Trail ${trailId} is marked as in wishlist but item not found`);
        return { success: false, error: 'Inconsistent wishlist state' };
      }
    } else {
      return addToWishlist(trailId);
    }
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

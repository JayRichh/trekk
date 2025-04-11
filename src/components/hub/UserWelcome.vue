<template>
  <DashboardCard title="Welcome" content-type="UserWelcome" section-id="welcome" :loading="loading">
    <div class="flex items-center gap-6">
      <!-- User avatar -->
      <div class="user-avatar">
        <div v-if="userProfile?.avatarUrl" class="w-20 h-20 rounded-full overflow-hidden">
          <img 
            :src="userProfile.avatarUrl" 
            :alt="userProfile?.displayName || 'User'" 
            class="w-full h-full object-cover"
          >
        </div>
        <div v-else class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
          <span class="text-2xl font-bold text-primary-600">
            {{ getInitials() }}
          </span>
        </div>
      </div>
      
      <!-- Welcome message -->
      <div class="welcome-message flex-grow">
        <h1 class="text-2xl font-bold text-primary-800">
          Welcome, {{ userProfile?.displayName || 'Hiker' }}!
        </h1>
        <p class="text-gray-600 mt-1">
          Track your hikings, save favorites, and explore new trails
        </p>
      </div>
      
      <!-- Stats overview -->
      <div class="stats-overview flex gap-4">
        <div class="stat-item flex flex-col items-center">
          <div class="text-2xl font-bold text-primary-700">{{ completedTrailsCount }}</div>
          <div class="text-xs text-gray-500">Completed</div>
        </div>
        
        <div class="stat-item flex flex-col items-center">
          <div class="text-2xl font-bold text-primary-700">{{ wishlistCount }}</div>
          <div class="text-xs text-gray-500">Wishlist</div>
        </div>
        
        <div class="stat-item flex flex-col items-center">
          <div class="text-2xl font-bold text-primary-700">{{ ratingsCount }}</div>
          <div class="text-xs text-gray-500">Ratings</div>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useRatings } from '../../composables/useRatings';
import { useWishlist } from '../../composables/useWishlist';
import { supabase } from '../../lib/supabase';
import DashboardCard from './DashboardCard.vue';
import LoadingSpinner from '../shared/LoadingSpinner.vue';

// Import interfaces and types
type UserProfile = {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  // Add other properties as needed
};

const { userProfile } = useAuth();
const { ratings } = useRatings();
const { wishlistItems } = useWishlist();

const loading = ref(true);
const completedTrailsCount = ref(0);
const wishlistCount = computed(() => wishlistItems.value.length);
const ratingsCount = computed(() => ratings.value.length);

onMounted(async () => {
  try {
    // Get profile data from DB to check for completed trails
    if (userProfile.value?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('completed_trails')
        .eq('id', userProfile.value.id)
        .single();
      
      // Safely access data with type checking
      if (data && 'completed_trails' in data) {
        const completedTrailsData = data.completed_trails;
        
        // Safely handle the completed trails data
        if (completedTrailsData !== null && completedTrailsData !== undefined) {
          const trailsArray = Array.isArray(completedTrailsData) 
            ? completedTrailsData 
            : [];
          completedTrailsCount.value = trailsArray.length;
        }
      }
    }
  } catch (error) {
    console.error('Error loading welcome data:', error);
  } finally {
    loading.value = false;
  }
});

// Helper to get initials from display name - simplify to avoid TypeScript errors
function getInitials(): string {
  // Simple fallback if no user profile or display name
  if (!userProfile.value?.displayName) {
    return '?';
  }
  
  // Use a simpler approach to get initials that avoids TypeScript issues
  try {
    const name = userProfile.value.displayName.trim();
    if (!name) return '?';
    
    // Get first character
    const firstChar = name.charAt(0);
    
    // Try to get last initial (if there's a space)
    const lastSpaceIndex = name.lastIndexOf(' ');
    if (lastSpaceIndex >= 0 && lastSpaceIndex < name.length - 1) {
      const lastChar = name.charAt(lastSpaceIndex + 1);
      return (firstChar + lastChar).toUpperCase();
    }
    
    // If no space found, just return the first character
    return firstChar.toUpperCase();
  } catch (e) {
    console.error('Error getting initials:', e);
    return '?';
  }
}
</script>

<template>
  <DashboardCard title="My Ratings" content-type="ratings" section-id="ratings" :loading="loading" :error="error">
    <div v-if="ratings.length === 0" class="flex flex-col items-center justify-center h-full text-center py-6">
      <div class="text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <p class="text-gray-500 mb-4">You haven't rated any trails yet</p>
      <router-link to="/trails" class="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
        Browse Trails
      </router-link>
    </div>
    <div v-else class="space-y-4">
      <div 
        v-for="rating in ratings" 
        :key="rating.id" 
        class="rating-preview relative bg-card rounded-md shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
        :class="{ 'z-20 scale-105 shadow-lg': expandedRating === rating.id }"
        @mouseenter="expandedRating = rating.id" 
        @mouseleave="expandedRating = null"
      >
        <!-- Compact view -->
        <div v-if="expandedRating !== rating.id" class="p-4 flex items-start gap-3">
          <div class="rating-stars text-yellow-400 flex-shrink-0">
            <span v-for="i in 5" :key="i" :class="i <= rating.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
          </div>
          <div class="flex-grow truncate">
            <h4 class="font-medium truncate">{{ rating.trail?.name || `Trail ${rating.trail_id}` }}</h4>
            <p class="text-sm text-gray-500 truncate">{{ rating.comment || 'No comment' }}</p>
          </div>
          <div class="text-xs text-gray-400 flex-shrink-0">
            {{ formatDate(rating.created_at) }}
          </div>
        </div>
        
        <!-- Expanded view -->
        <div v-else class="absolute top-0 left-0 w-[200%] bg-card rounded-md shadow-xl p-4 z-10 border border-gray-200">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-bold text-lg">{{ rating.trail?.name || `Trail ${rating.trail_id}` }}</h4>
            <div class="rating-stars text-yellow-400">
              <span v-for="i in 5" :key="i" :class="i <= rating.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
            </div>
          </div>
          
          <p class="text-gray-700 mb-3">{{ rating.comment || 'No comment provided' }}</p>
          
          <div v-if="rating.image_url" class="mb-3">
            <img :src="rating.image_url" alt="Rating image" class="rounded-md w-full h-32 object-cover" />
          </div>
          
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>{{ formatDate(rating.created_at) }}</span>
            <div class="space-x-2">
              <button 
                @click.stop="editRating(rating)"
                class="text-primary-600 hover:text-primary-800"
              >
                Edit
              </button>
              <button 
                @click.stop="confirmDelete(rating)"
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="hasMoreRatings" class="text-center mt-4">
        <button 
          @click="loadMoreRatings"
          class="text-primary-600 hover:text-primary-800 text-sm font-medium focus:outline-none"
        >
          Load more ratings
        </button>
      </div>
    </div>
    
    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-bold mb-3">Delete Rating</h3>
        <p class="mb-4">Are you sure you want to delete this rating? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteSelectedRating"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRatings, type Rating } from '../../composables/useRatings';
import { useAuth } from '../../composables/useAuth';
import DashboardCard from './DashboardCard.vue';
import { useRouter } from 'vue-router';

const { ratings, loading, error, fetchUserRatings, deleteRating } = useRatings();
const { isLoggedIn } = useAuth();
const router = useRouter();

const expandedRating = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const ratingToDelete = ref<Rating | null>(null);
const displayLimit = ref(5);
const hasMoreRatings = ref(false);

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUserRatings();
    checkHasMoreRatings();
  }
});

// Watch for changes in auth state
watch(() => isLoggedIn.value, async (newValue) => {
  if (newValue) {
    await fetchUserRatings();
    checkHasMoreRatings();
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function loadMoreRatings() {
  displayLimit.value += 5;
  checkHasMoreRatings();
}

function checkHasMoreRatings() {
  hasMoreRatings.value = ratings.value.length > displayLimit.value;
}

function editRating(rating: Rating) {
  // Navigate to trail detail with open edit rating modal
  router.push(`/trails/${rating.trail_id}?editRating=${rating.id}`);
}

function confirmDelete(rating: Rating) {
  ratingToDelete.value = rating;
  showDeleteConfirm.value = true;
}

async function deleteSelectedRating() {
  if (!ratingToDelete.value) return;
  
  const result = await deleteRating(ratingToDelete.value.id);
  
  if (result.success) {
    showDeleteConfirm.value = false;
    ratingToDelete.value = null;
  } else {
    // Handle error
    console.error('Failed to delete rating:', result.error);
  }
}
</script>

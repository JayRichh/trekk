<template>
  <DashboardCard title="Wishlist" content-type="wishlist" section-id="wishlist" :loading="loading" :error="error">
    <div v-if="wishlistItems.length === 0" class="flex flex-col items-center justify-center h-full text-center py-6">
      <div class="text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <p class="text-gray-500 mb-4">Your wishlist is empty</p>
      <router-link to="/trails" class="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
        Browse Trails
      </router-link>
    </div>
    <div v-else class="space-y-4">
      <div 
        v-for="item in wishlistItems" 
        :key="item.id" 
        class="wishlist-item group relative bg-card rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div class="p-4 flex gap-3">
          <!-- Trail Image -->
          <div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
            <img :src="getTrailImageUrl(item.trail_id, 120, 120)" :alt="item.trail?.name || 'Trail Image'" class="h-full w-full object-cover" />
          </div>
          
          <!-- Trail details -->
          <div class="flex-grow min-w-0">
            <div class="flex items-start justify-between">
              <h4 class="font-medium truncate">{{ item.trail?.name || `Trail ${item.trail_id}` }}</h4>
              <div 
                class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                v-if="item.priority > 2"
              >
                High Priority
              </div>
            </div>
            
            <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span v-if="item.trail?.difficulty" class="inline-flex items-center">
                <span 
                  class="w-2 h-2 rounded-full mr-1"
                  :class="{
                    'bg-green-500': item.trail.difficulty === 'easy',
                    'bg-yellow-500': item.trail.difficulty === 'moderate',
                    'bg-orange-500': item.trail.difficulty === 'difficult',
                    'bg-red-500': item.trail.difficulty === 'extreme'
                  }"
                ></span>
                {{ item.trail.difficulty }}
              </span>
              <span v-if="item.trail?.length">{{ item.trail.length }} km</span>
            </div>
            
            <!-- Notes -->
            <p v-if="item.notes" class="text-sm text-gray-600 mt-1 truncate">{{ item.notes }}</p>
          </div>
        </div>
        
        <!-- Action buttons - appear on hover -->
        <div class="absolute inset-y-0 right-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white/80 to-transparent pr-3 pl-10">
          <button 
            @click.stop="viewTrail(item.trail_id)"
            class="text-primary-700 hover:text-primary-900 p-1"
            title="View trail details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            @click.stop="updatePriority(item)"
            class="text-blue-700 hover:text-blue-900 p-1"
            title="Change priority"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>
          <button 
            @click.stop="confirmRemove(item)"
            class="text-red-700 hover:text-red-900 p-1"
            title="Remove from wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Priority Edit Modal -->
    <div v-if="showPriorityModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
        <h3 class="text-lg font-bold mb-4">Update Priority</h3>
        
        <div class="mb-6">
          <label for="priority-slider" class="block text-sm font-medium text-gray-700 mb-2">
            Priority Level: {{ selectedPriority }}
          </label>
          <input 
            id="priority-slider" 
            type="range" 
            min="0" 
            max="5" 
            v-model="selectedPriority" 
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            id="notes" 
            v-model="selectedNotes" 
            rows="2" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md" 
            placeholder="Add any notes about this trail"
          ></textarea>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            @click="showPriorityModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="savePriorityChanges" 
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    
    <!-- Remove Confirmation Modal -->
    <div v-if="showRemoveConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-bold mb-3">Remove from Wishlist</h3>
        <p class="mb-4">Are you sure you want to remove this trail from your wishlist?</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showRemoveConfirm = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="removeFromWishlist"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useWishlist, type WishlistItem } from '../../composables/useWishlist';
import { useAuth } from '../../composables/useAuth';
import DashboardCard from './DashboardCard.vue';
import { useRouter } from 'vue-router';
import { getTrailImageUrl } from '../../utils/imageUtils';

const { wishlistItems, loading, error, fetchUserWishlist, updateWishlistItem, removeFromWishlist: removeItem } = useWishlist();
const { isLoggedIn } = useAuth();
const router = useRouter();

const showPriorityModal = ref(false);
const showRemoveConfirm = ref(false);
const selectedItem = ref<WishlistItem | null>(null);
const selectedPriority = ref(0);
const selectedNotes = ref('');

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUserWishlist();
  }
});

// Watch for changes in auth state
watch(() => isLoggedIn.value, async (newValue) => {
  if (newValue) {
    await fetchUserWishlist();
  }
});

function viewTrail(trailId: string) {
  router.push(`/trails/${trailId}`);
}

function updatePriority(item: WishlistItem) {
  selectedItem.value = item;
  selectedPriority.value = item.priority;
  selectedNotes.value = item.notes || '';
  showPriorityModal.value = true;
}

function confirmRemove(item: WishlistItem) {
  selectedItem.value = item;
  showRemoveConfirm.value = true;
}

async function savePriorityChanges() {
  if (!selectedItem.value) return;
  
  const result = await updateWishlistItem(selectedItem.value.id, {
    priority: selectedPriority.value,
    notes: selectedNotes.value
  });
  
  if (result.success) {
    showPriorityModal.value = false;
    selectedItem.value = null;
  } else {
    console.error('Failed to update wishlist item:', result.error);
  }
}

async function removeFromWishlist() {
  if (!selectedItem.value) return;
  
  const result = await removeItem(selectedItem.value.id);
  
  if (result.success) {
    showRemoveConfirm.value = false;
    selectedItem.value = null;
  } else {
    console.error('Failed to remove from wishlist:', result.error);
  }
}
</script>

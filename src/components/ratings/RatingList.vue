<template>
  <div class="ratings-container">
    <div v-if="loading" class="flex justify-center py-8">
      <LoadingSpinner :loading="true" />
    </div>
    
    <div v-else-if="!ratings || ratings.length === 0" class="text-center py-6 text-gray-500">
      <div class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <p class="mb-4">No reviews yet for this trail.</p>
      <RatingButton 
        v-if="isLoggedIn"
        :trail-id="trailId"
        buttonText="Be the first to review"
        button-class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
      />
      <router-link 
        v-else 
        to="/login" 
        class="text-primary-600 hover:text-primary-800"
      >
        Login to add a review
      </router-link>
    </div>
    
    <div v-else>
      <!-- Filters (optional) -->
      <div v-if="showFilters" class="mb-4 flex gap-3 items-center justify-between">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Sort by:</label>
          <select
            v-model="sortOption"
            class="px-2 py-1 border border-gray-300 rounded-md text-sm"
            @change="applyFilters"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="rating-desc">Highest rated</option>
            <option value="rating-asc">Lowest rated</option>
          </select>
        </div>
        
        <RatingButton 
          v-if="isLoggedIn"
          :trail-id="trailId"
          buttonText="Add Review"
          button-class="bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors text-sm"
          @rating-saved="onRatingSaved"
        />
      </div>
      
      <!-- Ratings List -->
      <div class="space-y-4">
        <RatingPreview
          v-for="rating in displayedRatings"
          :key="rating.id"
          :rating="rating"
          @edit="editRating"
          @delete="confirmDeleteRating"
        />
        
        <!-- Pagination -->
        <div v-if="showPagination && totalPages > 1" class="flex justify-center mt-6">
          <div class="flex gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              class="w-8 h-8 flex items-center justify-center rounded-md"
              :class="currentPage === page ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              {{ page }}
            </button>
          </div>
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMoreToLoad" class="flex justify-center mt-4">
          <button 
            @click="loadMore"
            class="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Load more reviews
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-bold mb-3">Delete Review</h3>
        <p class="mb-4">Are you sure you want to delete your review? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteRating"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRatings } from '../../composables/useRatings';
import { useAuth } from '../../composables/useAuth';
import RatingPreview from './RatingPreview.vue';
import RatingButton from './RatingButton.vue';
import LoadingSpinner from '../shared/LoadingSpinner.vue';

const props = defineProps<{
  trailId: string;
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
}>();

const emit = defineEmits(['ratings-updated']);

const { fetchTrailRatings, deleteRating: deleteRatingApi } = useRatings();
const { isLoggedIn } = useAuth();

const ratings = ref<any[]>([]);
const loading = ref(true);
const sortOption = ref('date-desc');
const currentPage = ref(1);
const displayLimit = ref(props.itemsPerPage || 5);
const hasMoreToLoad = ref(false);

// Delete confirmation
const showDeleteConfirm = ref(false);
const ratingToDelete = ref<string | null>(null);

// Computed properties
const totalPages = computed(() => {
  if (!ratings.value.length) return 0;
  return Math.ceil(ratings.value.length / displayLimit.value);
});

const displayedRatings = computed(() => {
  if (props.showPagination) {
    const start = (currentPage.value - 1) * displayLimit.value;
    const end = start + displayLimit.value;
    return ratings.value.slice(start, end);
  } else {
    return ratings.value.slice(0, displayLimit.value);
  }
});

// Watch for page changes
watch(currentPage, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1;
  }
});

// Load initial data
onMounted(async () => {
  loading.value = true;
  try {
    await loadRatings();
  } catch (error) {
    console.error('Error loading ratings:', error);
  } finally {
    loading.value = false;
  }
});

// Methods
async function loadRatings() {
  const data = await fetchTrailRatings(props.trailId);
  // Sort data according to the current sort option
  ratings.value = sortRatings(data);
  checkHasMoreToLoad();
}

function sortRatings(data: any[]) {
  const sortedData = [...data];
  switch (sortOption.value) {
    case 'date-desc':
      return sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'date-asc':
      return sortedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'rating-desc':
      return sortedData.sort((a, b) => b.rating - a.rating);
    case 'rating-asc':
      return sortedData.sort((a, b) => a.rating - b.rating);
    default:
      return sortedData;
  }
}

function applyFilters() {
  ratings.value = sortRatings(ratings.value);
  currentPage.value = 1; // Reset to first page when filters change
}

function loadMore() {
  displayLimit.value += props.itemsPerPage || 5;
  checkHasMoreToLoad();
}

function checkHasMoreToLoad() {
  hasMoreToLoad.value = ratings.value.length > displayLimit.value;
}

function onRatingSaved() {
  // Refresh the ratings list
  loadRatings();
  emit('ratings-updated');
}

function editRating(rating: any) {
  // Handle editing a rating - you can either open the rating dialog here
  // or let the parent component handle it
  emit('ratings-updated');
}

function confirmDeleteRating(rating: any) {
  ratingToDelete.value = rating.id;
  showDeleteConfirm.value = true;
}

async function deleteRating() {
  if (!ratingToDelete.value) return;
  
  try {
    const result = await deleteRatingApi(ratingToDelete.value);
    if (result.success) {
      await loadRatings();
      emit('ratings-updated');
    }
  } catch (error) {
    console.error('Error deleting rating:', error);
  } finally {
    showDeleteConfirm.value = false;
    ratingToDelete.value = null;
  }
}
</script>

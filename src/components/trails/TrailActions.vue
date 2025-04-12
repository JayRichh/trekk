Focus <template>
  <div 
    class="trail-actions flex items-center gap-2" 
    :class="[
      `size-${size}`,
      { 'icon-only': iconOnly, 'with-text': !iconOnly }
    ]"
  >
    <!-- Wishlist toggle -->
    <button 
      v-if="showWishlist && isLoggedIn"
      @click.stop="handleWishlistToggle"
      :class="[
        'transition-all duration-200 relative',
        inWishlist 
          ? 'text-rose-500 hover:text-rose-600' 
          : 'text-gray-400 hover:text-rose-500',
        `btn-${buttonStyle}`,
        { 'opacity-75 pointer-events-none': wishlistLoading }
      ]"
      :title="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
      :disabled="wishlistLoading"
    >
      <div v-if="wishlistLoading" class="absolute inset-0 flex items-center justify-center bg-surface/50 rounded">
        <div class="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="iconSize" :height="iconSize" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'fill-current': inWishlist }">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span v-if="!iconOnly">{{ inWishlist ? 'Saved' : 'Save' }}</span>
      </div>
    </button>
    
    <!-- Rating button -->
    <button 
      v-if="showRating && isLoggedIn"
      @click.stop="showRatingDialog = true"
      :class="[
        'transition-all duration-200 relative',
        hasRated 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-gray-400 hover:text-yellow-500',
        `btn-${buttonStyle}`,
        { 'opacity-75 pointer-events-none': ratingLoading }
      ]"
      :title="hasRated ? 'Edit your rating' : 'Rate this trail'"
      :disabled="ratingLoading"
    >
      <div v-if="ratingLoading" class="absolute inset-0 flex items-center justify-center bg-surface/50 rounded">
        <div class="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="iconSize" :height="iconSize" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'fill-current': hasRated }">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span v-if="!iconOnly">{{ hasRated ? 'Your Rating' : 'Rate' }}</span>
      </div>
    </button>
    
    <!-- Goal toggle -->
    <button 
      v-if="showGoal && isLoggedIn"
      @click.stop="handleGoalToggle"
      :class="[
        'transition-all duration-200 relative',
        isGoal 
          ? 'text-emerald-500 hover:text-emerald-600' 
          : 'text-gray-400 hover:text-emerald-500',
        `btn-${buttonStyle}`,
        { 'opacity-75 pointer-events-none': goalLoading }
      ]"
      :title="isGoal ? 'Remove from goals' : 'Add to goals'"
      :disabled="goalLoading"
    >
      <div v-if="goalLoading" class="absolute inset-0 flex items-center justify-center bg-surface/50 rounded">
        <div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="iconSize" :height="iconSize" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'fill-current': isGoal }">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" x2="4" y1="22" y2="15" />
        </svg>
        <span v-if="!iconOnly">{{ isGoal ? 'Goal Set' : 'Set Goal' }}</span>
      </div>
    </button>
    
    <!-- Rating dialog -->
    <RatingDialog
      v-if="showRatingDialog"
      :show="showRatingDialog"
      :trail-id="trailId"
      :rating-id="userRatingId"
      :initial-rating="userRating"
      @close="showRatingDialog = false"
      @saved="handleRatingSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import RatingDialog from '../ratings/RatingDialog.vue';
import { useWishlist } from '../../composables/useWishlist';
import { useRatings } from '../../composables/useRatings';
import { useGoals } from '../../composables/useGoals';
import { useAuth } from '../../composables/useAuth';

const props = defineProps({
  trailId: {
    type: String,
    required: true
  },
  showWishlist: {
    type: Boolean,
    default: true
  },
  showRating: {
    type: Boolean,
    default: true
  },
  showGoal: {
    type: Boolean,
    default: true
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  buttonStyle: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'outline', 'ghost'].includes(value)
  }
});

const emit = defineEmits([
  'wishlist-updated', 
  'rating-saved', 
  'goal-updated'
]);

// Authentication
const { isLoggedIn } = useAuth();

// Wishlist functionality
const { isInWishlist, toggleWishlist } = useWishlist();
const inWishlist = ref(false);
const wishlistLoading = ref(false);

// Goals functionality
const { hasTrailGoal, toggleTrailGoal } = useGoals();
const isGoal = ref(false);
const goalLoading = ref(false);

// Ratings functionality
const { hasUserRatedTrail, getUserRatingForTrail } = useRatings();
const hasRated = ref(false);
const showRatingDialog = ref(false);
const ratingLoading = ref(false);
const userRatingId = ref<string | undefined>(undefined);
const userRating = ref<{
  rating: number;
  comment?: string;
  tips?: string;
  image_url?: string;
} | undefined>(undefined);

// Determine icon size based on component size
const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return 16;
    case 'lg': return 24;
    default: return 20;
  }
});

// Check wishlist status
async function checkWishlistStatus() {
  if (!isLoggedIn.value || !props.trailId) return;
  
  try {
    console.log(`[DEBUG] TrailActions: Checking wishlist status for trail ${props.trailId}`);
    inWishlist.value = await isInWishlist(props.trailId);
    console.log(`[DEBUG] TrailActions: Wishlist status result: ${inWishlist.value}`);
  } catch (error) {
    console.error('Error checking wishlist status:', error);
  }
}

// Check goal status
async function checkGoalStatus() {
  if (!isLoggedIn.value || !props.trailId) return;
  
  try {
    isGoal.value = await hasTrailGoal(props.trailId);
  } catch (error) {
    console.error('Error checking goal status:', error);
  }
}

// Check rating status
async function checkRatingStatus() {
  if (!isLoggedIn.value || !props.trailId) return;
  
  try {
    hasRated.value = await hasUserRatedTrail(props.trailId);
    
    if (hasRated.value) {
      // Use the new method to fetch user's rating directly
      const userRatingData = await getUserRatingForTrail(props.trailId);
      
      if (userRatingData) {
        userRatingId.value = userRatingData.id;
        userRating.value = {
          rating: userRatingData.rating,
          comment: userRatingData.comment || undefined,
          tips: userRatingData.tips || undefined,
          image_url: userRatingData.image_url || undefined
        };
      }
    }
  } catch (error) {
    console.error('Error checking rating status:', error);
  }
}

// Toggle wishlist
async function handleWishlistToggle(event: Event) {
  event.stopPropagation();
  
  if (!isLoggedIn.value || wishlistLoading.value) return;
  
  wishlistLoading.value = true;
  
  try {
    const result = await toggleWishlist(props.trailId);
    
    if (result.success) {
      inWishlist.value = !inWishlist.value;
      emit('wishlist-updated', inWishlist.value);
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
  } finally {
    wishlistLoading.value = false;
  }
}

// Toggle goal
async function handleGoalToggle(event: Event) {
  event.stopPropagation();
  
  if (!isLoggedIn.value || goalLoading.value) return;
  
  goalLoading.value = true;
  
  try {
    const result = await toggleTrailGoal(props.trailId);
    
    if (result.success) {
      isGoal.value = !isGoal.value;
      emit('goal-updated', isGoal.value);
    }
  } catch (error) {
    console.error('Error toggling goal:', error);
  } finally {
    goalLoading.value = false;
  }
}

// Handle when a rating is saved
function handleRatingSaved(rating: any) {
  ratingLoading.value = true;
  
  try {
    hasRated.value = true;
    userRatingId.value = rating.id;
    userRating.value = {
      rating: rating.rating,
      comment: rating.comment || undefined,
      tips: rating.tips || undefined,
      image_url: rating.image_url || undefined
    };
    
    emit('rating-saved', rating);
  } finally {
    showRatingDialog.value = false;
    ratingLoading.value = false;
  }
}

// Check statuses on mount and when trail ID changes
onMounted(async () => {
  console.log(`[DEBUG] TrailActions mounted for trail ${props.trailId}`);
  
  // Reset states first
  inWishlist.value = false;
  isGoal.value = false;
  hasRated.value = false;
  
  // Use a small delay to ensure data loading has completed
  setTimeout(async () => {
    try {
      // Initialize all statuses concurrently
      await Promise.all([
        checkWishlistStatus(),
        checkGoalStatus(),
        checkRatingStatus()
      ]);
      
      console.log(`[DEBUG] TrailActions initialization complete:`, {
        wishlist: inWishlist.value,
        goal: isGoal.value,
        rated: hasRated.value
      });
    } catch (error) {
      console.error('[DEBUG] Error during TrailActions initialization:', error);
    }
  }, 100);
});

watch(() => props.trailId, async (newTrailId) => {
  console.log(`[DEBUG] Trail ID changed to ${newTrailId}`);
  
  // Reset states first to avoid flashing wrong state
  inWishlist.value = false;
  isGoal.value = false;
  hasRated.value = false;
  
  try {
    // Check all statuses concurrently
    await Promise.all([
      checkWishlistStatus(),
      checkGoalStatus(),
      checkRatingStatus()
    ]);
    
    console.log(`[DEBUG] Updated states for new trail:`, {
      wishlist: inWishlist.value,
      goal: isGoal.value,
      rated: hasRated.value
    });
  } catch (error) {
    console.error('[DEBUG] Error updating trail actions state:', error);
  }
});
</script>

<style scoped>
.trail-actions {
  display: flex;
  align-items: center;
}

.btn-default {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid currentColor;
  transition: all 0.2s;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.icon-only .btn-default,
.icon-only .btn-outline,
.icon-only .btn-ghost {
  padding: 0.5rem;
}

.size-sm .btn-default,
.size-sm .btn-outline,
.size-sm .btn-ghost {
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
}

.size-sm.icon-only .btn-default,
.size-sm.icon-only .btn-outline,
.size-sm.icon-only .btn-ghost {
  padding: 0.35rem;
}

.size-lg .btn-default,
.size-lg .btn-outline,
.size-lg .btn-ghost {
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
}

.size-lg.icon-only .btn-default,
.size-lg.icon-only .btn-outline,
.size-lg.icon-only .btn-ghost {
  padding: 0.625rem;
}
</style>

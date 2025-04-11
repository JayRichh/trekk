<template>
  <button 
    @click="showRatingDialog = true"
    :class="[
      'rating-btn flex items-center gap-1',
      buttonClass || 'text-primary-600 hover:text-primary-800 font-medium'
    ]"
    :title="title || 'Rate this trail'"
  >
    <span v-if="!iconOnly" class="text-sm">{{ buttonText || 'Rate Trail' }}</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  </button>
  
  <RatingDialog
    :show="showRatingDialog"
    :trail-id="trailId"
    :rating-id="ratingId"
    :click-position="clickPosition"
    :initial-rating="initialRating"
    @close="showRatingDialog = false"
    @saved="handleRatingSaved"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import RatingDialog from './RatingDialog.vue';
import { useRatings } from '../../composables/useRatings';
import { useAuth } from '../../composables/useAuth';

const props = defineProps<{
  trailId: string;
  buttonText?: string;
  buttonClass?: string;
  title?: string;
  iconOnly?: boolean;
  clickPosition?: { x: number; y: number };
}>();

const emit = defineEmits(['rating-saved']);

const { hasUserRatedTrail, fetchTrailRatings } = useRatings();
const { isLoggedIn } = useAuth();

const showRatingDialog = ref(false);
const ratingId = ref<string | undefined>(undefined);
const initialRating = ref<{
  rating: number;
  comment?: string;
  tips?: string;
  image_url?: string;
} | undefined>(undefined);

// Check if user has already rated this trail
onMounted(async () => {
  if (isLoggedIn.value) {
    const hasRating = await hasUserRatedTrail(props.trailId);
    if (hasRating) {
      // User has already rated this trail, find their rating
      const ratings = await fetchTrailRatings(props.trailId);
      const userRating = ratings.find(r => r.user_id === (window as any).supabase.auth.user()?.id);
      
      if (userRating) {
        ratingId.value = userRating.id;
        initialRating.value = {
          rating: userRating.rating,
          comment: userRating.comment || undefined,
          tips: userRating.tips || undefined,
          image_url: userRating.image_url || undefined
        };
      }
    }
  }
});

// Handle when a rating is saved
function handleRatingSaved(rating: any) {
  emit('rating-saved', rating);
}
</script>

<style scoped>
.rating-btn {
  transition: all 0.2s ease;
}
</style>

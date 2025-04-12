<template>
  <div 
    class="card transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full"
    :class="isSelected ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-accent/10'"
    @click="$emit('click')"
  >
    <!-- Trail image with difficulty badge -->
    <div class="h-[180px] bg-cover bg-center relative" :style="{ backgroundImage: `url(${trail.imageUrl || 'https://images.unsplash.com/photo-1551632811-561732d1e306'})` }">
      <div class="absolute top-2 right-2 badge"
          :class="{
            'badge-easy': trail.difficulty === 'easy',
            'badge-moderate': trail.difficulty === 'moderate',
            'badge-difficult': trail.difficulty === 'difficult',
            'badge-extreme': trail.difficulty === 'extreme'
          }">
        {{ trail.difficulty }}
      </div>
      
      <!-- Rating badge -->
      <div v-if="hasRatings" class="absolute bottom-2 left-2 bg-black/60 text-white text-xs py-1 px-2 rounded-full flex items-center">
        <svg class="text-yellow-400 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
          <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <span>{{ averageRating.toFixed(1) }}</span>
        <span class="ml-1 text-gray-300">({{ trail.reviews?.length || 0 }})</span>
      </div>
    </div>
    
    <!-- Trail content -->
    <div class="p-4 flex-grow flex flex-col">
      <!-- Trail name and region tags -->
      <div class="mb-2">
        <h2 class="text-lg font-semibold text-primary mb-1 line-clamp-1">{{ trail.name }}</h2>
        
        <!-- Region tags -->
        <div v-if="trail.region && trail.region.length" class="flex flex-wrap gap-1 mb-2">
          <span 
            v-for="region in trail.region.slice(0, 2)" 
            :key="region"
            class="inline-block bg-wash-slate text-text-light px-1.5 rounded text-[10px]"
          >
            {{ region }}
          </span>
          <span v-if="trail.region.length > 2" class="text-[10px] text-text-muted">+{{ trail.region.length - 2 }}</span>
        </div>
      </div>
      
      <!-- Trail stats -->
      <div class="flex gap-4 mb-3 flex-wrap">
        <div class="trail-stat">
          <svg class="mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
          </svg>
          <span>{{ trail.length }} km</span>
        </div>
        <div class="trail-stat">
          <svg class="mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 13.5V12l-9.5 -7L3 12v1.5m18 0l-9.5 7L3 13.5m18 0v7.5h-18v-7.5"/>
          </svg>
          <span>{{ trail.elevationGain }} m</span>
        </div>
        <div class="trail-stat">
          <svg class="mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12L12 7M12 12L16 14"/>
          </svg>
          <span>{{ trail.estimatedTime || 'N/A' }}</span>
        </div>
      </div>
      
      <!-- Trail description -->
      <p class="text-sm text-text-light mb-4 line-clamp-3 flex-grow">{{ trail.description || 'No description available.' }}</p>
      
      <!-- Action buttons -->
      <div class="flex flex-col gap-3 mt-auto">
        <TrailActions 
          v-if="isLoggedIn"
          :trail-id="trail.id"
          icon-only
          size="sm"
          button-style="ghost"
          @click.stop
          @wishlist-updated="onWishlistUpdated"
          @rating-saved="onRatingSaved"
          @goal-updated="onGoalUpdated"
        />
        <div class="flex justify-between items-center">
          <button class="btn btn-sm btn-accent" @click.stop="$emit('view-details')">View Details</button>
          <button class="btn btn-sm btn-ghost" @click.stop="$emit('view-on-map')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6l-6 6"/>
            </svg>
            Map
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Trail } from '@/types/trail';
import TrailActions from './TrailActions.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps<{
  trail: Trail;
  isSelected?: boolean;
}>();

const { isLoggedIn } = useAuth();

defineEmits<{
  (e: 'click'): void;
  (e: 'view-details'): void;
  (e: 'view-on-map'): void;
}>();

// Event handlers for trail actions
const onWishlistUpdated = (inWishlist: boolean) => {
  console.log(`Trail ${props.trail.id} ${inWishlist ? 'added to' : 'removed from'} wishlist`);
};

const onRatingSaved = (rating: any) => {
  console.log('Rating saved:', rating);
};

const onGoalUpdated = (isGoal: boolean) => {
  console.log(`Trail ${props.trail.id} ${isGoal ? 'added to' : 'removed from'} goals`);
};

// Check if trail has ratings
const hasRatings = computed(() => props.trail.reviews && props.trail.reviews.length > 0);

// Calculate average rating
const averageRating = computed(() => {
  if (!hasRatings.value) return 0;
  
  const total = props.trail.reviews!.reduce((sum, review) => sum + review.rating, 0);
  return total / props.trail.reviews!.length;
});
</script>

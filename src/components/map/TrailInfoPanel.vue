<template>
  <div 
    v-if="trail" 
    class="absolute bottom-4 bg-surface shadow-card rounded-md overflow-hidden z-20 w-96 card transition-all duration-300"
    :class="[
      isSidebarOpen ? 'left-[calc(350px+1rem)]' : 'left-4'
    ]"
  >
    <div class="flex justify-between items-center px-4 py-3 border-b border-border card-header">
      <h3 class="font-medium text-primary">{{ trail.name }}</h3>
      <button 
        @click="$emit('close')" 
        class="text-text-light hover:text-text btn-icon btn-ghost p-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <div class="p-4 space-y-3 card-body">
      <div class="grid grid-cols-2 gap-2 trail-stats">
        <div class="flex flex-col stat-box p-2">
          <span class="text-xs text-text-muted stat-label">Length</span>
          <span class="text-sm font-medium stat-value">{{ trail.length }} km</span>
        </div>
        
        <div class="flex flex-col stat-box p-2">
          <span class="text-xs text-text-muted stat-label">Duration</span>
          <span class="text-sm font-medium stat-value">{{ trail.duration || trail.estimatedTime }}</span>
        </div>
        
        <div class="flex flex-col stat-box p-2">
          <span class="text-xs text-text-muted stat-label">Difficulty</span>
          <span 
            class="difficulty-label text-sm font-medium w-fit"
            :class="{
              'badge-easy': trail.difficulty === 'easy',
              'badge-moderate': trail.difficulty === 'moderate',
              'badge-difficult': trail.difficulty === 'difficult',
              'badge-extreme': trail.difficulty === 'extreme'
            }"
          >
            {{ trail.difficulty }}
          </span>
        </div>
        
        <div class="flex flex-col stat-box p-2">
          <span class="text-xs text-text-muted stat-label">Elevation</span>
          <span class="text-sm font-medium stat-value">{{ trail.elevationGain }}m</span>
        </div>
      </div>
      
      <p class="text-sm text-text-light line-clamp-3">{{ trail.description }}</p>
      
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <TrailActions 
            v-if="isLoggedIn"
            :trail-id="trail.id"
            :icon-only="false"
            size="sm"
            button-style="outline"
            @wishlist-updated="onWishlistUpdated"
            @rating-saved="onRatingSaved"
            @goal-updated="onGoalUpdated"
          />
        </div>
        
        <div class="flex justify-end">
          <router-link 
            :to="`/trails/${trail.id}`"
            class="btn btn-sm btn-accent w-full"
          >
            View Full Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Trail } from '@/types/trail';
import { useAuth } from '@/composables/useAuth';
import TrailActions from '@/components/trails/TrailActions.vue';

const props = defineProps<{
  trail: Trail | null;
  isSidebarOpen?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { isLoggedIn } = useAuth();

// Event handlers for trail actions
const onWishlistUpdated = (inWishlist: boolean) => {
  console.log(`Trail ${inWishlist ? 'added to' : 'removed from'} wishlist`);
  // You could add a toast notification here in a real implementation
};

const onRatingSaved = (rating: any) => {
  console.log('Rating saved:', rating);
  // Refresh trail data if needed
};

const onGoalUpdated = (isGoal: boolean) => {
  console.log(`Trail ${isGoal ? 'added to' : 'removed from'} goals`);
  // You could add a toast notification here in a real implementation
};
</script>

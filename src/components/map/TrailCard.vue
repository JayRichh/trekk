<template>
  <div 
    class="card transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    :class="isSelected ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-accent/10'"
    @click="$emit('click')"
  >
    <div class="flex p-3">
      <!-- Trail image -->
      <div class="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
        <img 
          v-if="trail.imageUrl"
          :src="trail.imageUrl" 
          :alt="trail.name" 
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="text-text-light">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
          </svg>
        </div>
      </div>
      
      <!-- Trail info -->
      <div class="ml-3 flex-grow min-w-0">
        <!-- Trail name and difficulty badge -->
        <div class="flex justify-between items-start">
          <h3 class="font-medium text-primary truncate pr-2">{{ trail.name }}</h3>
          <span 
            class="badge"
            :class="{
              'badge-easy': trail.difficulty === 'easy',
              'badge-moderate': trail.difficulty === 'moderate',
              'badge-difficult': trail.difficulty === 'difficult',
              'badge-extreme': trail.difficulty === 'extreme',
              'bg-blue-100 text-blue-800': !trail.difficulty
            }"
          >
            {{ trail.difficulty || 'Unknown' }}
          </span>
        </div>
        
        <!-- Trail stats -->
        <div class="mt-1 flex flex-wrap gap-x-3 text-xs text-text-light">
          <span class="trail-stat" title="Length">
            <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            {{ trail.length.toFixed(1) }} km
          </span>
          <span class="trail-stat" title="Elevation gain">
            <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            {{ trail.elevationGain || 0 }}m
          </span>
          <span v-if="trail.estimatedTime" class="trail-stat" title="Estimated time">
            <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            {{ trail.estimatedTime }}
          </span>
        </div>
        
        <!-- Region(s) -->
        <div v-if="trail.region && trail.region.length" class="mt-1 flex flex-wrap gap-1">
          <span 
            v-for="region in trail.region.slice(0, 2)" 
            :key="region"
            class="inline-block bg-wash-slate text-text-light px-1.5 rounded text-[10px]"
          >
            {{ region }}
          </span>
          <span v-if="trail.region.length > 2" class="text-[10px] text-text-muted">+{{ trail.region.length - 2 }}</span>
        </div>
        
        <!-- Trail description -->
        <p v-if="trail.description" class="mt-1 text-xs text-text-muted line-clamp-1">
          {{ trail.description }}
        </p>
      </div>
    </div>
    
    <!-- Rating -->
    <div v-if="hasRatings" class="px-3 py-1 border-t border-border flex items-center">
      <div class="flex items-center">
        <span class="text-xs font-medium text-text mr-1">{{ averageRating.toFixed(1) }}</span>
        <div class="flex">
          <template v-for="i in 5" :key="i">
            <svg 
              :class="i <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'"
              class="w-3 h-3" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </template>
        </div>
        <span class="text-xs text-text-muted ml-1">({{ trail.reviews?.length || 0 }})</span>
      </div>
    </div>
    
    <!-- Action buttons -->
    <div class="flex border-t border-border">
      <button 
        class="flex-1 py-1.5 text-xs text-center font-medium text-text transition-colors hover:bg-primary-100 active:bg-primary-200"
        @click.stop="$emit('fly-to')"
      >
        <span class="flex items-center justify-center">
          <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          Fly to
        </span>
      </button>
      <div class="divider-vertical"></div>
      <button 
        class="flex-1 py-1.5 text-xs text-center font-medium text-text transition-colors hover:bg-primary-100 active:bg-primary-200"
        @click.stop="$emit('view-details')"
      >
        <span class="flex items-center justify-center">
          <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
          Details
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Trail } from '@/types/trail';

const props = defineProps<{
  trail: Trail;
  isSelected: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
  (e: 'fly-to'): void;
  (e: 'view-details'): void;
}>();

// Check if trail has ratings
const hasRatings = computed(() => props.trail.reviews && props.trail.reviews.length > 0);

// Calculate average rating
const averageRating = computed(() => {
  if (!hasRatings.value) return 0;
  
  const total = props.trail.reviews!.reduce((sum, review) => sum + review.rating, 0);
  return total / props.trail.reviews!.length;
});
</script>

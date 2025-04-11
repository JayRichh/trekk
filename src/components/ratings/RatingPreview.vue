<template>
  <div 
    class="rating-preview relative bg-white rounded-md shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md overflow-hidden"
    :class="{ 'z-20 scale-105 shadow-lg': expanded }"
    @mouseenter="expanded = true" 
    @mouseleave="expanded = false"
  >
    <!-- Compact view -->
    <div v-if="!expanded" class="p-4 flex items-start gap-3">
      <div class="rating-stars text-yellow-400 flex-shrink-0">
        <span v-for="i in 5" :key="i" :class="i <= rating.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
      </div>
      <div class="flex-grow truncate">
        <h4 class="font-medium truncate">{{ rating.author || 'Anonymous' }}</h4>
        <p class="text-sm text-gray-500 truncate">{{ rating.comment || 'No comment' }}</p>
      </div>
      <div class="text-xs text-gray-400 flex-shrink-0">
        {{ formatDate(rating.created_at) }}
      </div>
    </div>
    
    <!-- Expanded view -->
    <div v-else class="absolute top-0 left-0 w-[200%] bg-white rounded-md shadow-xl p-4 z-10 border border-gray-200">
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-2">
          <div v-if="rating.user?.avatar_url" class="w-8 h-8 rounded-full overflow-hidden">
            <img :src="rating.user.avatar_url" :alt="rating.user.display_name || 'User'" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span class="text-primary-700 font-medium">
              {{ (rating.user?.display_name?.[0] || 'A').toUpperCase() }}
            </span>
          </div>
          <h4 class="font-bold">{{ rating.user?.display_name || rating.author || 'Anonymous' }}</h4>
        </div>
        <div class="rating-stars text-yellow-400">
          <span v-for="i in 5" :key="i" :class="i <= rating.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
      </div>
      
      <p class="text-gray-700 mb-3">{{ rating.comment || 'No comment provided' }}</p>
      
      <div v-if="rating.image_url" class="mb-3">
        <img :src="rating.image_url" alt="Rating image" class="rounded-md w-full h-40 object-cover" />
      </div>

      <div v-if="rating.tips" class="mb-3 p-3 bg-gray-50 rounded-md">
        <p class="text-sm font-medium text-gray-700">Hiker Tips:</p>
        <p class="text-sm text-gray-600">{{ rating.tips }}</p>
      </div>
      
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span>{{ formatDate(rating.created_at) }}</span>
        <div class="space-x-2" v-if="canEdit">
          <button 
            @click.stop="$emit('edit', rating)"
            class="text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button 
            @click.stop="$emit('delete', rating)"
            class="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../../composables/useAuth';

const props = defineProps<{
  rating: {
    id: string;
    trail_id: string;
    user_id?: string;
    user?: {
      id: string;
      display_name?: string;
      avatar_url?: string;
    };
    author?: string;
    rating: number;
    comment?: string;
    tips?: string;
    image_url?: string;
    created_at: string;
    updated_at?: string;
  };
}>();

defineEmits(['edit', 'delete']);

const { userProfile } = useAuth();
const expanded = ref(false);

const canEdit = computed(() => {
  return userProfile.value?.id === props.rating.user_id;
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>

<style scoped>
.rating-preview {
  position: relative;
}

.expanded-view {
  transition: all 0.3s ease-in-out;
}
</style>

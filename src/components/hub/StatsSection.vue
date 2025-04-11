<template>
  <DashboardCard title="My Stats" content-type="stats" section-id="stats" :loading="loading">
    <div class="space-y-6">
      <!-- Summary stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm">
          <div class="text-3xl font-bold text-primary-600">{{ stats.ratings || 0 }}</div>
          <div class="text-sm text-gray-600">Trails Rated</div>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm">
          <div class="text-3xl font-bold text-accent-600">{{ stats.wishlist || 0 }}</div>
          <div class="text-sm text-gray-600">Trails Wishlisted</div>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm">
          <div class="text-3xl font-bold text-green-600">{{ stats.completedGoals || 0 }}</div>
          <div class="text-sm text-gray-600">Goals Completed</div>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm">
          <div class="text-3xl font-bold text-blue-600">{{ stats.inProgressGoals || 0 }}</div>
          <div class="text-sm text-gray-600">Goals In Progress</div>
        </div>
      </div>
      
      <!-- Average rating chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Your Average Rating</h3>
        <div class="flex items-center">
          <div class="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              class="bg-yellow-400 h-full transition-all duration-500"
              :style="{ width: `${(stats.averageRating / 5) * 100}%` }"
            ></div>
          </div>
          <div class="ml-3 flex items-center text-yellow-500">
            <span class="text-lg font-bold">{{ stats.averageRating.toFixed(1) }}</span>
            <span class="ml-1">/ 5</span>
          </div>
        </div>
      </div>
      
      <!-- Goal completion progress -->
      <div v-if="stats.totalGoals > 0" class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-700 mb-1">Goal Completion</h3>
        <div class="relative pt-1">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xs text-gray-500">
              {{ stats.completedGoals }} of {{ stats.totalGoals }} goals completed
            </div>
            <div class="text-xs text-gray-500">
              {{ Math.round((stats.completedGoals / stats.totalGoals) * 100) }}%
            </div>
          </div>
          <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div 
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
              :style="{ width: `${(stats.completedGoals / stats.totalGoals) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Activity chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Recent Activity</h3>
        <div class="h-20 flex items-end space-x-1">
          <div 
            v-for="(value, index) in activityData" 
            :key="index" 
            class="bg-primary-500 opacity-80 hover:opacity-100 transition-opacity"
            :style="{ 
              height: `${(value / maxActivity) * 100}%`,
              width: `${100 / activityData.length - 1}%` 
            }"
            :title="`${value} activities`"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>Last 7 days</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRatings } from '../../composables/useRatings';
import { useGoals } from '../../composables/useGoals';
import { useWishlist } from '../../composables/useWishlist';
import { useAuth } from '../../composables/useAuth';
import DashboardCard from './DashboardCard.vue';

const { ratings } = useRatings();
const { goals, getGoalStats } = useGoals();
const { wishlistItems } = useWishlist();
const { isLoggedIn } = useAuth();
const loading = ref(true);

// Mock activity data for the chart - in a real app, this would come from the database
const activityData = ref([1, 3, 2, 5, 2, 4, 8]);
const maxActivity = computed(() => Math.max(...activityData.value));

// Calculate stats based on data from different composables
const stats = computed(() => {
  const goalStats = getGoalStats();
  
  // Calculate average rating
  let totalRatingValue = 0;
  ratings.value.forEach(rating => {
    totalRatingValue += rating.rating;
  });
  const avgRating = ratings.value.length > 0 ? totalRatingValue / ratings.value.length : 0;
  
  return {
    ratings: ratings.value.length,
    wishlist: wishlistItems.value.length,
    completedGoals: goalStats.completed,
    inProgressGoals: goalStats.inProgress,
    pendingGoals: goalStats.pending,
    totalGoals: goalStats.total,
    averageRating: avgRating,
    completionRate: goalStats.completionRate
  };
});

onMounted(() => {
  // Short delay to show loading state and ensure all data is loaded
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

// Watch for changes in auth state
watch(() => isLoggedIn.value, (newValue) => {
  if (newValue) {
    // Refresh data when user logs in
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }
});
</script>

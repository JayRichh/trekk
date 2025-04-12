<template>
  <div class="hub-view-container">
    <HubLayout :sections="dashboardSections" v-if="!loading">
      <!-- Section slots are passed to the HubLayout component -->
      <template #section-welcome>
        <UserWelcome />
      </template>
      
      <template #section-ratings>
        <RatingsSection />
      </template>
      
      <template #section-goals>
        <GoalsSection />
      </template>
      
      <template #section-wishlist>
        <WishlistSection />
      </template>
      
      <template #section-stats>
        <StatsSection />
      </template>
    </HubLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HubLayout from '../components/hub/HubLayout.vue';
import UserWelcome from '../components/hub/UserWelcome.vue';
import RatingsSection from '../components/hub/RatingsSection.vue';
import WishlistSection from '../components/hub/WishlistSection.vue';
import GoalsSection from '../components/hub/GoalsSection.vue';
import StatsSection from '../components/hub/StatsSection.vue';
import { defaultSections } from '../config/dashboard-config';

// Initialize dashboard sections from config
const dashboardSections = ref(defaultSections);
const loading = ref(true);

onMounted(async () => {
  document.title = 'My Dashboard | Trekk';
  
  // Allow time for child components to fetch data
  // In a real app, we could coordinate with actual API requests
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.hub-view-container {
  overflow: hidden;
  min-height: calc(100vh - 4rem);
}
</style>

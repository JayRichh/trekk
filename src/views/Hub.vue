<template>
  <div class="hub-view-container">
    <HubLayout :sections="dashboardSections">
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

onMounted(() => {
  // Any additional setup logic can go here
  document.title = 'My Dashboard | Trekk';
});
</script>

<style scoped>
.hub-view-container {
overflow: hidden;
}
</style>

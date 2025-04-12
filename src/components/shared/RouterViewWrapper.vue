<template>
  <div class="min-h-screen flex flex-col">
    <!-- Fixed header & footer placeholders with min-height to prevent layout shift -->
    <div v-if="isLoading" class="relative min-h-screen">
      <PageSkeletonLoader :type="skeletonType" />
      
      <!-- Overlay spinner for progress indication -->
      <div class="absolute inset-0 flex items-center justify-center z-50">
        <LoadingSpinner 
          ref="loadingSpinnerRef"
          :loading="isLoading" 
          :show-progress="true"
          :external-control="true"
          initial-progress-text="Loading page..."
        />
      </div>
    </div>
    
    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" @before-leave="startLoading" @after-enter="stopLoading">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLoadingState } from '@/composables/useLoadingState';
import PageSkeletonLoader from './PageSkeletonLoader.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const { isLoading, skeletonType, startLoading, stopLoading, updateProgress } = useLoadingState();
const loadingSpinnerRef = ref<InstanceType<typeof LoadingSpinner> | null>(null);

// Helper function to update loading spinner progress with guards
function updateSpinnerProgress(progress: number, text: string) {
  // Only update if we're in loading state to prevent loops
  if (isLoading.value && loadingSpinnerRef.value) {
    loadingSpinnerRef.value.updateProgress(progress, text);
    updateProgress(progress, text);
  }
}

// Track if we're currently in a loading operation to prevent loops
const isLoadingOperation = ref(false);

// Show initial loading state 
onMounted(() => {
  if (!isLoadingOperation.value) {
    isLoadingOperation.value = true;
    startLoading();
    
    // Check if we're starting on the home page
    const isHomePage = route.path === '/';
    
    // Use themed messages for home page
    if (isHomePage) {
      updateSpinnerProgress(10, 'Preparing your adventure...');
      setTimeout(() => updateSpinnerProgress(30, 'Loading trails...'), 100);
      setTimeout(() => updateSpinnerProgress(60, 'Mapping terrain...'), 250);
      setTimeout(() => updateSpinnerProgress(90, 'Almost ready for exploration...'), 400);
    } else {
      // Standard messages for other pages
      updateSpinnerProgress(10, 'Initializing application...');
      setTimeout(() => updateSpinnerProgress(30, 'Loading resources...'), 100);
      setTimeout(() => updateSpinnerProgress(60, 'Preparing layout...'), 250);
      setTimeout(() => updateSpinnerProgress(90, 'Almost ready...'), 400);
    }
    
    // Assume initial content is loaded after a short delay
    setTimeout(() => {
      updateSpinnerProgress(100, 'Complete!');
      stopLoading();
      isLoadingOperation.value = false;
    }, 500);
  }
});

// Watch for route changes to show loading state
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (newPath !== oldPath && !isLoadingOperation.value) {
      // Only start loading if we're not already in a loading operation
      isLoadingOperation.value = true;
      startLoading();
      
      // Set loading message based on route
      const targetPage = newPath.split('/')[1] || 'home';
      updateSpinnerProgress(30, `Loading ${targetPage} page...`);
      
      // Use a single timeout with incremental progress
      const totalTime = 500;
      
      // Choose appropriate message based on route
      const isHomePage = newPath === '/';
      const renderingMessage = isHomePage ? 'Preparing adventure...' : 'Rendering content...';
      
      setTimeout(() => updateSpinnerProgress(70, renderingMessage), totalTime * 0.3);
      setTimeout(() => updateSpinnerProgress(100, 'Ready!'), totalTime * 0.7);
      setTimeout(() => {
        stopLoading();
        isLoadingOperation.value = false;
      }, totalTime);
    }
  }
);

// Navigation events with guards to prevent loading loops
const unlistenStart = router.beforeEach((to) => {
  // Only start loading if we're not already in a loading operation
  if (!isLoadingOperation.value) {
    isLoadingOperation.value = true;
    startLoading();
    const targetPage = to.name?.toString() || 'page';
    updateSpinnerProgress(10, `Navigating to ${targetPage}...`);
  }
  return true;
});

const unlistenEnd = router.afterEach((to) => {
  // Only update if we're in a loading operation
  if (isLoadingOperation.value) {
    // Choose appropriate message based on route
    const path = to.path;
    const progressMessage = path === '/' 
      ? 'Welcome to Trekk...' // Special message for home page
      : 'Finalizing page...';  // Default message for other pages
    
    // Update progress with route-specific message
    updateSpinnerProgress(80, progressMessage);
    
    // Add a small delay to ensure components have time to mount
    setTimeout(() => {
      updateSpinnerProgress(100, 'Complete!');
      stopLoading();
      isLoadingOperation.value = false;
    }, 300);
  }
});

onBeforeUnmount(() => {
  // Clean up listeners
  unlistenStart();
  unlistenEnd();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

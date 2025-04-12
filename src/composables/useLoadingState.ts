import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export function useLoadingState() {
  const isLoading = ref(true);
  const loadingProgress = ref(0);
  const loadingText = ref('Loading...');
  const route = useRoute();
  
  // Determine skeleton type based on current route
  const skeletonType = computed(() => {
    const path = route.path;
    
    if (path === '/') {
      return 'home';
    } else if (path === '/trails') {
      return 'trails';
    } else if (path.startsWith('/trails/') && path !== '/trails') {
      return 'trail-detail';
    } else if (path === '/map') {
      return 'map';
    } else if (path === '/hub') {
      return 'hub';
    } else if (['/login', '/signup', '/forgot-password', '/reset-password', '/profile'].includes(path)) {
      return 'default'; // Auth pages
    } else {
      return 'default';
    }
  });

  // Track if a loading operation is already in progress
  const loadingOperationCount = ref(0);
  
  // Set loading state with guard against duplicate loading
  const startLoading = () => {
    // Increment operation count
    loadingOperationCount.value += 1;
    
    // Only update state if it wasn't already loading
    if (!isLoading.value) {
      isLoading.value = true;
      loadingProgress.value = 0;
      loadingText.value = 'Loading...';
    }
  };

  const stopLoading = () => {
    // Decrement operation count (but never below 0)
    loadingOperationCount.value = Math.max(0, loadingOperationCount.value - 1);
    
    // Only actually stop loading if there are no more pending operations
    if (loadingOperationCount.value === 0) {
      loadingProgress.value = 100;
      isLoading.value = false;
    }
  };
  
  // Update loading progress and text safely
  const updateProgress = (progress: number, text?: string) => {
    // Only update if we are in a loading state
    if (isLoading.value) {
      loadingProgress.value = progress;
      if (text) {
        loadingText.value = text;
      }
    }
  };
  
  // Function to update page-specific loading message
  const updatePageLoadingMessage = (message: string) => {
    if (isLoading.value) {
      loadingText.value = message;
    }
  };

  return {
    isLoading,
    skeletonType,
    loadingProgress,
    loadingText,
    startLoading,
    stopLoading,
    updateProgress,
    updatePageLoadingMessage
  };
}

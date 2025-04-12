import { ref, onMounted, onUnmounted, watch } from 'vue';

interface InfiniteScrollOptions {
  threshold?: number; // Distance from bottom in pixels to trigger loading
  scrollStuckThreshold?: number; // How many scroll events with no position change before considering "stuck"
  loadMoreFunction: () => Promise<boolean>; // Function to call when more items need to be loaded, should return true if more items are available
  loadingRef: { value: boolean }; // Reference to loading state
  disabled?: { value: boolean }; // Optional reference to disabled state
  debug?: boolean; // Enable debug logging
}

/**
 * Composable for infinite scrolling with intelligent position tracking
 * 
 * This uses both scroll events and IntersectionObserver for reliable detection
 * of when to load more content, and can detect when scrolling is "stuck"
 */
export function useInfiniteScroll(options: InfiniteScrollOptions) {
  // Default options
  const {
    threshold = 200,
    scrollStuckThreshold = 3,
    loadMoreFunction,
    loadingRef,
    disabled = ref(false),
    debug = false
  } = options;

  // Element refs
  const sentinelRef = ref<HTMLElement | null>(null);
  const containerRef = ref<HTMLElement | null>(null);

  // Scroll state tracking
  const lastScrollPosition = ref<number>(0);
  const lastScrollTime = ref<number>(0);
  const unchangedScrollCount = ref<number>(0);
  const scrollDirection = ref<'up' | 'down' | null>(null);
  const observer = ref<IntersectionObserver | null>(null);
  const manualLoadingNeeded = ref<boolean>(false);
  const allItemsLoaded = ref<boolean>(false);

  // Debug logging
  const log = (...args: any[]) => {
    if (debug) {
      console.log('[InfiniteScroll]', ...args);
    }
  };

  /**
   * Handle scroll events with position tracking
   */
  const handleScroll = () => {
    if (loadingRef.value || disabled.value || allItemsLoaded.value) return;

    const currentScrollPosition = window.scrollY;
    const currentTime = Date.now();
    const docHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrolledToBottom = docHeight - (currentScrollPosition + windowHeight) < threshold;

    // Determine scroll direction
    if (currentScrollPosition > lastScrollPosition.value) {
      scrollDirection.value = 'down';
    } else if (currentScrollPosition < lastScrollPosition.value) {
      scrollDirection.value = 'up';
    }

    // Track unchanged scroll positions (could indicate a "stuck" state)
    if (
      currentScrollPosition === lastScrollPosition.value &&
      currentTime - lastScrollTime.value > 100 && // Ignore rapid scroll events
      scrollDirection.value === 'down' // Only care about getting stuck when scrolling down
    ) {
      unchangedScrollCount.value++;
      log('Scroll position unchanged', unchangedScrollCount.value, 'times');
    } else {
      unchangedScrollCount.value = 0;
    }

    // Update last position and time
    lastScrollPosition.value = currentScrollPosition;
    lastScrollTime.value = currentTime;

    // Load more content if scrolled to bottom or "stuck"
    if (scrolledToBottom || unchangedScrollCount.value >= scrollStuckThreshold) {
      log('Loading more items',
        scrolledToBottom ? 'from bottom threshold' : 'from stuck detection',
        'Scroll position:', currentScrollPosition,
        'Doc height:', docHeight
      );
      
      loadMoreContent();
    }
  };

  /**
   * Load more content and check if we should continue monitoring
   */
  const loadMoreContent = async () => {
    if (loadingRef.value || disabled.value || allItemsLoaded.value) return;

    loadingRef.value = true;
    try {
      // Call the load function and get whether there are more items
      const hasMoreItems = await loadMoreFunction();
      log('Loaded more content, has more items:', hasMoreItems);
      
      if (!hasMoreItems) {
        log('All items loaded, disabling infinite scroll');
        allItemsLoaded.value = true;
        manualLoadingNeeded.value = false;
      } else {
        // Reset the unchanged count after successfully loading
        unchangedScrollCount.value = 0;
      }
    } catch (error) {
      log('Error loading more content:', error);
      // If loading fails, show manual loading button
      manualLoadingNeeded.value = true;
    } finally {
      loadingRef.value = false;
    }
  };

  /**
   * Handle intersection observer events
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    if (loadingRef.value || disabled.value || allItemsLoaded.value) return;

    for (const entry of entries) {
      if (entry.isIntersecting) {
        log('Sentinel element intersected viewport, loading more items');
        loadMoreContent();
        break;
      }
    }
  };

  /**
   * Create the intersection observer
   */
  const setupIntersectionObserver = () => {
    if (!sentinelRef.value) return;

    log('Setting up intersection observer');
    observer.value = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin: `0px 0px ${threshold}px 0px`, // Load a bit earlier
      threshold: 0.1 // Trigger when 10% visible
    });

    observer.value.observe(sentinelRef.value);
  };

  /**
   * Clean up the observer
   */
  const cleanupIntersectionObserver = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  };

  /**
   * Manually trigger loading more content
   */
  const loadMore = () => {
    log('Manual load more triggered');
    manualLoadingNeeded.value = false;
    loadMoreContent();
  };

  /**
   * Reset the infinite scroll state
   */
  const reset = () => {
    log('Resetting infinite scroll state');
    lastScrollPosition.value = 0;
    lastScrollTime.value = 0;
    unchangedScrollCount.value = 0;
    manualLoadingNeeded.value = false;
    allItemsLoaded.value = false;
    
    // Re-attach observer if needed
    cleanupIntersectionObserver();
    if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  };

  // Watch for sentinel ref changes to setup/cleanup observer
  watch(sentinelRef, (newVal, oldVal) => {
    if (oldVal !== newVal) {
      cleanupIntersectionObserver();
      if (newVal) {
        setupIntersectionObserver();
      }
    }
  });

  // Handle disabled changes
  watch(disabled, (isDisabled) => {
    if (isDisabled) {
      cleanupIntersectionObserver();
    } else if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  });

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    cleanupIntersectionObserver();
  });

  return {
    sentinelRef,
    containerRef,
    manualLoadingNeeded,
    allItemsLoaded,
    loadMore,
    reset,
    scrollPosition: lastScrollPosition,
    scrollDirection
  };
}

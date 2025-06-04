import { ref, onMounted, onUnmounted, watch } from 'vue';

interface InfiniteScrollOptions {
  loadMoreFunction: () => Promise<boolean>;
  loadingRef: { value: boolean };
  disabled?: { value: boolean };
}

export function useInfiniteScroll(options: InfiniteScrollOptions) {
  const {
    loadMoreFunction,
    loadingRef,
    disabled = ref(false)
  } = options;

  const sentinelRef = ref<HTMLElement | null>(null);
  const observer = ref<IntersectionObserver | null>(null);
  const allItemsLoaded = ref<boolean>(false);
  const manualLoadingNeeded = ref<boolean>(false);

  const loadMoreContent = async () => {
    if (loadingRef.value || disabled.value || allItemsLoaded.value) {
      console.log('Skipping load more: loading=', loadingRef.value, 'disabled=', disabled.value, 'allItemsLoaded=', allItemsLoaded.value);
      return;
    }

    console.log('Loading more content...');
    loadingRef.value = true;
    try {
      const hasMoreItems = await loadMoreFunction();
      console.log('Load more result:', hasMoreItems);
      
      // Only set allItemsLoaded to true if we explicitly get false from loadMoreFunction
      if (hasMoreItems === false) {
        console.log('No more items to load, marking as complete');
        allItemsLoaded.value = true;
        manualLoadingNeeded.value = false;
      }
    } catch (error) {
      console.error('Error loading more content:', error);
      manualLoadingNeeded.value = true;
    } finally {
      loadingRef.value = false;
    }
  };

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    if (loadingRef.value || disabled.value || allItemsLoaded.value) return;

    for (const entry of entries) {
      if (entry.isIntersecting) {
        loadMoreContent();
        break;
      }
    }
  };

  const setupIntersectionObserver = () => {
    if (!sentinelRef.value) return;

    observer.value = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px 0px',
      threshold: 0.1
    });

    observer.value.observe(sentinelRef.value);
  };

  const cleanupIntersectionObserver = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  };

  const loadMore = async (): Promise<boolean> => {
    manualLoadingNeeded.value = false;
    await loadMoreContent();
    return !allItemsLoaded.value;
  };

  const reset = () => {
    manualLoadingNeeded.value = false;
    allItemsLoaded.value = false;
    
    cleanupIntersectionObserver();
    if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  };

  watch(sentinelRef, (newVal, oldVal) => {
    if (oldVal !== newVal) {
      cleanupIntersectionObserver();
      if (newVal) {
        setupIntersectionObserver();
      }
    }
  });

  watch(disabled, (isDisabled) => {
    if (isDisabled) {
      cleanupIntersectionObserver();
    } else if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  });

  onMounted(() => {
    if (sentinelRef.value) {
      setupIntersectionObserver();
    }
  });

  onUnmounted(() => {
    cleanupIntersectionObserver();
  });

  return {
    sentinelRef,
    manualLoadingNeeded,
    allItemsLoaded,
    loadMore,
    reset
  };
}

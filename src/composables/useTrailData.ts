import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Trail, Region, TrailFilters } from '../types/trail';
import { apiService } from '../services/apiService';

export function useTrailData() {
  const trails = ref<Trail[]>([]);
  const visibleTrails = ref<Trail[]>([]);
  const regions = ref<Region[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(12);
  const prefetchAmount = ref(2); // Number of pages to prefetch ahead
  const isFetchingMore = ref(false);

  // Track which pages have been loaded
  const loadedPages = ref<Set<number>>(new Set([1]));

  // Watch currentPage to load more data as needed
  watch(currentPage, async (newPage) => {
    // Calculate which pages should be loaded (current page and a few pages ahead)
    const pagesToLoad = [];
    for (let i = newPage; i <= newPage + prefetchAmount.value; i++) {
      if (i <= totalPages.value && !loadedPages.value.has(i)) {
        pagesToLoad.push(i);
      }
    }
    
    if (pagesToLoad.length > 0) {
      await loadPageData(pagesToLoad);
    }
  });
  
  // Listen for scroll events to prefetch additional pages when user gets close to the bottom
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
  
  // Handle scroll events to prefetch data
  const handleScroll = debounce(() => {
    if (isFetchingMore.value) return;
    
    const scrollPosition = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollThreshold = 800; // px from bottom
    
    if (docHeight - scrollPosition < scrollThreshold) {
      const nextPage = currentPage.value + 1;
      if (nextPage <= totalPages.value && !loadedPages.value.has(nextPage)) {
        loadPageData([nextPage]);
      }
    }
  }, 100);
  
  // Debounce utility function
  function debounce(fn: Function, delay: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // Computed paginated trails
  const paginatedTrails = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return visibleTrails.value.slice(start, end);
  });

  // Total pages
  const totalPages = computed(() => 
    Math.ceil(trails.value.length / itemsPerPage.value)
  );

  // Load specific pages of data
  const loadPageData = async (pageNumbers: number[]) => {
    isFetchingMore.value = true;
    
    try {
      // For each page number, calculate indices and load the data
      for (const page of pageNumbers) {
        const start = (page - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        
        // If we don't have this data yet, fetch it
        if (start >= visibleTrails.value.length) {
          // In a real app with API pagination, we would fetch just this page
          // Here we're just slicing from the full dataset
          const pageData = trails.value.slice(start, end);
          visibleTrails.value = [...visibleTrails.value, ...pageData];
        }
        
        // Mark this page as loaded
        loadedPages.value.add(page);
      }
    } catch (err) {
      console.error('Error loading page data:', err);
    } finally {
      isFetchingMore.value = false;
    }
  };

  // Fetch all trails with optional filters
  const fetchTrails = async (filters?: TrailFilters) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await apiService.getTrails(filters);
      trails.value = result;
      
      // Reset pagination state
      currentPage.value = 1;
      loadedPages.value = new Set([1]);
      
      // Initialize visible trails with first page
      const initialData = result.slice(0, itemsPerPage.value);
      visibleTrails.value = initialData;
      
      // Prefetch next pages
      const pagesToPrefetch = [];
      for (let i = 2; i <= 1 + prefetchAmount.value; i++) {
        if (i <= Math.ceil(result.length / itemsPerPage.value)) {
          pagesToPrefetch.push(i);
        }
      }
      
      if (pagesToPrefetch.length > 0) {
        await loadPageData(pagesToPrefetch);
      }
    } catch (err) {
      console.error('Error fetching trails:', err);
      error.value = 'Failed to fetch trails data.';
      trails.value = [];
      visibleTrails.value = [];
    } finally {
      loading.value = false;
    }
    
    return trails.value;
  };

  // Fetch regions
  const fetchRegions = async (): Promise<Region[]> => {
    try {
      const result = await apiService.getRegions();
      regions.value = result;
      return result;
    } catch (err) {
      console.error('Error fetching regions:', err);
      return [];
    }
  };

  // Search trails by query
  const searchTrails = async (query: string, limit?: number) => {
    if (!trails.value.length) {
      await fetchTrails();
    }
    
    // Local filtering
    const searchTerms = query.toLowerCase().split(' ');
    return trails.value.filter(trail => {
      const content = `${trail.name} ${trail.description}`.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    }).slice(0, limit || trails.value.length);
  };

  // Get trail details by ID
  const getTrailDetails = async (trailId: string) => {
    try {
      return await apiService.getTrailById(trailId);
    } catch (err) {
      console.error('Error fetching trail details:', err);
      
      // Try to find trail in already loaded data
      if (trails.value.length) {
        return trails.value.find(trail => trail.id === trailId);
      }
      
      // If no trail found, throw error to be handled by the caller
      throw new Error('Failed to fetch trail details');
    }
  };

  return {
    // State
    trails,
    regions,
    loading,
    error,
    isFetchingMore,
    
    // Pagination
    currentPage,
    itemsPerPage,
    paginatedTrails,
    totalPages,
    prefetchAmount,
    loadPageData,
    
    // Data fetching
    fetchTrails,
    fetchRegions,
    searchTrails,
    getTrailDetails
  };
}

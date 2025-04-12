import { ref, computed, watch } from 'vue';
import type { Trail, Region, TrailFilters, TrailStatistics } from '../types/trail';
import { apiService } from '../services/apiService';

export function useTrailData() {
  // All trails data - stores complete collection for operations that need all data
  const allTrails = ref<Trail[]>([]);
  // Visible trails - only contains what should be visible to the user
  const visibleTrails = ref<Trail[]>([]);
  const regions = ref<Region[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(100); // Increased from 12 to load more trails at once
  const prefetchAmount = ref(5); // Increased from 2 to prefetch more aggressively
  const isFetchingMore = ref(false);
  const totalTrailCount = ref(0); // Total count of trails (may be more than what's loaded)
  const lastAppliedFilters = ref<TrailFilters | undefined>(); // Track filter state

  // Track which pages have been loaded and prefetched
  const loadedPages = ref<Set<number>>(new Set([1]));
  const prefetchedPages = ref<Set<number>>(new Set([1]));

  // Watch currentPage to prefetch data as needed
  watch(currentPage, async (newPage) => {
    // Calculate which pages should be prefetched (current page and a few pages ahead)
    const pagesToLoad = [];
    for (let i = newPage; i <= newPage + prefetchAmount.value; i++) {
      if (i <= totalPages.value && !prefetchedPages.value.has(i)) {
        pagesToLoad.push(i);
        prefetchedPages.value.add(i);
      }
    }
    
    if (pagesToLoad.length > 0) {
      // We'll run this in the background but not wait for it
      loadPageData(pagesToLoad, true).catch(err => {
        console.error('Failed to prefetch pages:', err);
      });
    }
  });

  // Computed paginated trails
  const paginatedTrails = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return visibleTrails.value.slice(start, end);
  });

  // Total pages
  const totalPages = computed(() => 
    Math.ceil(totalTrailCount.value / itemsPerPage.value)
  );

  // Load specific pages of data with option to just prefetch (not change visible trails)
  const loadPageData = async (pageNumbers: number[], prefetchOnly = false): Promise<boolean> => {
    if (isFetchingMore.value && !prefetchOnly) return false;
    
    if (!prefetchOnly) {
      isFetchingMore.value = true;
    }
    
    try {
      let addedNewItems = false;
      
      // For each page number, fetch the data from the API
      for (const page of pageNumbers) {
        // Skip if we've already fully loaded this page (not just prefetched)
        if (loadedPages.value.has(page)) continue;
        
        const startIndex = (page - 1) * itemsPerPage.value;
        
        // If data should already be loaded in allTrails, use that instead of API call
        if (allTrails.value.length >= startIndex + itemsPerPage.value) {
          const pageData = allTrails.value.slice(startIndex, startIndex + itemsPerPage.value);
          
          // Only add the data if it's not already in visibleTrails and we're not just prefetching
          if (!prefetchOnly && startIndex >= visibleTrails.value.length) {
            visibleTrails.value = [...visibleTrails.value, ...pageData];
            addedNewItems = true;
          }
        } else {
          // Fetch this page from the API
          const { trails: pageTrails, totalCount: newTotalCount } = await apiService.getTrails(
            lastAppliedFilters.value,
            { page, pageSize: itemsPerPage.value }
          );
          
          // Update total count if it's changed
          if (newTotalCount !== totalTrailCount.value) {
            totalTrailCount.value = newTotalCount;
          }
          
          // Add to visible trails if not prefetching and needed
          if (!prefetchOnly && startIndex >= visibleTrails.value.length) {
            visibleTrails.value = [...visibleTrails.value, ...pageTrails];
            addedNewItems = true;
          }
          
          // Add to allTrails if needed (avoid duplicates)
          const newAllTrails = [...allTrails.value];
          for (let i = 0; i < pageTrails.length; i++) {
            const trailIndex = startIndex + i;
            const trail = pageTrails[i];
            // Ensure the trail is valid before adding it
            if (trail && trail.id) {
              if (trailIndex >= newAllTrails.length) {
                newAllTrails.push(trail);
              } else {
                newAllTrails[trailIndex] = trail;
              }
            }
          }
          allTrails.value = newAllTrails;
        }
        
        if (!prefetchOnly) {
          // Mark this page as fully loaded
          loadedPages.value.add(page);
        }
      }
      
      // Return whether we added new items to visible trails
      return addedNewItems;
    } catch (err) {
      console.error('Error loading page data:', err);
      throw err;
    } finally {
      if (!prefetchOnly) {
        isFetchingMore.value = false;
      }
    }
  };

  // Fetch trails with optional filters and options
  const fetchTrails = async (filters?: TrailFilters, options?: { 
    loadAll?: boolean,
    largePageSize?: boolean,
    bypassPagination?: boolean
  }): Promise<Trail[]> => {
    loading.value = true;
    error.value = null;
    lastAppliedFilters.value = filters;
    
    try {
      // Prepare options for API call with enhanced loading capabilities
      const apiOptions = { 
        page: 1, 
        pageSize: itemsPerPage.value, 
        loadAll: options?.loadAll || false,
        largePageSize: options?.largePageSize || false,
        bypassPagination: options?.bypassPagination || false
      };
      
      // Fetch trails from API with appropriate options
      const result = await apiService.getTrails(
        filters, 
        apiOptions
      );
      
      // Store total count for pagination calculations
      totalTrailCount.value = result.totalCount;
      
      // Reset pagination state
      currentPage.value = 1;
      loadedPages.value = new Set([1]);
      
      // Initialize visible trails with first page
      visibleTrails.value = result.trails;
      
      // Initialize all trails with what we've loaded so far
      allTrails.value = [...result.trails];
      
      // Prefetch next pages if there are more pages to load
      const pagesToPrefetch = [];
      for (let i = 2; i <= 1 + prefetchAmount.value; i++) {
        if (i <= Math.ceil(result.totalCount / itemsPerPage.value)) {
          pagesToPrefetch.push(i);
        }
      }
      
      if (pagesToPrefetch.length > 0) {
        await loadPageData(pagesToPrefetch);
      }
      
      return result.trails;
    } catch (err) {
      console.error('Error fetching trails:', err);
      error.value = 'Failed to fetch trails data.';
      allTrails.value = [];
      visibleTrails.value = [];
      totalTrailCount.value = 0;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch trail statistics (counts by category)
  const statistics = ref<TrailStatistics | null>(null);
  const fetchStatistics = async (): Promise<TrailStatistics> => {
    try {
      const result = await apiService.getTrailStatistics();
      statistics.value = result;
      return result;
    } catch (err) {
      console.error('Error fetching trail statistics:', err);
      throw err;
    }
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
  const searchTrails = async (query: string, limit?: number): Promise<Trail[]> => {
    // Ensure we have data to search
    if (allTrails.value.length === 0) {
      try {
        // Use loadAll: true to get all trails for search
        const result = await apiService.getTrails(undefined, { loadAll: true });
        if (result && Array.isArray(result.trails)) {
          allTrails.value = result.trails;
          totalTrailCount.value = result.totalCount;
        }
      } catch (err) {
        console.error('Error loading data for search:', err);
      }
    }
    
    // Local filtering using the full dataset
    const searchTerms = query.toLowerCase().split(' ');
    return allTrails.value.filter(trail => {
      const content = `${trail.name} ${trail.description || ''}`.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    }).slice(0, limit || allTrails.value.length);
  };

  // Get trail details by ID
  const getTrailDetails = async (trailId: string): Promise<Trail | undefined> => {
    try {
      return await apiService.getTrailById(trailId);
    } catch (err) {
      console.error('Error fetching trail details:', err);
      
      // Try to find trail in already loaded data
      if (allTrails.value.length) {
        return allTrails.value.find(trail => trail.id === trailId);
      }
      
      // If no trail found, throw error to be handled by the caller
      throw new Error('Failed to fetch trail details');
    }
  };

  return {
    // State
    trails: allTrails, // Maintain backward compatibility by exposing allTrails as trails
    regions,
    loading,
    error,
    isFetchingMore,
    statistics,
    
    // Pagination
    currentPage,
    itemsPerPage,
    paginatedTrails,
    totalPages,
    prefetchAmount,
    loadPageData,
    totalTrailCount,
    loadedPages,
    prefetchedPages,
    
    // Data fetching
    fetchTrails,
    fetchRegions,
    fetchStatistics,
    searchTrails,
    getTrailDetails
  };
}

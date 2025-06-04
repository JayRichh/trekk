import { ref } from 'vue';
import type { Trail, Region, TrailFilters, TrailStatistics } from '../types/trail';
import { apiService } from '../services/apiServiceFixed';

export function useTrailData() {
  const trails = ref<Trail[]>([]);
  const regions = ref<Region[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isFetchingMore = ref(false);
  const statistics = ref<TrailStatistics | null>(null);
  const totalTrailCount = ref(0);
  const currentPage = ref(0);
  const itemsPerPage = ref(20);
  const lastAppliedFilters = ref<TrailFilters | undefined>();
  const hasMoreTrails = ref(true);

  const loadMoreTrails = async (): Promise<boolean> => {
    if (isFetchingMore.value || !hasMoreTrails.value) {
      console.log('Skipping loadMoreTrails: isFetchingMore=', isFetchingMore.value, 'hasMoreTrails=', hasMoreTrails.value);
      return false;
    }
    
    isFetchingMore.value = true;
    console.log('Loading more trails from page', currentPage.value + 1);
    
    try {
      const nextPage = currentPage.value + 1;
      
      const result = await apiService.getTrails(
        lastAppliedFilters.value,
        { 
          page: nextPage, 
          pageSize: itemsPerPage.value
        }
      );
      
      totalTrailCount.value = result.totalCount;
      console.log(`Got ${result.trails.length} new trails, total count: ${totalTrailCount.value}`);
      
      // If we got no trails back, we've reached the end
      if (result.trails.length === 0) {
        hasMoreTrails.value = false;
        console.log('No more trails returned, reached the end');
        return false;
      }
      
      // Add the new trails to our existing trails array
      trails.value = [...trails.value, ...result.trails];
      currentPage.value = nextPage;
      
      // Check if we've reached the end
      const hasMore = trails.value.length < totalTrailCount.value;
      hasMoreTrails.value = hasMore;
      
      console.log(`Updated trails array to ${trails.value.length} items, hasMore=${hasMore}`);
      return hasMore;
    } catch (err) {
      console.error('Error loading more trails:', err);
      return false;
    } finally {
      isFetchingMore.value = false;
    }
  };

  const fetchTrails = async (filters?: TrailFilters, options?: { loadAll?: boolean }): Promise<Trail[]> => {
    loading.value = true;
    error.value = null;
    lastAppliedFilters.value = filters;
    
    try {
      // If loadAll is true, use a large pageSize to fetch all trails at once
      const pageSize = options?.loadAll ? 9999 : itemsPerPage.value;
      
      const result = await apiService.getTrails(
        filters, 
        { page: 0, pageSize }
      );
      
      totalTrailCount.value = result.totalCount;
      trails.value = result.trails;
      currentPage.value = 0;
      hasMoreTrails.value = trails.value.length < totalTrailCount.value;
      
      console.log(`Fetched ${trails.value.length} trails with loadAll=${options?.loadAll}`);
      
      return result.trails;
    } catch (err) {
      console.error('Error fetching trails:', err);
      error.value = 'Failed to fetch trails data.';
      trails.value = [];
      totalTrailCount.value = 0;
      hasMoreTrails.value = false;
      return [];
    } finally {
      loading.value = false;
    }
  };

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

  const searchTrails = async (query: string, limit?: number): Promise<Trail[]> => {
    if (!query.trim()) return [];
    
    if (trails.value.length === 0) {
      try {
        const result = await apiService.getTrails();
        if (result && Array.isArray(result.trails)) {
          trails.value = result.trails;
          totalTrailCount.value = result.totalCount;
        }
      } catch (err) {
        console.error('Error loading data for search:', err);
      }
    }
    
    const searchTerms = query.toLowerCase().split(' ');
    return trails.value.filter(trail => {
      const content = `${trail.name} ${trail.description || ''}`.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    }).slice(0, limit || 10);
  };

  const getTrailDetails = async (trailId: string): Promise<Trail | undefined> => {
    try {
      return await apiService.getTrailById(trailId);
    } catch (err) {
      console.error('Error fetching trail details:', err);
      
      if (trails.value.length) {
        return trails.value.find(trail => trail.id === trailId);
      }
      
      throw new Error('Failed to fetch trail details');
    }
  };

  return {
    trails,
    regions,
    loading,
    error,
    isFetchingMore,
    statistics,
    totalTrailCount,
    currentPage,
    itemsPerPage,
    hasMoreTrails,
    fetchTrails,
    fetchRegions,
    fetchStatistics,
    searchTrails,
    getTrailDetails,
    loadMoreTrails
  };
}

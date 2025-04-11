import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Trail, TrailFilters } from '../types/trail';
import { apiService } from '../services/apiService';

export const useTrailStore = defineStore('trail', () => {
  // State
  const trails = ref<Trail[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentTrail = ref<Trail | null>(null);
  
  // Filters
  const filters = ref<TrailFilters>({
    difficulty: '',
    length: '',
    elevation: '',
  });
  
  const searchQuery = ref('');
  
  // Getters
  const filteredTrails = computed(() => {
    return trails.value.filter(trail => {
      // Search filter
      if (searchQuery.value && 
          !trail.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
          !(trail.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)) {
        return false;
      }
      
      // Difficulty filter
      if (filters.value.difficulty && trail.difficulty !== filters.value.difficulty) {
        return false;
      }
      
      // Length filter
      if (filters.value.length) {
        if (filters.value.length === 'short' && trail.length >= 5) return false;
        if (filters.value.length === 'medium' && (trail.length < 5 || trail.length > 15)) return false;
        if (filters.value.length === 'long' && trail.length <= 15) return false;
      }
      
      // Elevation filter
      if (filters.value.elevation && trail.elevationGain !== undefined) {
        if (filters.value.elevation === 'low' && trail.elevationGain >= 500) return false;
        if (filters.value.elevation === 'medium' && (trail.elevationGain < 500 || trail.elevationGain > 1000)) return false;
        if (filters.value.elevation === 'high' && trail.elevationGain <= 1000) return false;
      }
      
      return true;
    });
  });
  
  // Actions
  async function fetchTrails() {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await apiService.getTrails();
      trails.value = result.trails;
    } catch (err) {
      console.error('Error fetching trails:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch trails';
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchTrailById(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      currentTrail.value = await apiService.getTrailById(id);
    } catch (err) {
      console.error(`Error fetching trail with id ${id}:`, err);
      error.value = err instanceof Error ? err.message : `Failed to fetch trail with id ${id}`;
    } finally {
      loading.value = false;
    }
  }
  
  function setFilters(newFilters: Partial<TrailFilters>) {
    filters.value = { ...filters.value, ...newFilters };
  }
  
  function resetFilters() {
    filters.value = {
      difficulty: '',
      length: '',
      elevation: '',
    };
    searchQuery.value = '';
  }
  
  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }
  
  // Initialize store with data
  function init() {
    fetchTrails();
  }
  
  return {
    // State
    trails,
    loading,
    error,
    currentTrail,
    filters,
    searchQuery,
    
    // Getters
    filteredTrails,
    
    // Actions
    fetchTrails,
    fetchTrailById,
    setFilters,
    resetFilters,
    setSearchQuery,
    init,
  };
});

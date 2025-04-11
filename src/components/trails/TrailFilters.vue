<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Filter header with toggle -->
    <div 
      @click="toggleFiltersVisible" 
      class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
    >
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" class="mr-2 text-primary">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1 -.293 .704l-6.414 6.414a1 1 0 0 0 -.293 .704v4.586l-4 -3v-1.586a1 1 0 0 0 -.293 -.704l-6.414 -6.414a1 1 0 0 1 -.293 -.704v-2.586z" />
        </svg>
        <span class="font-medium">Filters</span>
      </div>
      <div class="flex items-center">
        <span v-if="activeFiltersCount > 0" class="bg-accent text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
          {{ activeFiltersCount }}
        </span>
        <span class="text-xs text-gray-500 mr-2">
          {{ filteredTrailsCount }} 
          <template v-if="showingFilteredResults">of {{ displayTotalCount }}</template>
          trails
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="[filtersVisible ? 'transform rotate-180' : '', 'transition-transform duration-300']"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    
    <!-- Active filters summary -->
    <div 
      v-if="activeFiltersCount > 0" 
      class="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2 items-center"
    >
      <span class="text-xs text-gray-500">Active filters:</span>
      
      <div v-if="filters.difficulty" class="filter-pill">
        <span>{{ filters.difficulty }}</span>
        <button @click="clearFilter('difficulty')" class="ml-1 text-gray-400 hover:text-gray-600">×</button>
      </div>
      
      <div v-if="filters.length" class="filter-pill">
        <span>{{ formatLengthFilter(filters.length) }}</span>
        <button @click="clearFilter('length')" class="ml-1 text-gray-400 hover:text-gray-600">×</button>
      </div>
      
      <div v-if="filters.elevation" class="filter-pill">
        <span>{{ formatElevationFilter(filters.elevation) }}</span>
        <button @click="clearFilter('elevation')" class="ml-1 text-gray-400 hover:text-gray-600">×</button>
      </div>
      
      <div v-if="filters.region" class="filter-pill">
        <span>{{ getRegionName(filters.region) }}</span>
        <button @click="clearFilter('region')" class="ml-1 text-gray-400 hover:text-gray-600">×</button>
      </div>
      
      <button 
        @click="resetFilters" 
        class="ml-auto text-xs text-accent hover:text-accent-dark transition-colors"
      >
        Reset all
      </button>
    </div>
    
    <!-- Search bar -->
    <div class="p-4 border-b border-gray-200">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search trails..."
          class="form-input w-full py-2 pl-10 pr-4 text-base"
          @input="debouncedSearch"
        >
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z"/>
        </svg>
      </div>
    </div>
    
    <!-- Collapsible filters section -->
    <div 
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="[filtersVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0']"
    >
      <div class="p-4 space-y-4">
        <!-- Region filter -->
        <div class="form-group">
          <label for="region" class="form-label">Region</label>
          <select 
            id="region" 
            v-model="filters.region" 
            class="form-select"
            @change="updateFilters"
          >
            <option value="">All Regions</option>
            <option 
              v-for="region in regionsWithCounts" 
              :key="region.id" 
              :value="region.id"
            >
              {{ region.name }} ({{ region.trailCount || 0 }})
            </option>
          </select>
        </div>
        
        <!-- Difficulty filter -->
        <div class="form-group">
          <label for="difficulty" class="form-label">Difficulty</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="level in difficultyLevels" 
              :key="level.value"
              @click="selectDifficulty(level.value)"
              class="py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
              :class="filters.difficulty === level.value ? 
                'bg-accent text-white' : 
                'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              <span 
                class="w-2 h-2 rounded-full mr-2"
                :class="{
                  'bg-green-500': level.value === 'easy',
                  'bg-yellow-500': level.value === 'moderate',
                  'bg-orange-500': level.value === 'difficult',
                  'bg-red-500': level.value === 'extreme'
                }"
              ></span>
              {{ level.label }}
            </button>
          </div>
        </div>
        
        <!-- Length filter -->
        <div class="form-group">
          <label for="length" class="form-label">Length</label>
          <select 
            id="length" 
            v-model="filters.length" 
            class="form-select"
            @change="updateFilters"
          >
            <option value="">Any distance</option>
            <option value="0-5">Short (< 5km)</option>
            <option value="5-15">Medium (5-15km)</option>
            <option value="15-30">Long (15-30km)</option>
            <option value="30-100">Very Long (> 30km)</option>
          </select>
        </div>
        
        <!-- Elevation filter -->
        <div class="form-group">
          <label for="elevation" class="form-label">Elevation Gain</label>
          <select 
            id="elevation" 
            v-model="filters.elevation" 
            class="form-select"
            @change="updateFilters"
          >
            <option value="">Any elevation</option>
            <option value="0-500">Low (< 500m)</option>
            <option value="500-1000">Medium (500-1000m)</option>
            <option value="1000-2000">High (1000-2000m)</option>
            <option value="2000-5000">Very High (> 2000m)</option>
          </select>
        </div>
        
        <!-- Max results -->
        <div class="form-group">
          <label for="maxResults" class="form-label">Max Results</label>
          <div class="relative">
            <select 
              v-if="!isEditingMaxResults" 
              id="maxResults" 
              v-model="maxResults" 
              class="form-select"
              @dblclick="enableMaxResultsEdit"
              @change="updateMaxResults"
            >
              <option value="9999">All Trails</option>
              <option value="10">10 Trails</option>
              <option value="30">30 Trails</option>
              <option value="50">50 Trails</option>
              <option value="100">100 Trails</option>
              <option value="custom">Custom...</option>
            </select>
            <input 
              v-else
              type="number" 
              v-model="customMaxResults" 
              min="1"
              max="500"
              class="form-input w-full py-2"
              @blur="saveCustomMaxResults"
              @keyup.enter="saveCustomMaxResults"
              ref="maxResultsInput"
              @keypress="validateNumberInput"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- View options -->
    <div class="p-4 border-t border-gray-200">
      <!-- View mode label -->
      <div class="mb-3 text-sm font-medium text-text-muted">View Options</div>
      
      <!-- View mode section -->
      <div class="space-y-3">
        <!-- View mode buttons -->
        <div class="flex flex-wrap gap-2">
          <button 
            @click="$emit('update:view-mode', 'grid')" 
            class="btn btn-sm flex items-center gap-1.5"
            :class="viewMode === 'grid' ? 'btn-accent' : 'btn-ghost'"
            title="Grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm-12 6h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm-12 6h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
            </svg>
            <span>Grid</span>
          </button>
          <button 
            @click="$emit('update:view-mode', 'list')" 
            class="btn btn-sm flex items-center gap-1.5"
            :class="viewMode === 'list' ? 'btn-accent' : 'btn-ghost'"
            title="List view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h11M9 12h11M9 19h11M5 5v.01M5 12v.01M5 19v.01"/>
            </svg>
            <span>List</span>
          </button>
          <button 
            @click="$emit('update:view-mode', 'map')" 
            class="btn btn-sm flex items-center gap-1.5"
            :class="viewMode === 'map' ? 'btn-accent' : 'btn-ghost'"
            title="Map view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13M9 4v13M15 7v13"/>
            </svg>
            <span>Map</span>
          </button>
        </div>
        
        <!-- Grouping options -->
        <div>
          <div class="text-xs text-text-muted mb-1.5">Group By:</div>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="$emit('update:group-by', 'none')" 
              class="btn btn-sm"
              :class="groupBy === 'none' ? 'btn-accent' : 'btn-ghost'"
            >
              No Grouping
            </button>
            <button 
              @click="$emit('update:group-by', 'region')" 
              class="btn btn-sm"
              :class="groupBy === 'region' ? 'btn-accent' : 'btn-ghost'"
            >
              By Region
            </button>
            <button 
              @click="$emit('update:group-by', 'difficulty')" 
              class="btn btn-sm"
              :class="groupBy === 'difficulty' ? 'btn-accent' : 'btn-ghost'"
            >
              By Difficulty
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Trail, Region, TrailStatistics } from '@/types/trail';
import { useTrailData } from '@/composables/useTrailData';

const props = defineProps<{
  trails: Trail[];
  regions: Region[];
  filteredTrailsCount: number;
  viewMode: 'grid' | 'list' | 'map';
  groupBy: 'none' | 'region' | 'difficulty';
  totalTrailsCount?: number;
}>();

// Get trail statistics for accurate counts
const { fetchStatistics } = useTrailData();
const trailStats = ref<TrailStatistics | null>(null);

// Fetch statistics on component mount
onMounted(async () => {
  try {
    trailStats.value = await fetchStatistics();
  } catch (error) {
    console.error("Error fetching trail statistics:", error);
  }
});

const emit = defineEmits<{
  (e: 'update:filters', filters: { difficulty: string, length: string, elevation: string, region: string }): void;
  (e: 'update:search-query', query: string): void;
  (e: 'update:max-results', value: number): void;
  (e: 'update:view-mode', mode: 'grid' | 'list' | 'map'): void;
  (e: 'update:group-by', groupBy: 'none' | 'region' | 'difficulty'): void;
  (e: 'reset-filters'): void;
}>();

// Filter state
const filtersVisible = ref(true);
const searchQuery = ref('');
const searchDebounceTimeout = ref<number | null>(null);
const filters = ref({
  difficulty: '',
  length: '',
  elevation: '',
  region: '',
});

// Max results configuration
const maxResults = ref<string | number>("9999");
const customMaxResults = ref<string | number>("9999");
const isEditingMaxResults = ref(false);
const maxResultsInput = ref<HTMLInputElement | null>(null);

// Difficulty levels for buttons
const difficultyLevels = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'difficult', label: 'Difficult' },
  { value: 'extreme', label: 'Extreme' }
];

// Toggle filters visibility
const toggleFiltersVisible = () => {
  filtersVisible.value = !filtersVisible.value;
  // Save preference to localStorage
  try {
    localStorage.setItem('trekk-filters-visible', filtersVisible.value.toString());
  } catch (e) {
    console.warn('Could not save filter preference to localStorage', e);
  }
};

// Load saved preference on mount
onMounted(() => {
  try {
    const savedPreference = localStorage.getItem('trekk-filters-visible');
    if (savedPreference !== null) {
      filtersVisible.value = savedPreference === 'true';
    }
  } catch (e) {
    console.warn('Could not load filter preference from localStorage', e);
  }
});

// Count active filters
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.difficulty) count++;
  if (filters.value.length) count++;
  if (filters.value.elevation) count++;
  if (filters.value.region) count++;
  return count;
});

// Computed property to determine if we're showing filtered results
const showingFilteredResults = computed(() => {
  return activeFiltersCount.value > 0 || searchQuery.value.trim() !== '';
});

// Total count to display (from prop or statistics)
const displayTotalCount = computed(() => {
  // Use the prop first if available
  if (props.totalTrailsCount !== undefined) {
    return props.totalTrailsCount;
  }
  // Otherwise use the statistics count if available
  if (trailStats.value?.totalCount) {
    return trailStats.value.totalCount;
  }
  // Otherwise fallback to the filtered count
  return props.filteredTrailsCount;
});

// Format length filter for display
const formatLengthFilter = (lengthFilter: string) => {
  switch (lengthFilter) {
    case '0-5': return 'Under 5km';
    case '5-15': return '5-15km';
    case '15-30': return '15-30km';
    case '30-100': return 'Over 30km';
    default: return lengthFilter;
  }
};

// Format elevation filter for display
const formatElevationFilter = (elevationFilter: string) => {
  switch (elevationFilter) {
    case '0-500': return 'Under 500m';
    case '500-1000': return '500-1000m';
    case '1000-2000': return '1000-2000m';
    case '2000-5000': return 'Over 2000m';
    default: return elevationFilter;
  }
};

// Get region name from ID
const getRegionName = (regionId: string) => {
  const region = props.regions.find(r => r.id === regionId);
  return region ? region.name : regionId;
};

// Clear a specific filter
const clearFilter = (filterName: 'difficulty' | 'length' | 'elevation' | 'region') => {
  filters.value[filterName] = '';
  updateFilters();
};

// Reset all filters
const resetFilters = () => {
  filters.value = {
    difficulty: '',
    length: '',
    elevation: '',
    region: '',
  };
  searchQuery.value = '';
  emit('update:search-query', '');
  emit('reset-filters');
  updateFilters();
};

// Update filters
const updateFilters = () => {
  emit('update:filters', { ...filters.value });
};

// Select difficulty
const selectDifficulty = (difficulty: string) => {
  filters.value.difficulty = filters.value.difficulty === difficulty ? '' : difficulty;
  updateFilters();
};

// Debounced search
const debouncedSearch = () => {
  if (searchDebounceTimeout.value !== null) {
    clearTimeout(searchDebounceTimeout.value);
  }
  
  searchDebounceTimeout.value = window.setTimeout(() => {
    emit('update:search-query', searchQuery.value);
    searchDebounceTimeout.value = null;
  }, 300);
};

// Function to enable direct editing of max results
const enableMaxResultsEdit = () => {
  isEditingMaxResults.value = true;
  customMaxResults.value = maxResults.value;
  // Focus the input after it's rendered
  setTimeout(() => {
    if (maxResultsInput.value) {
      maxResultsInput.value.focus();
      maxResultsInput.value.select();
    }
  }, 50);
};

// Save custom max results
const saveCustomMaxResults = () => {
  // Basic sanitization
  let cleanValue = customMaxResults.value.toString().replace(/[^0-9]/g, '');
  
  // Parse to number and enforce min/max
  let numValue = parseInt(cleanValue);
  if (isNaN(numValue) || numValue < 1) numValue = 10;
  if (numValue > 500) numValue = 500;
  
  // Update values
  maxResults.value = numValue;
  customMaxResults.value = numValue;
  isEditingMaxResults.value = false;
  
  // Emit the change to parent component
  updateMaxResults();
};

// Update max results
const updateMaxResults = () => {
  const value = typeof maxResults.value === 'string' 
    ? parseInt(maxResults.value, 10) 
    : maxResults.value;
  
  if (!isNaN(value)) {
    emit('update:max-results', value);
  }
};

// Validate input to only allow numbers
const validateNumberInput = (e: KeyboardEvent) => {
  const charCode = e.which ? e.which : e.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    e.preventDefault();
  }
};

// Create region options with counts using statistics
const regionsWithCounts = computed(() => {
  // If we have statistics, use those counts for more accuracy
  if (trailStats.value) {
    const countsByRegionId: Record<string, number> = {};
    
    // Convert statistics to a lookup map by region ID
    trailStats.value.byRegion.forEach(regionStat => {
      countsByRegionId[regionStat.id] = regionStat.count;
    });
    
    // Apply stats to region objects
    return props.regions.map(region => ({
      ...region,
      trailCount: countsByRegionId[region.id] || 0
    }));
  } else {
    // Fallback to calculating from loaded trails if stats aren't available
    const counts: Record<string, number> = {};
    
    props.trails.forEach(trail => {
      if (trail.region && trail.region.length > 0) {
        trail.region.forEach(regionName => {
          const region = props.regions.find(r => r.name === regionName);
          if (region) {
            counts[region.id] = (counts[region.id] || 0) + 1;
          }
        });
      }
    });
    
    // Add counts to regions
    return props.regions.map(region => ({
      ...region,
      trailCount: counts[region.id] || 0
    }));
  }
});

// Watch for changes to maxResults dropdown
watch(maxResults, (newValue) => {
  if (newValue === 'custom') {
    enableMaxResultsEdit();
  }
});
</script>

<style scoped>
.filter-pill {
  @apply bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-full flex items-center;
}
</style>

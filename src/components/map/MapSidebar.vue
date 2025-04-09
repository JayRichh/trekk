<template>
  <div 
    class="absolute top-0 left-0 bottom-0 bg-surface shadow-lg transform transition-all duration-300 ease-in-out z-10"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'w-full md:w-[350px]'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Header with toggle button -->
      <div class="flex justify-between items-center px-4 py-3 border-b border-border">
        <h2 class="font-medium text-primary">Discover Trails</h2>
        <div class="relative group">
          <button 
        @click="$emit('update:is-open', false)"
        class="btn-icon btn-ghost rounded-md transition-transform duration-200 transform group-hover:translate-x-1"
        aria-label="Close sidebar"
          >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
          </button>
          <div 
        class="absolute top-1/2 -translate-y-1/2 left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
        Close Sidebar
          </div>
        </div>

      </div>
      
      <!-- Search & Essential Filters -->
      <div class="p-4 border-b border-border">
        <!-- Search Bar (always visible) -->
        <div class="mb-3 relative">
          <div class="flex items-center">
            <input 
              type="text"
              placeholder="Search trails..."
              class="form-input pr-10"
              v-model="searchQueryInput"
              @keyup.enter="applySearchQuery"
            />
            <button 
              @click="applySearchQuery"
              class="absolute right-2 p-1 text-gray-500 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Max Results Setting (always visible) -->
        
        <!-- MORE FILTERS Toggle Header -->
        <div 
          @click="toggleFiltersVisible" 
          class="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 mb-2 relative group"
        >
          <span class="font-medium text-sm">FILTERS</span>
          <div class="flex items-center">
            <span class="text-xs text-gray-500 mr-2">{{ filteredTrails.length }} trails</span>
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
          
          <!-- Tooltip -->
          <div class="absolute right-0 top-full mt-1 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            {{ filtersVisible ? 'Hide filters' : 'Show filters' }}
          </div>
        </div>
    
    <!-- Collapsible Filters Section -->
    <div 
    class="overflow-hidden transition-all duration-300 ease-in-out"
    :class="[filtersVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0']"
    :style="{ marginBottom: filtersVisible ? '1rem' : '0' }"
    >
    <div class="space-y-3">
      <div class="form-group">
              <div class="mb-3">
                <label class="form-label">Max Results</label>
                <div class="relative">
                  <select 
                    v-if="!isEditingMaxResults" 
                    id="maxResults" 
                    v-model="maxResults" 
                    class="form-select"
                    @dblclick="enableMaxResultsEdit"
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
                    class="form-input w-full"
                    @blur="saveCustomMaxResults"
                    @keyup.enter="saveCustomMaxResults"
                    ref="maxResultsInput"
                    @keypress="validateNumberInput"
                  />
                </div>
              </div>
              <label class="form-label">Region</label>
              <select 
                class="form-select"
                v-model="selectedRegion"
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
            
            <div class="form-group">
              <label class="form-label">Difficulty</label>
              <select 
                class="form-select"
                v-model="selectedDifficulty"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Length</label>
              <select 
                class="form-select"
                v-model="selectedLength"
              >
                <option value="">Any Length</option>
                <option value="0-5">Under 5km</option>
                <option value="5-15">5-15km</option>
                <option value="15-30">15-30km</option>
                <option value="30-100">Over 30km</option>
              </select>
            </div>
            
            <button 
              @click="$emit('reset-filters')"
              class="btn btn-ghost w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      <!-- View Toggle -->
      <div class="flex justify-between items-center px-4 py-2 border-b border-border">
        <div class="flex space-x-2">
          <button 
            @click="groupByRegion = false" 
            class="px-2 py-1 text-xs rounded transition-colors"
            :class="!groupByRegion ? 'bg-accent text-white' : 'bg-wash-slate text-text hover:bg-gray-200'"
          >
            List
          </button>
          <button 
            @click="groupByRegion = true" 
            class="px-2 py-1 text-xs rounded transition-colors"
            :class="groupByRegion ? 'bg-accent text-white' : 'bg-wash-slate text-text hover:bg-gray-200'"
          >
            By Region
          </button>
        </div>
      </div>
      
      <!-- Trails List -->
      <div class="flex-1 overflow-y-auto p-2" ref="trailsListContainer" @scroll="handleScroll">
        <div v-if="loading && !isFetchingMore" class="flex justify-center p-4">
          <div class="loading-spinner"></div>
        </div>
        
        <div v-else-if="filteredTrails.length === 0" class="flex flex-col items-center justify-center p-4 text-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No trails match your filters</p>
        </div>
        
        <!-- Grouped by region view -->
        <div v-else-if="groupByRegion" class="space-y-4">
          <div v-for="group in trailsByRegion" :key="group.regionName" class="space-y-2">
            <h3 class="sticky top-0 bg-wash-slate px-3 py-1 font-medium text-sm rounded">
              {{ group.regionName }} ({{ group.trails.length }})
            </h3>
            <TrailCard 
              v-for="trail in group.trails.slice(0, visibleItemsCount)" 
              :key="trail.id"
              :trail="trail"
              :is-selected="selectedTrailIndex !== null && trails[selectedTrailIndex]?.id === trail.id"
              @click="$emit('select-trail', trail, trails.findIndex(t => t.id === trail.id))"
              @view-details="$emit('view-trail-details', trail.id)"
              @fly-to="$emit('fly-to-trail', trail)"
            />
          </div>
        </div>
        
        <!-- List view with dynamic loading -->
        <div v-else>
          <div class="space-y-2">
            <TrailCard 
              v-for="trail in visibleTrails" 
              :key="trail.id"
              :trail="trail"
              :is-selected="selectedTrailIndex !== null && trails[selectedTrailIndex]?.id === trail.id"
              @click="$emit('select-trail', trail, trails.findIndex(t => t.id === trail.id))"
              @view-details="$emit('view-trail-details', trail.id)"
              @fly-to="$emit('fly-to-trail', trail)"
            />
          </div>
          
          <!-- Loading indicator at bottom -->
          <div v-if="isFetchingMore" class="flex justify-center py-4">
            <div class="load-more-indicator">
              <svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading more trails...
            </div>
          </div>
          
          <!-- End of list indicator -->
          <div v-if="visibleTrails.length === filteredTrails.length && filteredTrails.length > 5 && !isFetchingMore" class="end-of-results">
            End of results
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, watch } from 'vue';
import type { Trail, Region } from '@/types/trail';
import TrailCard from './TrailCard.vue';
import { useTrailData } from '@/composables/useTrailData';

// Props
const props = defineProps<{
  trails: Trail[];
  regions: Region[];
  loading: boolean;
  isOpen: boolean;
  selectedTrailIndex: number | null;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:is-open', value: boolean): void;
  (e: 'select-trail', trail: Trail, index: number): void;
  (e: 'fly-to-trail', trail: Trail): void;
  (e: 'view-trail-details', trailId: string): void;
  (e: 'reset-filters'): void;
  (e: 'update-max-results', value: number): void;
  (e: 'update-filters', filters: { region: string, difficulty: string, length: string }): void;
  (e: 'update-search-query', query: string): void;
}>();

// Filter and pagination state
const searchQueryInput = ref(''); // Input field value
const searchQuery = ref(''); // Actual search query used for filtering
const searchDebounceTimeout = ref<number | null>(null);
const filtersVisible = ref(false); // Toggle for collapsible filters section

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

// Apply search query from input
const applySearchQuery = () => {
  searchQuery.value = searchQueryInput.value;
  
  // Force re-render of map markers by emitting an update
  if (typeof maxResults.value === 'number') {
    emit('update-max-results', maxResults.value);
  }
  
  // Also update filters to ensure map is refreshed
  emit('update-filters', {
    region: selectedRegion.value,
    difficulty: selectedDifficulty.value,
    length: selectedLength.value
  });
};

// Debounced search with delay
const debouncedSearch = (value: string) => {
  // Clear any existing timeout
  if (searchDebounceTimeout.value !== null) {
    clearTimeout(searchDebounceTimeout.value);
  }
  
  // Set a new timeout
  searchDebounceTimeout.value = window.setTimeout(() => {
    searchQuery.value = value;
    searchDebounceTimeout.value = null;
  }, 500); // 500ms delay
};

// Watch for changes to the search input with debounce
watch(searchQueryInput, (newValue) => {
  debouncedSearch(newValue);
});

// Watch for changes to the search query and emit to parent
watch(searchQuery, (newValue) => {
  emit('update-search-query', newValue);
});
const selectedRegion = ref('');
const selectedDifficulty = ref('');
const selectedLength = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const initialLoadCount = ref(10); // Initial number of items to load
const incrementalLoadCount = ref(5); // Number of additional items to load on scroll
const visibleItemsCount = ref(initialLoadCount.value); // Currently visible items
const groupByRegion = ref(false); // Default to list view for better dynamic loading
const maxVisiblePages = 5; // Maximum number of page buttons to show
const isFetchingMore = ref(false);
const trailsListContainer = ref<HTMLElement | null>(null);
const loadThreshold = 200; // Pixels from bottom to trigger loading more

// Max results configuration
const maxResults = ref<string | number>(9999); // Default to effectively infinite
const customMaxResults = ref<string | number>(9999);
const isEditingMaxResults = ref(false);
const maxResultsInput = ref<HTMLInputElement | null>(null);

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
  emit('update-max-results', numValue);
  
  // Also update filters to ensure map is refreshed
  emit('update-filters', {
    region: selectedRegion.value,
    difficulty: selectedDifficulty.value,
    length: selectedLength.value
  });
};

// Validate input to only allow numbers
const validateNumberInput = (e: KeyboardEvent) => {
  const charCode = e.which ? e.which : e.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    e.preventDefault();
  }
};

// Dynamic loading - visible trails
const visibleTrails = computed(() => {
  return filteredTrails.value.slice(0, visibleItemsCount.value);
});

// Scroll handler for infinite scrolling
const handleScroll = () => {
  if (!trailsListContainer.value || isFetchingMore.value) return;
  
  const container = trailsListContainer.value;
  const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  
  // If the user is near the bottom or at the bottom, load more items
  if (scrollBottom < loadThreshold && visibleItemsCount.value < filteredTrails.value.length) {
    loadMoreItems();
  } else if (scrollBottom === 0 && visibleItemsCount.value < filteredTrails.value.length) {
    // Exactly at the bottom - ensure we load more immediately
    loadMoreItems();
  }
};

// Load more items function
const loadMoreItems = async () => {
  isFetchingMore.value = true;
  
  // Simulate network delay for smoother UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate how many more items to load
  const newItemsCount = Math.min(
    visibleItemsCount.value + incrementalLoadCount.value,
    filteredTrails.value.length
  );
  
  visibleItemsCount.value = newItemsCount;
  isFetchingMore.value = false;
};

// Reset visible items count when filters change
watchEffect(() => {
  // When filters change, reset the visible items count
  if (searchQuery.value || selectedRegion.value || selectedDifficulty.value || selectedLength.value) {
    visibleItemsCount.value = initialLoadCount.value;
  }
});

// Make sure filters are applied reactively
watch([searchQuery, selectedRegion, selectedDifficulty, selectedLength], () => {
  // Reset to initial load count when any filter changes
  visibleItemsCount.value = initialLoadCount.value;
  
  // Emit the max results to parent if needed
  if (typeof maxResults.value === 'number') {
    emit('update-max-results', maxResults.value);
  }
  
  // Update the parent component's filters
  emit('update-filters', {
    region: selectedRegion.value,
    difficulty: selectedDifficulty.value,
    length: selectedLength.value
  });
}, { immediate: true });

// Helper function to determine which page numbers to show
const getVisiblePageNumbers = () => {
  if (totalPages.value <= maxVisiblePages) {
    // If we have fewer pages than the max, show all of them
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  // Calculate the range to display
  const rangeStart = Math.max(
    1,
    Math.min(
      currentPage.value - Math.floor(maxVisiblePages / 2),
      totalPages.value - maxVisiblePages + 1
    )
  );
  
  const rangeEnd = Math.min(rangeStart + maxVisiblePages - 1, totalPages.value);
  
  // Generate the array of page numbers
  return Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, i) => rangeStart + i
  );
};

// Helper function to get region IDs from region names
const getRegionIds = (regionNames: string[] | undefined) => {
  if (!regionNames || regionNames.length === 0) return [];
  
  return regionNames.map(name => {
    const region = props.regions.find(r => r.name === name);
    return region ? region.id : null;
  }).filter(id => id !== null) as string[];
};

// First, compute region counts from all trails
const allRegionCounts = computed(() => {
  const counts: Record<string, number> = {};
  
  props.trails.forEach(trail => {
    if (trail.region && trail.region.length > 0) {
      const regionIds = getRegionIds(trail.region);
      regionIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
    }
  });
  
  return counts;
});

// Create region options with counts
const regionsWithCounts = computed(() => {
  return props.regions.map(region => ({
    ...region,
    trailCount: allRegionCounts.value[region.id] || 0
  }));
});

// First filter trails based on search query and selected filters
const filteredBySearchAndCategories = computed(() => {
  return props.trails.filter(trail => {
    // Search query filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const nameMatch = trail.name.toLowerCase().includes(query);
      const descMatch = trail.description ? trail.description.toLowerCase().includes(query) : false;
      if (!nameMatch && !descMatch) return false;
    }
    
    // Region filter
    if (selectedRegion.value && selectedRegion.value.trim() !== '') {
      // Convert trail regions to region IDs
      const trailRegionIds = getRegionIds(trail.region);
      // Check if the selected region ID is in the trail's region IDs
      if (!trailRegionIds.includes(selectedRegion.value)) {
        return false;
      }
    }
    
    // Difficulty filter
    if (selectedDifficulty.value && selectedDifficulty.value.trim() !== '' && 
        trail.difficulty !== selectedDifficulty.value) {
      return false;
    }
    
    // Length filter
    if (selectedLength.value && selectedLength.value.trim() !== '') {
      const parts = selectedLength.value.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.length < min || trail.length > max) {
        return false;
      }
    }
    
    return true;
  });
});

// Then apply max results limit to the filtered trails
const filteredTrails = computed(() => {
  // Convert maxResults to a number
  const maxResultsNum = typeof maxResults.value === 'string' 
    ? parseInt(maxResults.value, 10) 
    : maxResults.value;
  
  // Apply the max results limit if it's a valid number
  if (!isNaN(maxResultsNum) && maxResultsNum > 0) {
    return filteredBySearchAndCategories.value.slice(0, maxResultsNum);
  }
  
  // Otherwise return all filtered trails
  return filteredBySearchAndCategories.value;
});

// Organize trails by region for grouped view
const trailsByRegion = computed(() => {
  const grouped: Record<string, { regionName: string, trails: Trail[] }> = {};
  
  // First pass: create groups
  filteredTrails.value.forEach(trail => {
    if (trail.region && trail.region.length > 0) {
      trail.region.forEach(regionName => {
        if (!grouped[regionName]) {
          grouped[regionName] = {
            regionName,
            trails: []
          };
        }
        grouped[regionName].trails.push(trail);
      });
    } else {
      // For trails without region
      if (!grouped['Other']) {
        grouped['Other'] = {
          regionName: 'Other',
          trails: []
        };
      }
      grouped['Other'].trails.push(trail);
    }
  });
  
  // Convert to array and sort by region name
  return Object.values(grouped).sort((a, b) => a.regionName.localeCompare(b.regionName));
});

// Paginated trails (for flat view)
const paginatedTrails = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredTrails.value.slice(startIndex, endIndex);
});

// Total number of pages
const totalPages = computed(() => {
  return Math.ceil(filteredTrails.value.length / itemsPerPage.value);
});

// Function to handle page changes
function changePage(page: number) {
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  currentPage.value = page;
}

// Reset filters when trails change
watchEffect(() => {
  if (props.trails.length) {
    // Reset pagination when filter changes
    currentPage.value = 1;
    
    // Keep filters but reset index if needed
    if (props.selectedTrailIndex !== null && props.selectedTrailIndex >= filteredTrails.value.length) {
      // Would emit an update here if needed
    }
  }
});

// Watch for changes to maxResults dropdown
watch(maxResults, (newValue: string | number) => {
  if (newValue === 'custom') {
    enableMaxResultsEdit();
  }
});
</script>

<template>
  <div class="py-8">
    <div class="container mx-auto px-4">
      <!-- Hero Header with Background -->
      <div class="relative mb-8 rounded-xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80 z-10"></div>
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1551632811-561732d1e306'); filter: brightness(0.7);"></div>
        <div class="relative z-20 py-12 px-6 text-white">
          <h1 class="text-4xl font-bold mb-2">Discover Trails</h1>
          <p class="text-lg max-w-2xl opacity-90">Find your next adventure from our collection of hiking trails</p>
          
          <!-- Stats Bar -->
          <div class="flex flex-wrap gap-6 mt-6">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="mr-2 text-white">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
              </svg>
              <div>
                <div class="text-2xl font-semibold">{{ trails.length }}</div>
                <div class="text-xs opacity-80">Total Trails</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="mr-2 text-white">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 13.5V12l-9.5 -7L3 12v1.5m18 0l-9.5 7L3 13.5m18 0v7.5h-18v-7.5"/>
              </svg>
              <div>
                <div class="text-2xl font-semibold">{{ regions.length }}</div>
                <div class="text-xs opacity-80">Regions</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="mr-2 text-white">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12L12 7M12 12L16 14"/>
              </svg>
              <div>
                <div class="text-2xl font-semibold">{{ totalDistance.toFixed(0) }}</div>
                <div class="text-xs opacity-80">Total km</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area with Filters and Trails -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters Column -->
        <div class="lg:w-1/3 xl:w-1/4">
          <TrailFilters
            :trails="trails"
            :regions="regions"
            :filtered-trails-count="filteredTrails.length"
            :view-mode="viewMode"
            :group-by="groupBy"
            @update:filters="updateFilters"
            @update:search-query="updateSearchQuery"
            @update:max-results="updateMaxResults"
            @update:view-mode="viewMode = $event"
            @update:group-by="groupBy = $event"
            @reset-filters="resetFilters"
          />
        </div>
        
        <!-- Trails Display Column -->
        <div class="lg:w-2/3 xl:w-3/4">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-text-muted">
            <LoadingSpinner :loading="loading" :show-progress="true" class="mb-4" />
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredTrails.length === 0" class="text-center py-8 text-text-muted flex flex-col items-center bg-white rounded-lg shadow-md p-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" class="mb-4 text-text-light opacity-60">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.5 14.5L3 9l2.5-4.5L12 7l1-4.5L19.5 7l2-3.5.5 7-4.5 3M7 13l4.5 4.5L16 17M9 17l1.5 3.5L12 19l1.5 3L15 17"/>
            </svg>
            <p class="mb-4">No trails found matching your filters.</p>
            <button @click="resetFilters" class="btn btn-accent">Reset Filters</button>
          </div>
          
          <!-- Map View -->
          <div v-else-if="viewMode === 'map'" class="mb-6">
            <TrailMapView 
              :trails="filteredTrails"
              :selected-trail-id="selectedTrailId"
              @select-trail="selectTrail"
              @view-details="viewTrailDetails"
            />
          </div>
          
          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" ref="trailsContainer">
            <!-- No Grouping -->
            <div v-if="groupBy === 'none'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <TrailGridCard 
                v-for="trail in visibleTrails" 
                :key="trail.id"
                :trail="trail"
                :is-selected="selectedTrailId === trail.id"
                @click="selectTrail(trail.id)"
                @view-details="viewTrailDetails(trail.id)"
                @view-on-map="viewOnMap(trail.id)"
              />
            </div>
            
            <!-- Group by Region -->
            <div v-else-if="groupBy === 'region'" class="space-y-8">
              <div v-for="group in trailsByRegion" :key="group.regionName" class="space-y-4">
                <div class="sticky top-0 z-10 bg-background py-2">
                  <h2 class="text-xl font-semibold flex items-center">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-md">{{ group.regionName }}</span>
                    <span class="ml-2 text-sm text-text-light">({{ group.trails.length }} trails)</span>
                  </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <TrailGridCard 
                    v-for="trail in group.trails.slice(0, visibleItemsCount)" 
                    :key="trail.id"
                    :trail="trail"
                    :is-selected="selectedTrailId === trail.id"
                    @click="selectTrail(trail.id)"
                    @view-details="viewTrailDetails(trail.id)"
                    @view-on-map="viewOnMap(trail.id)"
                  />
                </div>
              </div>
            </div>
            
            <!-- Group by Difficulty -->
            <div v-else-if="groupBy === 'difficulty'" class="space-y-8">
              <div v-for="group in trailsByDifficulty" :key="group.difficulty" class="space-y-4">
                <div class="sticky top-0 z-10 bg-background py-2">
                  <h2 class="text-xl font-semibold flex items-center">
                    <span 
                      class="px-3 py-1 rounded-md"
                      :class="{
                        'bg-green-100 text-green-800': group.difficulty === 'easy',
                        'bg-yellow-100 text-yellow-800': group.difficulty === 'moderate',
                        'bg-orange-100 text-orange-800': group.difficulty === 'difficult',
                        'bg-red-100 text-red-800': group.difficulty === 'extreme',
                        'bg-gray-100 text-gray-800': !group.difficulty
                      }"
                    >
                      {{ group.difficulty || 'Unspecified' }}
                    </span>
                    <span class="ml-2 text-sm text-text-light">({{ group.trails.length }} trails)</span>
                  </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <TrailGridCard 
                    v-for="trail in group.trails.slice(0, visibleItemsCount)" 
                    :key="trail.id"
                    :trail="trail"
                    :is-selected="selectedTrailId === trail.id"
                    @click="selectTrail(trail.id)"
                    @view-details="viewTrailDetails(trail.id)"
                    @view-on-map="viewOnMap(trail.id)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- List View -->
          <div v-else-if="viewMode === 'list'" ref="trailsContainer">
            <!-- No Grouping -->
            <div v-if="groupBy === 'none'" class="space-y-3">
              <TrailListCard 
                v-for="trail in visibleTrails" 
                :key="trail.id"
                :trail="trail"
                :is-selected="selectedTrailId === trail.id"
                @click="selectTrail(trail.id)"
                @view-details="viewTrailDetails(trail.id)"
                @view-on-map="viewOnMap(trail.id)"
              />
            </div>
            
            <!-- Group by Region -->
            <div v-else-if="groupBy === 'region'" class="space-y-8">
              <div v-for="group in trailsByRegion" :key="group.regionName" class="space-y-4">
                <div class="sticky top-0 z-10 bg-background py-2">
                  <h2 class="text-xl font-semibold flex items-center">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-md">{{ group.regionName }}</span>
                    <span class="ml-2 text-sm text-text-light">({{ group.trails.length }} trails)</span>
                  </h2>
                </div>
                <div class="space-y-3">
                  <TrailListCard 
                    v-for="trail in group.trails.slice(0, visibleItemsCount)" 
                    :key="trail.id"
                    :trail="trail"
                    :is-selected="selectedTrailId === trail.id"
                    @click="selectTrail(trail.id)"
                    @view-details="viewTrailDetails(trail.id)"
                    @view-on-map="viewOnMap(trail.id)"
                  />
                </div>
              </div>
            </div>
            
            <!-- Group by Difficulty -->
            <div v-else-if="groupBy === 'difficulty'" class="space-y-8">
              <div v-for="group in trailsByDifficulty" :key="group.difficulty" class="space-y-4">
                <div class="sticky top-0 z-10 bg-background py-2">
                  <h2 class="text-xl font-semibold flex items-center">
                    <span 
                      class="px-3 py-1 rounded-md"
                      :class="{
                        'bg-green-100 text-green-800': group.difficulty === 'easy',
                        'bg-yellow-100 text-yellow-800': group.difficulty === 'moderate',
                        'bg-orange-100 text-orange-800': group.difficulty === 'difficult',
                        'bg-red-100 text-red-800': group.difficulty === 'extreme',
                        'bg-gray-100 text-gray-800': !group.difficulty
                      }"
                    >
                      {{ group.difficulty || 'Unspecified' }}
                    </span>
                    <span class="ml-2 text-sm text-text-light">({{ group.trails.length }} trails)</span>
                  </h2>
                </div>
                <div class="space-y-3">
                  <TrailListCard 
                    v-for="trail in group.trails.slice(0, visibleItemsCount)" 
                    :key="trail.id"
                    :trail="trail"
                    :is-selected="selectedTrailId === trail.id"
                    @click="selectTrail(trail.id)"
                    @view-details="viewTrailDetails(trail.id)"
                    @view-on-map="viewOnMap(trail.id)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading indicator for pagination -->
          <div v-if="isFetchingMore" class="mt-6 flex justify-center py-4">
            <div class="flex items-center text-text-muted">
              <svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading more trails...
            </div>
          </div>
          
          <!-- Load more button -->
          <div v-if="visibleTrails.length < filteredTrails.length && !isFetchingMore" class="mt-8 text-center">
            <button 
              @click="loadMoreItems()" 
              class="btn btn-outline mx-auto"
            >
              Load More
            </button>
          </div>
          
          <!-- End of results message -->
          <div v-if="visibleTrails.length === filteredTrails.length && filteredTrails.length > initialLoadCount" class="mt-6 text-center text-text-muted text-sm py-2">
            End of results
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Trail, Region } from '@/types/trail';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import { useTrailData } from '@/composables/useTrailData';
import TrailFilters from '@/components/trails/TrailFilters.vue';
import TrailGridCard from '@/components/trails/TrailGridCard.vue';
import TrailListCard from '@/components/trails/TrailListCard.vue';
import TrailMapView from '@/components/trails/TrailMapView.vue';

const router = useRouter();
const loading = ref(true);
const searchQuery = ref('');
const filters = reactive({
  difficulty: '',
  length: '',
  elevation: '',
  region: '',
});

// View state
const viewMode = ref<'grid' | 'list' | 'map'>('grid');
const groupBy = ref<'none' | 'region' | 'difficulty'>('none');
const selectedTrailId = ref<string | null>(null);

// Pagination state
const { 
  fetchTrails, 
  fetchRegions, 
  currentPage, 
  itemsPerPage, 
  totalPages, 
  paginatedTrails: composablePaginatedTrails,
  isFetchingMore,
  loadPageData
} = useTrailData();

// Trail data state
const trails = ref<Trail[]>([]);
const regions = ref<Region[]>([]);
const maxVisiblePages = 5; // Maximum number of page buttons to show
const initialLoadCount = ref(12); // Initial number of items to load
const incrementalLoadCount = ref(6); // Number of additional items to load on scroll
const visibleItemsCount = ref(initialLoadCount.value); // Currently visible items
const trailsContainer = ref<HTMLElement | null>(null);
const loadThreshold = 300; // Pixels from bottom to trigger loading more

// Max results configuration
const maxResults = ref<string | number>("9999");
const customMaxResults = ref<string | number>("9999");

// Calculate total distance of all trails
const totalDistance = computed(() => {
  return trails.value.reduce((total, trail) => total + trail.length, 0);
});

// Using window scroll event for more reliable infinite scrolling
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Scroll handler for infinite scrolling
const handleScroll = () => {
  if (!trailsContainer.value || isFetchingMore.value) return;
  
  const container = trailsContainer.value;
  const scrollBottom = window.innerHeight + window.scrollY;
  const containerBottom = container.offsetTop + container.offsetHeight;
  
  if (scrollBottom >= containerBottom - loadThreshold && visibleItemsCount.value < filteredTrails.value.length) {
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
watch([filters, searchQuery], () => {
  // When filters change, reset the visible items count
  visibleItemsCount.value = initialLoadCount.value;
}, { deep: true });

// Fetch trails and regions from API service with optimistic loading
onMounted(async () => {
  loading.value = true;
  
  try {
    // Fetch regions first for the filter dropdown
    regions.value = await fetchRegions();
    
    // Then fetch trails with a limit to improve initial load time
    const trailsData = await fetchTrails({ maxTrails: Number(maxResults.value) }); 
    trails.value = trailsData;
  } catch (error) {
    console.error('Failed to load trails:', error);
  } finally {
    loading.value = false;
  }
});

// Reset pagination when filters or search query changes
watch([filters, searchQuery], () => {
  currentPage.value = 1;
}, { deep: true });

// Filtered trails based on search and filters
const filteredTrails = computed(() => {
  return trails.value.filter(trail => {
    // Search filter
    if (searchQuery.value) {
      const nameMatch = trail.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      const descMatch = trail.description ? trail.description.toLowerCase().includes(searchQuery.value.toLowerCase()) : false;
      if (!nameMatch && !descMatch) return false;
    }
    
    // Difficulty filter
    if (filters.difficulty && trail.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Length filter
    if (filters.length) {
      const parts = filters.length.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.length < min || trail.length > max) {
        return false;
      }
    }
    
    // Elevation filter
    if (filters.elevation && trail.elevationGain !== undefined) {
      const parts = filters.elevation.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.elevationGain < min || trail.elevationGain > max) {
        return false;
      }
    }
    
    // Region filter
    if (filters.region && filters.region.trim() !== '') {
      // Check if the trail belongs to the selected region
      if (!trail.region || !trail.region.some(r => {
        const region = regions.value.find(reg => reg.id === filters.region);
        return region && r === region.name;
      })) {
        return false;
      }
    }
    
    return true;
  });
});

// Dynamic loading - visible trails
const visibleTrails = computed(() => {
  return filteredTrails.value.slice(0, visibleItemsCount.value);
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

// Organize trails by difficulty for grouped view
const trailsByDifficulty = computed(() => {
  const grouped: Record<string, { difficulty: string, trails: Trail[] }> = {
    'easy': { difficulty: 'easy', trails: [] },
    'moderate': { difficulty: 'moderate', trails: [] },
    'difficult': { difficulty: 'difficult', trails: [] },
    'extreme': { difficulty: 'extreme', trails: [] },
    'other': { difficulty: '', trails: [] }
  };
  
  // Group trails by difficulty
  filteredTrails.value.forEach(trail => {
    if (trail.difficulty && grouped[trail.difficulty]) {
      grouped[trail.difficulty]?.trails.push(trail);
    } else {
      grouped['other']?.trails.push(trail);
    }
  });
  
  // Convert to array and filter out empty groups
  return Object.values(grouped)
    .filter(group => group.trails.length > 0)
    .sort((a, b) => {
      // Custom sort order: easy, moderate, difficult, extreme, other
      const order: Record<string, number> = { 'easy': 1, 'moderate': 2, 'difficult': 3, 'extreme': 4, '': 5 };
      return (order[a.difficulty] || 5) - (order[b.difficulty] || 5);
    });
});

// Calculate average rating
const getAverageRating = (trail: Trail): string => {
  if (!trail.reviews || trail.reviews.length === 0) return 'N/A';
  
  const sum = trail.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / trail.reviews.length).toFixed(1);
};

// Select a trail
const selectTrail = (trailId: string) => {
  selectedTrailId.value = selectedTrailId.value === trailId ? null : trailId;
};

// Navigate to trail details
const viewTrailDetails = (trailId: string) => {
  router.push(`/trails/${trailId}`);
};

// View trail on map
const viewOnMap = (trailId: string) => {
  viewMode.value = 'map';
  selectedTrailId.value = trailId;
};

// Update filters from filter panel
const updateFilters = (newFilters: { difficulty: string, length: string, elevation: string, region: string }) => {
  filters.difficulty = newFilters.difficulty;
  filters.length = newFilters.length;
  filters.elevation = newFilters.elevation;
  filters.region = newFilters.region;
};

// Update search query from filter panel
const updateSearchQuery = (query: string) => {
  searchQuery.value = query;
};

// Update max results when changed from filter panel
const updateMaxResults = (value: number) => {
  maxResults.value = value;
  
  // Refresh with new max results
  if (trails.value.length > 0) {
    fetchTrails({ maxTrails: value });
  }
};

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  filters.difficulty = '';
  filters.length = '';
  filters.elevation = '';
  filters.region = '';
};
</script>

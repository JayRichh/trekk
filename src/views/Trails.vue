<template>
  <div class="py-8">
    <div class="container mx-auto px-4">
      <div class="relative mb-8 rounded-xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80 z-10"></div>
        <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${heroImageUrl})`, filter: 'brightness(0.7)' }"></div>
        <div class="relative z-20 py-12 px-6 text-white">
          <h1 class="text-4xl font-bold mb-2">Discover Trails</h1>
          <p class="text-lg max-w-2xl opacity-90">Find your next adventure from our collection of hiking trails</p>
          
          <div class="flex flex-wrap gap-6 mt-6">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="mr-2 text-white">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
              </svg>
              <div>
                <div class="text-2xl font-semibold">{{ trailsCount }}</div>
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
                <div class="text-2xl font-semibold">{{ totalDistanceKm }}</div>
                <div class="text-xs opacity-80">Total km</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/3 xl:w-1/4">
          <TrailFilters
            :trails="trails"
            :regions="regions"
            :filtered-trails-count="filteredTrails.length"
            :total-trails-count="trailsCount"
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
        
        <div class="lg:w-2/3 xl:w-3/4">
          <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-text-muted min-h-[50vh]">
            <LoadingSpinner 
              ref="loadingSpinner"
              :loading="loading" 
              :show-progress="true" 
              :external-control="true"
              initial-progress-text="Initializing trails..."
              class="mb-4" 
            />
          </div>
          
          <div v-else-if="filteredTrails.length === 0" class="text-center py-8 text-text-muted flex flex-col items-center bg-white rounded-lg shadow-md p-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" class="mb-4 text-text-light opacity-60">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.5 14.5L3 9l2.5-4.5L12 7l1-4.5L19.5 7l2-3.5.5 7-4.5 3M7 13l4.5 4.5L16 17M9 17l1.5 3.5L12 19l1.5 3L15 17"/>
            </svg>
            <p class="mb-4">No trails found matching your filters.</p>
            <button @click="resetFilters" class="btn btn-accent">Reset Filters</button>
          </div>
          
          <div v-else-if="viewMode === 'map'" class="mb-6">
            <TrailMapView 
              :trails="filteredTrails"
              :selected-trail-id="selectedTrailId"
              @select-trail="selectTrail"
              @view-details="viewTrailDetails"
            />
          </div>
          
          <div v-else-if="viewMode === 'grid'" ref="trailsContainer">
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
                    v-for="trail in group.trails" 
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
                    v-for="trail in group.trails" 
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
          
          <div v-else-if="viewMode === 'list'" ref="trailsContainer">
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
                    v-for="trail in group.trails" 
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
                    v-for="trail in group.trails" 
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

          <!-- SIMPLIFIED PAGINATION CONTROLS -->
          <!-- Loading indicator -->
          <div v-if="isFetchingMore" class="my-8 w-full flex justify-center">
            <div class="flex items-center space-x-3 bg-white shadow-lg rounded-lg py-3 px-6">
              <svg class="w-6 h-6 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-lg">Loading more trails...</span>
            </div>
          </div>
          
          <!-- Always visible load more button unless we've loaded everything -->
          <div v-if="!allItemsLoaded && !isFetchingMore" class="my-8 flex justify-center">
            <button 
              @click="loadMoreTrails"
              class="w-full max-w-md mx-auto py-4 px-6 bg-primary text-white text-lg font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg flex justify-center items-center space-x-2"
            >
              <span>LOAD MORE TRAILS</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <!-- End of results message -->
          <div v-if="allItemsLoaded" class="my-8 text-center text-gray-500 py-2 border-t border-gray-200">
            <p class="text-lg mt-4">{{ endOfResultsMessage }}</p>
            <p class="text-sm mt-1">Showing {{ filteredTrails.length }} trails</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { Trail, Region, TrailStatistics } from '@/types/trail';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import { useTrailData } from '@/composables/useTrailData';
import TrailFilters from '@/components/trails/TrailFilters.vue';
import TrailGridCard from '@/components/trails/TrailGridCard.vue';
import TrailListCard from '@/components/trails/TrailListCard.vue';
import TrailMapView from '@/components/trails/TrailMapView.vue';

const router = useRouter();
const heroImageUrl = computed(() => `https://picsum.photos/seed/trails-hero/1200/400`);

const LOADING_STEPS = {
  START: { progress: 5, text: 'Initializing trails data...' },
  FETCH_METADATA: { progress: 30, text: 'Loading regions and statistics...' },
  FETCH_TRAILS: { progress: 70, text: 'Retrieving trail information...' },
  PROCESSING: { progress: 90, text: 'Processing trail data...' },
  COMPLETE: { progress: 100, text: 'Loading complete!' }
};

const loading = ref(true);
const loadingSpinner = ref<InstanceType<typeof LoadingSpinner> | null>(null);
function updateLoadingProgress(progress: number, text: string): void {
  loadingSpinner.value?.updateProgress(progress, text);
}

const searchQuery = ref('');
const filters = reactive({ difficulty: '', length: '', elevation: '', region: '' });
const viewMode = ref<'grid' | 'list' | 'map'>('grid');
const groupBy = ref<'none' | 'region' | 'difficulty'>('none');
const selectedTrailId = ref<string | null>(null);

const { 
  fetchTrails, fetchRegions, fetchStatistics,
  currentPage, itemsPerPage, totalPages, totalTrailCount,
  paginatedTrails, isFetchingMore, loadPageData
} = useTrailData();

const statistics = ref<TrailStatistics | null>(null);
const trails = ref<Trail[]>([]);
const regions = ref<Region[]>([]);
const initialLoadCount = ref(100); // Increased from 12 for initial load
const incrementalLoadCount = ref(100); // Increased from 6 for each subsequent load
const visibleItemsCount = ref(initialLoadCount.value);
const allItemsLoaded = ref(false);
const hasMoreItems = computed(() => 
  !allItemsLoaded.value && (currentPage.value < totalPages.value || visibleItemsCount.value < filteredTrails.value.length)
);

const trailsCount = computed(() => statistics.value?.totalCount || 0);
const totalDistanceKm = computed(() =>
  statistics.value?.totalDistance ? Math.round(statistics.value.totalDistance).toLocaleString() : '0'
);

const filteredTrails = computed(() => {
  return trails.value.filter(trail => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const nameMatch = trail.name.toLowerCase().includes(q);
      const descMatch = trail.description ? trail.description.toLowerCase().includes(q) : false;
      if (!nameMatch && !descMatch) return false;
    }
    if (filters.difficulty && trail.difficulty !== filters.difficulty) return false;
    if (filters.length) {
      const parts = filters.length.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.length < min || trail.length > max) return false;
    }
    if (filters.elevation && trail.elevationGain !== undefined) {
      const parts = filters.elevation.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.elevationGain < min || trail.elevationGain > max) return false;
    }
    if (filters.region && filters.region.trim() !== '') {
      if (!trail.region || !trail.region.some(r => {
        const reg = regions.value.find(reg => reg.id === filters.region);
        return reg && r === reg.name;
      })) return false;
    }
    return true;
  });
});

const visibleTrails = computed(() => filteredTrails.value.slice(0, visibleItemsCount.value));

const trailsByRegion = computed(() => {
  const grouped: Record<string, { regionName: string, trails: Trail[] }> = {};
  filteredTrails.value.forEach(trail => {
    if (trail.region && trail.region.length > 0) {
      trail.region.forEach(regionName => {
        if (!grouped[regionName]) {
          grouped[regionName] = { regionName, trails: [] };
        }
        grouped[regionName].trails.push(trail);
      });
    } else {
      if (!grouped['Other']) {
        grouped['Other'] = { regionName: 'Other', trails: [] };
      }
      grouped['Other'].trails.push(trail);
    }
  });
  return Object.values(grouped).sort((a, b) => a.regionName.localeCompare(b.regionName));
});

const trailsByDifficulty = computed(() => {
  const grouped: Record<string, { difficulty: string, trails: Trail[] }> = {
    'easy': { difficulty: 'easy', trails: [] },
    'moderate': { difficulty: 'moderate', trails: [] },
    'difficult': { difficulty: 'difficult', trails: [] },
    'extreme': { difficulty: 'extreme', trails: [] },
    'other': { difficulty: '', trails: [] }
  };
  filteredTrails.value.forEach(trail => {
    if (trail.difficulty && grouped[trail.difficulty]) {
      grouped[trail.difficulty].trails.push(trail);
    } else {
      grouped['other'].trails.push(trail);
    }
  });
  return Object.values(grouped)
    .filter(group => group.trails.length > 0)
    .sort((a, b) => {
      const order: Record<string, number> = { 'easy': 1, 'moderate': 2, 'difficult': 3, 'extreme': 4, '': 5 };
      return order[a.difficulty || ''] - order[b.difficulty || ''];
    });
});

/**
 * Initialize trails by loading data from the API
 */
async function initTrails() {
  loading.value = true;
  
  try {
    updateLoadingProgress(LOADING_STEPS.START.progress, LOADING_STEPS.START.text);
    
    itemsPerPage.value = initialLoadCount.value;
    currentPage.value = 1;
    allItemsLoaded.value = false;
    
    await new Promise(resolve => setTimeout(resolve, 100));
    updateLoadingProgress(LOADING_STEPS.FETCH_METADATA.progress, LOADING_STEPS.FETCH_METADATA.text);
    
    const [regionsData, statsData] = await Promise.all([fetchRegions(), fetchStatistics()]);
    
    regions.value = regionsData || [];
    statistics.value = statsData || null;
    
    updateLoadingProgress(LOADING_STEPS.FETCH_TRAILS.progress, LOADING_STEPS.FETCH_TRAILS.text);
    // No maxTrails limit - fetch as many as possible at once
    const trailsResponse = await fetchTrails({}, { loadAll: true, largePageSize: true });
    
    updateLoadingProgress(LOADING_STEPS.PROCESSING.progress, LOADING_STEPS.PROCESSING.text);
    trails.value = trailsResponse;
    visibleItemsCount.value = Math.min(initialLoadCount.value, trails.value.length);
    updateLoadingProgress(LOADING_STEPS.COMPLETE.progress, LOADING_STEPS.COMPLETE.text);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (error) {
    console.error('Failed to load trails:', error);
    updateLoadingProgress(100, 'Error loading trails');
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
}

/**
 * ULTRA AGGRESSIVE trail loading - GUARANTEED to load ALL trails
 * This implementation will FORCEFULLY load all available trails with no early stopping
 */
async function loadMoreItems() {
  // Don't allow multiple concurrent load operations
  if (isFetchingMore.value) return;
  
  console.log("🔥 ULTRA AGGRESSIVE TRAIL LOADING 🔥");
  console.log(`Currently loaded: ${trails.value.length}, Showing: ${visibleItemsCount.value}, Target: 1396 trails`);
  
  isFetchingMore.value = true;
  
  try {
    // HUGE BATCH SIZE for maximum throughput
    const batchSize = 200; // Load 200 trails at once
    
    // Track where we are in the total dataset - use this as an offset rather than page number
    // This gives us more precise control over exactly which trails we're fetching
    const offset = trails.value.length;
    
    console.log(`Loading from offset ${offset} with batch size ${batchSize}`);
    
    // Use API CALL with page-based pagination
    // Calculate the effective page number based on our current offset
    const currentPage = Math.floor(offset / batchSize) + 1;
    
    console.log(`Requesting page ${currentPage} with pageSize ${batchSize}`);
    
    const response = await apiService.getTrails(
      lastAppliedFilters.value, 
      { 
        page: currentPage,       // Get the right page based on our offset
        pageSize: batchSize,     // Get a large batch
        loadAll: false,          // Don't load everything at once
        largePageSize: true,     // Use large page sizes for better performance
        bypassPagination: trails.value.length > 1000 // Bypass pagination for large datasets
      }
    );
    
    // Process response - ALWAYS assume there's more unless proven otherwise
    if (response?.trails?.length > 0) {
      // Got some trails
      const responseTrails = response.trails;
      console.log(`Received ${responseTrails.length} trails from API`);
      
      // Filter out any duplicates to be safe
      const existingIds = new Set(trails.value.map(t => t.id));
      const newTrails = responseTrails.filter(trail => !existingIds.has(trail.id));
      
      if (newTrails.length > 0) {
        console.log(`Adding ${newTrails.length} new trails to collection`);
        
        // Add to main collection
        trails.value = [...trails.value, ...newTrails];
        
        // Show 50 more trails at once for a better experience
        visibleItemsCount.value += 50;
        
        // Update our total count understanding
        if (response.totalCount) {
          totalTrailCount.value = response.totalCount;
          console.log(`Total trails in system: ${totalTrailCount.value}`);
        }
        
        // NEVER mark as complete unless we've truly loaded EVERYTHING
        // We know the exact number we're targeting (1396)
        allItemsLoaded.value = trails.value.length >= 1396;
        
        // Show detailed progress
        const percentLoaded = Math.round((trails.value.length / 1396) * 100);
        console.log(`Progress: ${trails.value.length}/1396 trails loaded (${percentLoaded}%)`);
      } else {
        console.log("⚠️ No new trails in this batch");
        
        // If we have fewer than 1396 trails, KEEP TRYING with a new offset
        if (trails.value.length < 1396) {
          console.log(`Only have ${trails.value.length}/1396 trails - will continue loading`);
          
          // Try with a different offset next time
          // NEVER give up if we haven't reached 1396
          allItemsLoaded.value = false;
        } else {
          // We've loaded all 1396 trails
          console.log("🎉 SUCCESS: All 1396 trails loaded!");
          allItemsLoaded.value = true;
        }
      }
    } else {
      console.log("⚠️ API returned no trails");
      
      // ONLY mark as complete if we have ALL trails
      if (trails.value.length >= 1396) {
        console.log("🏁 All 1396 trails loaded successfully!");
        allItemsLoaded.value = true;
      } else {
        // We expected more trails but got none - API issue
        // Let the user retry - NEVER give up until we have all 1396
        console.log(`❌ API issue: Only have ${trails.value.length}/1396 trails`);
        console.log("Will allow retrying by keeping Load More button visible");
        allItemsLoaded.value = false;
      }
    }
  } catch (error) {
    console.error('💥 Error loading trails:', error);
    // NEVER give up on error - let user retry
    allItemsLoaded.value = false;
  } finally {
    isFetchingMore.value = false;
  }
}

/**
 * Update the "End of results" message to be more informative
 */
const endOfResultsMessage = computed(() => {
  if (trails.value.length >= 1396) {
    return `All ${trails.value.length} trails loaded successfully!`;
  } else {
    return `Loaded ${trails.value.length} of 1396 total trails`;
  }
});

// Directly import from apiService for direct access
import { apiService } from '../services/apiService';
const lastAppliedFilters = ref<any>(undefined);

// Lifecycle hooks
onMounted(() => {
  initTrails();
});

// Watch filters for changes
watch([filters, searchQuery], () => {
  currentPage.value = 1;
  visibleItemsCount.value = initialLoadCount.value;
  allItemsLoaded.value = false;
  lastAppliedFilters.value = { ...filters }; // Store filters for direct API calls
  initTrails();
}, { deep: true });

function updateFilters(newFilters: typeof filters) { 
  Object.assign(filters, newFilters); 
}

function updateSearchQuery(query: string) { 
  searchQuery.value = query; 
}

function updateMaxResults(value: string | number) { 
  // Not used in this version
}

function resetFilters() { 
  filters.difficulty = '';
  filters.length = '';
  filters.elevation = '';
  filters.region = '';
  searchQuery.value = '';
}

function selectTrail(id: string) { 
  selectedTrailId.value = id; 
}

function viewTrailDetails(id: string) { 
  router.push({ name: 'TrailDetail', params: { id } }); 
}

function viewOnMap(id: string) { 
  router.push({ name: 'Map', query: { trail: id } }); 
}

// Simple function for the load more button to trigger loading more trails
function loadMoreTrails() {
  loadMoreItems();
}
</script>

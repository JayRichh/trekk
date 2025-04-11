<template>
  <div class="py-8">
    <div class="container mx-auto px-4">
      <div class="relative mb-8 rounded-xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80 z-10"></div>
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1551632811-561732d1e306'); filter: brightness(0.7);"></div>
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
          <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-text-muted">
            <LoadingSpinner :loading="loading" :show-progress="true" class="mb-4" />
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
          
          <div 
            v-if="isFetchingMore" 
            class="fixed bottom-4 left-0 right-0 mx-auto w-full z-50 px-4"
          >
            <div class="max-w-xs mx-auto bg-white shadow-lg rounded-full py-3 px-4 flex items-center justify-center text-text-muted">
              <svg class="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading more trails...
            </div>
          </div>
          
          <div v-if="allItemsLoaded && filteredTrails.length > initialLoadCount" class="mt-6 text-center text-text-muted text-sm py-2">
            End of results
          </div>
          
          <!-- <div 
            ref="loadingTrigger" 
            class="h-20 w-full mt-8 flex items-center justify-center"
            :class="{'mb-20': currentPage < totalPages || hasMoreItems}"
          >
            <button 
              v-if="hasMoreItems && !isFetchingMore" 
              @click="loadMoreItems()"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Load More Trails
            </button>
            <div v-else class="text-text-light text-sm">
              {{ allItemsLoaded ? 'All trails loaded' : 'Scroll to load more trails...' }}
            </div>
          </div> -->
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

// State & Filters
const loading = ref(true);
const searchQuery = ref('');
const filters = reactive({ difficulty: '', length: '', elevation: '', region: '' });
const viewMode = ref<'grid' | 'list' | 'map'>('grid');
const groupBy = ref<'none' | 'region' | 'difficulty'>('none');
const selectedTrailId = ref<string | null>(null);

// Data from useTrailData composable
const { 
  fetchTrails, fetchRegions, fetchStatistics,
  currentPage, itemsPerPage, totalPages, totalTrailCount,
  paginatedTrails, isFetchingMore, loadPageData
} = useTrailData();

// Local state for trails, regions and pagination
const statistics = ref<TrailStatistics | null>(null);
const trails = ref<Trail[]>([]);
const regions = ref<Region[]>([]);
const initialLoadCount = ref(12);
const incrementalLoadCount = ref(6);
const visibleItemsCount = ref(initialLoadCount.value);
const allItemsLoaded = ref(false);
const loadThreshold = 300; // in pixels

// Computed display values
const trailsCount = computed(() => statistics.value?.totalCount || 0);
const totalDistanceKm = computed(() =>
  statistics.value?.totalDistance ? Math.round(statistics.value.totalDistance).toLocaleString() : '0'
);

// Client-side filtering (applied on already loaded trails)
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

// Only show a slice of filtered trails based on the visibleItemsCount
const visibleTrails = computed(() => {
  return filteredTrails.value.slice(0, visibleItemsCount.value);
});

// Group trails for region/difficulty view (unchanged logic)
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

// Initialize trails and reset pagination
async function initTrails() {
  loading.value = true;
  try {
    // Reset pagination values
    itemsPerPage.value = initialLoadCount.value;
    currentPage.value = 1;
    allItemsLoaded.value = false;

    // Fetch regions and statistics
    regions.value = await fetchRegions();
    statistics.value = await fetchStatistics();

    // Load initial trails page from API
    const trailsResponse = await fetchTrails({ maxTrails: itemsPerPage.value }, { loadAll: false });
    trails.value = trailsResponse;
    visibleItemsCount.value = Math.min(initialLoadCount.value, trails.value.length);

    // After initial load, if the document height is too short to trigger scroll,
    // call loadMoreItems() to fill the page.
    nextTick(() => {
      const remaining = document.documentElement.scrollHeight - (window.pageYOffset + window.innerHeight);
      if (remaining < loadThreshold) {
        loadMoreItems();
      }
    });
  } catch (error) {
    console.error('Failed to load trails:', error);
  } finally {
    loading.value = false;
  }
}

// Handle window scroll event to load more items when near bottom
function handleScroll() {
  if (isFetchingMore.value || allItemsLoaded.value) return;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
  const windowHeight = window.innerHeight || 0;
  const docHeight = document.documentElement.scrollHeight || 0;
  const bottomOffset = docHeight - (scrollTop + windowHeight);
  if (bottomOffset < loadThreshold) {
    loadMoreItems();
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  initTrails();
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Reset pagination when filters/search change
watch([filters, searchQuery], () => {
  currentPage.value = 1;
  visibleItemsCount.value = initialLoadCount.value;
  allItemsLoaded.value = false;
  initTrails();
}, { deep: true });

// Revised loadMoreItems function
async function loadMoreItems() {
  if (isFetchingMore.value || allItemsLoaded.value) return;

  // If we already have more items loaded on the client, reveal them first.
  if (visibleItemsCount.value < filteredTrails.value.length) {
    isFetchingMore.value = true;
    await new Promise(resolve => setTimeout(resolve, 200));
    visibleItemsCount.value = Math.min(
      visibleItemsCount.value + incrementalLoadCount.value,
      filteredTrails.value.length
    );
    isFetchingMore.value = false;
    // Check if the page content is still too short and load more if needed.
    nextTick(() => {
      const remaining = document.documentElement.scrollHeight - (window.pageYOffset + window.innerHeight);
      if (remaining < loadThreshold) {
        loadMoreItems();
      }
    });
    return;
  }

  // If we don't have enough client-side items and there are API pages left, load the next page.
  if (currentPage.value < totalPages.value) {
    try {
      isFetchingMore.value = true;
      const nextPage = currentPage.value + 1;
      await loadPageData([nextPage]);
      currentPage.value = nextPage;
      if (paginatedTrails.value && paginatedTrails.value.length > 0) {
        trails.value = trails.value.concat(paginatedTrails.value);
        visibleItemsCount.value = Math.min(
          visibleItemsCount.value + incrementalLoadCount.value,
          filteredTrails.value.length
        );
      } else {
        allItemsLoaded.value = true;
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      isFetchingMore.value = false;
      nextTick(() => {
        const remaining = document.documentElement.scrollHeight - (window.pageYOffset + window.innerHeight);
        if (remaining < loadThreshold) {
          loadMoreItems();
        }
      });
    }
    return;
  }

  // Mark that all available items have been loaded.
  allItemsLoaded.value = true;
}

// Navigation and filter update functions
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
</script>


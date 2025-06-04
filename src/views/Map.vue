<template>
  <div class="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
    <!-- Map Container - Full width and height absolute positioning -->
    <div 
      ref="mapContainer" 
      class="absolute inset-0 w-full h-full transition-all duration-300 bg-surface shadow-inner"
    ></div>
    
    <!-- Sidebar -->
    <MapSidebar
      :trails="trails"
      :regions="regions"
      :loading="isContentLoading"
      :is-open="isSidebarOpen"
      :selected-trail-index="selectedTrailIndex"
      @update:is-open="isSidebarOpen = $event"
      @select-trail="selectTrail"
      @fly-to-trail="flyToTrail"
      @view-trail-details="viewTrailDetails"
      @reset-filters="resetFilters"
      @update-max-results="updateMaxResults"
      @update-filters="updateFilters"
      @update-search-query="updateSearchQuery"
    />
    
    <!-- Sidebar Toggle Button (visible when sidebar is closed) -->
    <button 
      v-if="!isSidebarOpen"
      @click="isSidebarOpen = true"
      class="absolute top-4 left-16 z-20 bg-surface p-2 rounded-md shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center"
      aria-label="Open sidebar"
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
        <path d="M9 18l6-6-6-6" />
      </svg>
      <span class="ml-2 text-sm font-medium">Show Trails</span>
    </button>
    
    <!-- Map Controls -->
    <MapControls
      :current-view-mode="currentViewMode"
      :is-sidebar-open="isSidebarOpen"
      @set-view-mode="setViewMode"
      @toggle-layer="toggleLayer"
      @reset-view="resetMapView"
    />
    
    <!-- Trail Info Panel -->
    <TrailInfoPanel
      :trail="selectedTrail"
      :is-sidebar-open="isSidebarOpen"
      @close="selectedTrail = null"
    />
    
    <!-- Content-specific loading spinner -->
    <div v-if="isContentLoading" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <LoadingSpinner 
          ref="loadingSpinnerRef"
          :loading="isContentLoading" 
          :show-progress="true"
          :external-control="true"
          initial-progress-text="Initializing map..." 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxFetcher } from '@/composables/useMapboxFetcher';
import { useTrailData } from '@/composables/useTrailData';
import { getMapboxToken } from '@/lib/mapTokenHelper';
import type { Trail, Region } from '@/types/trail';

// Component imports
import MapSidebar from '@/components/map/MapSidebar.vue';
import MapControls from '@/components/map/MapControls.vue';
import TrailInfoPanel from '@/components/map/TrailInfoPanel.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();

// Map and sidebar state
const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;
const isSidebarOpen = ref(true);
const searchQuery = ref('');
const isContentLoading = ref(false); // Renamed to avoid conflict with global loading
const selectedTrail = ref<Trail | null>(null);
const selectedTrailIndex = ref<number | null>(null);
const maxResults = ref<number>(9999); // Load all trails without practical limit

// Filters
const filters = ref({
  region: '',
  difficulty: '',
  length: '',
});

// Fetch trail data using the composable
const { trails, fetchTrails, fetchRegions } = useTrailData();
const { getMapboxExamples } = useMapboxFetcher();
const regions = ref<Region[]>([]);

// Current view mode
const currentViewMode = ref('3d-terrain');

// Define loading steps with progress percentages
const LOADING_STEPS = {
  START: { progress: 5, text: 'Initializing map...' },
  LOAD_TERRAIN: { progress: 25, text: 'Loading terrain data...' },
  FETCH_DATA: { progress: 50, text: 'Fetching trail data...' },
  RENDER_MAP: { progress: 75, text: 'Rendering map...' },
  COMPLETE: { progress: 100, text: 'Map ready!' }
};

// Ref for loading spinner
const loadingSpinnerRef = ref<InstanceType<typeof LoadingSpinner> | null>(null);

// Helper function for safely updating content loading progress
function updateContentProgress(progress: number, text: string): void {
  if (loadingSpinnerRef.value && isContentLoading.value) {
    loadingSpinnerRef.value.updateProgress(progress, text);
  }
}

// Initialization - Runs after RouterViewWrapper completes its loading
onMounted(async () => {
  try {
    // Fetch trails and regions data
    isContentLoading.value = true;
    
    // Start - 5%
    updateContentProgress(LOADING_STEPS.START.progress, LOADING_STEPS.START.text);
    
    // Start map initialization concurrently with data loading
    updateContentProgress(LOADING_STEPS.LOAD_TERRAIN.progress, LOADING_STEPS.LOAD_TERRAIN.text);
    
    // Initialize the map
    initMap();
    
    // Fetch data - 50%
    updateContentProgress(LOADING_STEPS.FETCH_DATA.progress, LOADING_STEPS.FETCH_DATA.text);
    
    // Start data loading
    const dataPromise = loadInitialData();
    
    // Wait for data to be loaded
    await dataPromise;
    
    // Render map - 75%
    updateContentProgress(LOADING_STEPS.RENDER_MAP.progress, LOADING_STEPS.RENDER_MAP.text);
    
    // Check for trail ID in query parameters (coming from TrailDetail view)
    const trailId = route.query.trail as string;
    if (trailId && trails.value.length > 0) {
      const trailToSelect = trails.value.find(t => t.id === trailId);
      if (trailToSelect) {
        // Wait a bit for the map to fully initialize
        setTimeout(() => {
          selectTrail(trailToSelect, trails.value.indexOf(trailToSelect));
        }, 500);
      }
    }
    
    // Complete - 100%
    updateContentProgress(LOADING_STEPS.COMPLETE.progress, LOADING_STEPS.COMPLETE.text);
    
  } catch (error) {
    console.error('Error initializing map view:', error);
    // Show error in loading spinner
    updateContentProgress(100, 'Error loading map');
  } finally {
    // Ensure loading is set to false even if there was an error
    setTimeout(() => {
      isContentLoading.value = false;
    }, 500); // Small delay to ensure smooth transition
  }
});

// Clean up
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Watch for changes in filters, search query, and maxResults
watch([searchQuery, filters, maxResults], () => {
  // Update the map markers when filters or maxResults change
  if (map && map.getSource('trails')) {
    updateMapMarkers();
  }
}, { deep: true });

// Load initial data
async function loadInitialData() {
  try {
    // Fetch regions first
    const regionsData = await fetchRegions();
    regions.value = regionsData;
    
    // Fetch all trails for the map with loadAll flag set to true
    // This ensures we process all trails upfront for the map
    const mapTrails = await fetchTrails(undefined, { loadAll: true });
    
    // Log how many trails were loaded
    console.log(`Loaded ${mapTrails.length} trails for map view`);
    
    // Fetch map examples (optional)
    await getMapboxExamples('terrain');
    
    // Ensure map markers are updated after data is loaded
    if (map && map.loaded() && map.getSource('trails')) {
      console.log('Updating map markers after initial data load');
      updateMapMarkers();
    } else {
      console.log('Map not fully loaded yet, will update markers when map is ready');
    }
    
    return true;
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
}

  // Initialize the map
function initMap() {
  if (!mapContainer.value) return;
  
  // Get the Mapbox token
  mapboxgl.accessToken = getMapboxToken();

  // Create the map instance
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [174.7762, -41.2865], // Default: New Zealand
    zoom: 5,
    pitch: 60,
    bearing: 0,
    projection: 'globe', // Use globe projection for better 3D
    antialias: true,
  });

  // Add controls with position based on sidebar state
  const controlPosition = isSidebarOpen ? 'top-right' : 'top-left';
  map.addControl(new mapboxgl.NavigationControl(), controlPosition);
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }), controlPosition);
  
  // Watch for sidebar state changes to update control positions
  watch(isSidebarOpen, (isOpen) => {
    if (!map) return;
    
    try {
      // Store current controls if available
      const controls = map._controls ? [...map._controls] : [];
      
      // Remove existing navigation and geolocate controls
      controls.forEach(control => {
        if (control instanceof mapboxgl.NavigationControl || 
            control instanceof mapboxgl.GeolocateControl) {
          try {
            map?.removeControl(control);
          } catch (e) {
            console.warn('Could not remove control:', e);
          }
        }
      });
      
      // Add controls with new position
      const newPosition = isOpen ? 'top-right' : 'top-left';
      if (map) {
        map.addControl(new mapboxgl.NavigationControl(), newPosition);
        map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }), newPosition);
      }
    } catch (error) {
      console.error('Error updating map controls:', error);
    }
  });

  // On load, add terrain, sky, and initial data
  map.on('load', () => {
    setupMapLayers();
    
    // If trails data is already loaded, update the markers
    if (trails.value.length > 0) {
      console.log('Trails data already loaded, updating markers on map load');
      updateMapMarkers();
    }
  });
}

// Setup map layers
function setupMapLayers() {
  if (!map) return;
  
  // First add the terrain source
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  });
  
  // Then add 3D terrain
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
  
  // Add sky layer
  map.addLayer({
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 90.0],
      'sky-atmosphere-sun-intensity': 15,
    },
  });
  
  // Setup trail sources and layers
  setupTrailLayers();
  
  // Add trails to the map
  updateMapMarkers();
  
  // Add click events for trails
  map.on('click', 'trail-points', (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature) {
        const properties = feature.properties;
        
        if (properties && properties.id) {
          const trail = trails.value.find(t => t.id === properties.id);
          if (trail) {
            selectTrail(trail, trails.value.indexOf(trail));
          }
        }
      }
    }
  });
  
  // Change cursor on hover over clickable elements
  map.on('mouseenter', 'trail-points', () => {
    if (map) map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'trail-points', () => {
    if (map) map.getCanvas().style.cursor = '';
  });
}

// Setup trail layers
function setupTrailLayers() {
  if (!map) return;
  
  // Add source for trails
  map.addSource('trails', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    }
  });
  
  // Add trails layer
  map.addLayer({
    id: 'trail-lines',
    type: 'line',
    source: 'trails',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': ['match', 
        ['get', 'difficulty'],
        'easy', '#22C55E',
        'moderate', '#F59E0B',
        'difficult', '#EF4444',
        'extreme', '#8B5CF6',
        '#2A5F4F'  // default color (primary)
      ],
      'line-width': 4,
      'line-opacity': 0.8,
    },
  });
  
  // Add point markers for trail starts
  map.addLayer({
    id: 'trail-points',
    type: 'circle',
    source: 'trails',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 8,
      'circle-color': ['match', 
        ['get', 'difficulty'],
        'easy', '#22C55E',
        'moderate', '#F59E0B',
        'difficult', '#EF4444',
        'extreme', '#8B5CF6',
        '#2A5F4F'  // default color (primary)
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });
}

// Filtered trails based on filters and max results
const filteredTrails = computed(() => {
  // First apply filters
  const filtered = trails.value.filter(trail => {
    // Search query filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const nameMatch = trail.name.toLowerCase().includes(query);
      const descMatch = trail.description ? trail.description.toLowerCase().includes(query) : false;
      if (!nameMatch && !descMatch) return false;
    }
    
    // Region filter
    if (filters.value.region && filters.value.region.trim() !== '') {
      // Check if the trail belongs to the selected region
      if (!trail.region || !trail.region.some(r => {
        const region = regions.value.find(reg => reg.id === filters.value.region);
        return region && r === region.name;
      })) {
        return false;
      }
    }
    
    // Difficulty filter
    if (filters.value.difficulty && filters.value.difficulty.trim() !== '' && 
        trail.difficulty !== filters.value.difficulty) {
      return false;
    }
    
    // Length filter
    if (filters.value.length && filters.value.length.trim() !== '') {
      const parts = filters.value.length.split('-');
      const min = Number(parts[0] || 0);
      const max = parts.length > 1 ? Number(parts[1]) : Infinity;
      if (trail.length < min || trail.length > max) {
        return false;
      }
    }
    
    return true;
  });
  
  // Then apply max results limit
  if (typeof maxResults.value === 'number' && maxResults.value > 0 && maxResults.value < filtered.length) {
    return filtered.slice(0, maxResults.value);
  }
  
  return filtered;
});

// Update filters from sidebar
function updateFilters(newFilters: { region: string, difficulty: string, length: string }) {
  filters.value = newFilters;
  // Force update map markers to reflect the new filters
  if (map && map.getSource('trails')) {
    updateMapMarkers();
  }
}

// Update search query from sidebar
function updateSearchQuery(query: string) {
  searchQuery.value = query;
  // Force update map markers to reflect the new search query
  if (map && map.getSource('trails')) {
    updateMapMarkers();
  }
}

// Update map markers based on filtered trails
function updateMapMarkers() {
  if (!map || !map.getSource('trails') || !trails.value) return;
  
  // Create GeoJSON features from trails
  const features: Array<GeoJSON.Feature> = [];
  
  // Use the filtered trails based on filters and maxResults
  filteredTrails.value.forEach((trail: Trail) => {
    if (trail.coordinates && trail.coordinates.length > 0) {
      // Add a point feature for the trail start
      const startCoord = trail.coordinates[0];
      if (startCoord) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [startCoord[0], startCoord[1]],
          },
          properties: {
            id: trail.id,
            name: trail.name,
            difficulty: trail.difficulty,
            length: trail.length,
            duration: trail.duration || trail.estimatedTime,
          } as GeoJSON.GeoJsonProperties,
        });
        
        // Add a line feature for the trail path
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: trail.coordinates
              .filter((coord: number[]) => coord[0] != null && coord[1] != null)
              .map((coord: number[]) => [
                Number(coord[0]), 
                Number(coord[1]), 
                coord[2] != null ? Number(coord[2]) : 0
              ]),
          },
          properties: {
            id: trail.id,
            name: trail.name,
            difficulty: trail.difficulty,
          } as GeoJSON.GeoJsonProperties,
        });
      }
    }
  });
  
  // Update the source data
  (map.getSource('trails') as mapboxgl.GeoJSONSource).setData({
    type: 'FeatureCollection',
    features,
  });
}

// Set the view mode
function setViewMode(mode: string) {
  if (!map) return;
  
  currentViewMode.value = mode;
  
  // First store the current center and zoom
  const center = map.getCenter();
  const zoom = map.getZoom();
  const pitch = map.getPitch();
  
  // Then set the style based on the selected mode
  switch (mode) {
    case '3d-terrain':
      map.setStyle('mapbox://styles/mapbox/outdoors-v12');
      map.setPitch(60);
      break;
    case 'satellite':
      map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
      break;
    case 'topo':
      map.setStyle('mapbox://styles/mapbox/light-v11');
      break;
    case 'contour':
      map.setStyle('mapbox://styles/mapbox/standard');
      break;
  }
  
  // After style loads, re-add sources and layers
  map.once('style.load', () => {
    if (!map) return;
    
    // Re-add terrain source first
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
    
    // Then set terrain for all modes except flat
    if (mode !== 'topo') {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: mode === '3d-terrain' ? 1.5 : 1.0 });
      
      // Add sky for 3D modes
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });
    }
    
    // Setup trail layers again
    setupTrailLayers();
    
    // Update map markers
    updateMapMarkers();
    
    // Restore the center and zoom
    const storedCenter = center;
    const storedZoom = zoom;
    const storedPitch = pitch;
    
    map.setCenter(storedCenter);
    map.setZoom(storedZoom);
    map.setPitch(mode === '3d-terrain' ? 60 : storedPitch);
  });
}

// Toggle map layers
function toggleLayer(layerId: string, visible: boolean) {
  if (!map) return;
  
  switch (layerId) {
    case 'trails':
      map.setLayoutProperty('trail-lines', 'visibility', visible ? 'visible' : 'none');
      map.setLayoutProperty('trail-points', 'visibility', visible ? 'visible' : 'none');
      break;
    case 'points':
      // This would control additional points of interest in a real app
      console.log(`Points of Interest layer visibility set to ${visible}`);
      break;
    case 'elevation':
      // In a real app, you might add/remove an elevation profile layer
      console.log(`Elevation Profile layer visibility set to ${visible}`);
      break;
    case 'weather':
      // In a real app, you'd toggle a weather overlay
      console.log(`Weather overlay visibility set to ${visible}`);
      break;
  }
}

// Reset map view
function resetMapView() {
  if (!map) return;
  
  // Reset to the default view of New Zealand
  map.flyTo({
    center: [174.7762, -41.2865],
    zoom: 5,
    pitch: 60,
    bearing: 0,
    duration: 2000,
  });
  
  // Clear the selected trail
  selectedTrail.value = null;
}

// Reset filters
function resetFilters() {
  searchQuery.value = '';
  filters.value = {
    region: '',
    difficulty: '',
    length: '',
  };
}

// Update max results when changed from sidebar
function updateMaxResults(value: number) {
  maxResults.value = value;
  // The sidebar filter will apply the max results limit
  console.log(`Max results set to ${value}`);
  
  // If we have a selected trail that's outside the max results limit,
  // clear the selection to avoid confusion
  if (selectedTrailIndex.value !== null && selectedTrailIndex.value >= value) {
    selectedTrail.value = null;
    selectedTrailIndex.value = null;
  }
  
  // Force update map markers to reflect the new max results
  if (map && map.getSource('trails')) {
    updateMapMarkers();
  }
}

// Select a trail
function selectTrail(trail: Trail, index: number) {
  selectedTrail.value = trail;
  selectedTrailIndex.value = index;
  
  // Fly to the trail if it has coordinates
  flyToTrail(trail);
}

// Fly to a trail on the map
function flyToTrail(trail: Trail) {
  if (!map || !trail.coordinates || trail.coordinates.length === 0) return;
  
  // Get the center point of the trail
  const middleIndex = Math.floor(trail.coordinates.length / 2);
  const centerCoord = trail.coordinates[middleIndex];
  
  if (centerCoord) {
    // Fly to the trail
    map.flyTo({
      center: [centerCoord[0], centerCoord[1]],
      zoom: 14,
      pitch: 60,
      bearing: 0,
      duration: 2000,
    });
  }
}

// View trail details (navigate to details page)
function viewTrailDetails(trailId: string) {
  // Store current map state in localStorage
  if (map) {
    const mapState = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      selectedTrailId: trailId
    };
    
    // Save state to localStorage
    localStorage.setItem('mapState', JSON.stringify(mapState));
  }
  
  // Navigate to trail detail
  router.push(`/trails/${trailId}`);
}
</script>

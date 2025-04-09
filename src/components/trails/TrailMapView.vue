<template>
  <div class="relative w-full h-[600px] rounded-lg overflow-hidden shadow-md">
    <!-- Map Container -->
    <div 
      ref="mapContainer" 
      class="absolute inset-0 w-full h-full bg-gray-100"
    ></div>
    
    <!-- Map Controls -->
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button 
        @click="toggle3D" 
        class="bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-colors"
        :title="is3D ? 'Switch to 2D view' : 'Switch to 3D view'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13M9 4v13M15 7v13"/>
        </svg>
      </button>
      
      <button 
        @click="resetView" 
        class="bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-colors"
        title="Reset view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l0 18M3 12l18 0"/>
        </svg>
      </button>
    </div>
    
    <!-- Selected Trail Info -->
    <div 
      v-if="selectedTrail" 
      class="absolute bottom-4 left-4 right-4 bg-white rounded-md shadow-md p-4 max-w-md"
    >
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium text-primary">{{ selectedTrail.name }}</h3>
          <div class="flex gap-2 mt-1 text-xs text-text-light">
            <span>{{ selectedTrail.length }} km</span>
            <span>•</span>
            <span>{{ selectedTrail.difficulty }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="$emit('view-details', selectedTrail.id)" 
            class="btn btn-xs btn-accent"
          >
            Details
          </button>
          <button 
            @click="selectedTrail = null" 
            class="btn btn-xs btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/20">
      <div class="bg-white p-4 rounded-md shadow-md">
        <div class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading map...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Trail } from '@/types/trail';
import { getMapboxToken } from '@/lib/mapTokenHelper';

const props = defineProps<{
  trails: Trail[];
  selectedTrailId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-trail', trailId: string): void;
  (e: 'view-details', trailId: string): void;
}>();

// Map state
const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;
const loading = ref(true);
const is3D = ref(true);
const selectedTrail = ref<Trail | null>(null);

// Initialize map
onMounted(() => {
  initMap();
});

// Clean up
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Watch for changes in trails
watch(() => props.trails, (newTrails) => {
  if (map && map.loaded() && map.getSource('trails')) {
    updateMapMarkers();
  }
}, { deep: true });

// Watch for changes in selected trail ID
watch(() => props.selectedTrailId, (newTrailId) => {
  if (newTrailId) {
    const trail = props.trails.find(t => t.id === newTrailId);
    if (trail) {
      selectedTrail.value = trail;
      flyToTrail(trail);
    }
  } else {
    selectedTrail.value = null;
  }
});

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

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-left');
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }), 'top-left');

  // On load, add terrain, sky, and initial data
  map.on('load', () => {
    setupMapLayers();
    loading.value = false;
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
          const trail = props.trails.find(t => t.id === properties.id);
          if (trail) {
            selectedTrail.value = trail;
            emit('select-trail', trail.id);
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

// Update map markers based on trails
function updateMapMarkers() {
  if (!map || !map.getSource('trails')) return;
  
  // Create GeoJSON features from trails
  const features: Array<GeoJSON.Feature> = [];
  
  props.trails.forEach((trail: Trail) => {
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
  
  // If there's a selected trail, make sure it's still visible
  if (selectedTrail.value) {
    const trail = props.trails.find(t => t.id === selectedTrail.value?.id);
    if (!trail) {
      selectedTrail.value = null;
    }
  }
}

// Toggle 3D mode
function toggle3D() {
  if (!map) return;
  
  is3D.value = !is3D.value;
  
  if (is3D.value) {
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    map.setPitch(60);
  } else {
    map.setTerrain(null);
    map.setPitch(0);
    
    // Update trail source with 2D coordinates when switching to 2D mode
    if (map.getSource('trails')) {
      updateMapMarkers();
    }
  }
}

// Reset map view
function resetView() {
  if (!map) return;
  
  // Reset to the default view of New Zealand
  map.flyTo({
    center: [174.7762, -41.2865],
    zoom: 5,
    pitch: is3D.value ? 60 : 0,
    bearing: 0,
    duration: 2000,
  });
  
  // Clear the selected trail
  selectedTrail.value = null;
}

// Fly to a trail on the map
function flyToTrail(trail: Trail) {
  if (!map || !trail.coordinates || trail.coordinates.length === 0) return;
  
  // Calculate bounds of the trail
  const bounds = new mapboxgl.LngLatBounds();
  
  trail.coordinates.forEach(coord => {
    bounds.extend([coord[0], coord[1]] as [number, number]);
  });
  
  // Fly to the trail with padding
  map.fitBounds(bounds, {
    padding: 100,
    duration: 1000,
    pitch: is3D.value ? 60 : 0,
  });
}
</script>

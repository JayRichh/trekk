<template>
  <div class="absolute top-4 right-4 z-10 transition-all duration-300" :class="{ 'md:right-[calc(350px+1rem)]': isSidebarOpen }">
    <div class="map-control" :class="{ 'w-60': isExpanded, 'w-auto': !isExpanded }">
      <div 
        class="map-control-header"
        @click="isExpanded = !isExpanded"
      >
        <h2 class="font-medium text-primary text-sm">Map Settings</h2>
        <button class="flex items-center justify-center" :class="{ 'rotate-180': isExpanded }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </button>
      </div>
      
      <div v-if="isExpanded" class="map-control-body">
        <div>
          <h3 class="font-medium text-sm mb-2 text-text">View Mode</h3>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="mode in viewModes" 
              :key="mode.id" 
              @click="setViewMode(mode.id)"
              :class="[
                'px-3 py-1.5 text-xs rounded transition-colors',
                currentViewMode === mode.id 
                  ? 'bg-accent text-white' 
                  : 'bg-wash-slate text-text hover:bg-gray-200'
              ]"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium text-sm mb-2 text-text">Layers</h3>
          <div class="space-y-2">
            <div v-for="layer in layers" :key="layer.id" class="flex items-center">
              <label class="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :id="layer.id" 
                  v-model="layer.visible" 
                  @change="toggleLayer(layer.id)"
                  class="form-checkbox"
                />
                <span class="ml-2 text-sm text-text">{{ layer.label }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <button 
          @click="resetMapView" 
          class="btn btn-sm btn-secondary w-full"
        >
          Reset View
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

interface ViewMode {
  id: string;
  label: string;
}

interface MapLayer {
  id: string;
  label: string;
  visible: boolean;
}

const props = defineProps<{
  currentViewMode: string;
  isSidebarOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: 'set-view-mode', mode: string): void;
  (e: 'toggle-layer', id: string, visible: boolean): void;
  (e: 'reset-view'): void;
}>();

const isExpanded = ref(false);

// View modes
const viewModes = reactive<ViewMode[]>([
  { id: '3d-terrain', label: '3D Terrain' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'topo', label: 'Topo Map' },
  { id: 'contour', label: 'Contour' },
]);

// Layers
const layers = reactive<MapLayer[]>([
  { id: 'trails', label: 'Trails', visible: true },
  { id: 'points', label: 'Points of Interest', visible: true },
  { id: 'elevation', label: 'Elevation Profile', visible: false },
  { id: 'weather', label: 'Weather Overlay', visible: false },
]);

// Set view mode
function setViewMode(mode: string) {
  emit('set-view-mode', mode);
}

// Toggle map layer
function toggleLayer(layerId: string) {
  const layer = layers.find(l => l.id === layerId);
  if (layer) {
    emit('toggle-layer', layerId, layer.visible);
  }
}

// Reset map view
function resetMapView() {
  emit('reset-view');
  isExpanded.value = false;
}
</script>

<template>
  <div class="hub-layout-container w-full flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Loading state -->
    <div v-if="layoutLoading" class="flex-1 flex items-center justify-center">
      <LoadingSpinner :loading="true" />
    </div>
    
    <!-- Not logged in state -->
    <div v-else-if="!isLoggedIn" class="flex-1 flex items-center justify-center flex-col p-4">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-700">Please log in to view your dashboard</h2>
        <p class="text-gray-500 mt-2">You need to be logged in to access your personalized dashboard</p>
      </div>
      <router-link to="/login" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm">
        Log In
      </router-link>
    </div>
    
    <!-- Dashboard Grid Layout -->
    <div v-else class="flex-1 dashboard-content overflow-hidden">
      <div class="p-4 bg-gray-50 dashboard-grid-wrapper overflow-hidden">
        <grid-layout
          :layout="currentLayout"
          :col-num="12"
          :row-height="90"
          :margin="[12, 12]"
          :is-draggable="true"
          :is-resizable="true"
          :responsive="true"
          :vertical-compact="true"
          :use-css-transforms="true"
          :prevent-collision="false"
          drag-allow-from=".drag-handle"
          class="grid-layout overflow-hidden"
          @layout-updated="onLayoutUpdated"
        >
          <grid-item
            v-for="section in sections"
            :key="section.id"
            :i="section.id"
            :x="getLayoutItem(section.id)?.x || section.x || 0"
            :y="getLayoutItem(section.id)?.y || section.y || 0"
            :w="getLayoutItem(section.id)?.w || section.width"
            :h="getLayoutItem(section.id)?.h || section.height"
            :min-w="2"
            :min-h="2"
            class="grid-item"
          >
            <div class="h-full">
              <slot :name="`section-${section.id}`">
                <!-- Fallback content if slot is not provided -->
                <div class="h-full bg-white rounded-lg shadow p-4 flex items-center justify-center text-gray-400">
                  <div class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p>No content available for {{ section.title }}</p>
                  </div>
                </div>
              </slot>
            </div>
          </grid-item>
        </grid-layout>
      </div>
    </div>
    
    <!-- Reset Layout Button -->
    <div v-if="isLoggedIn" class="p-4 border-t border-gray-200 bg-white flex justify-center">
      <button 
        @click="resetLayout"
        class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm transition-colors"
      >
        Reset Layout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '../../composables/useAuth';
import LoadingSpinner from '../shared/LoadingSpinner.vue';
import { GridLayout, GridItem } from 'vue3-grid-layout';
import type { DashboardSection } from '../../config/dashboard-config';
import { defaultSections } from '../../config/dashboard-config';

const props = defineProps<{
  sections: DashboardSection[];
}>();

const { isLoggedIn, loading: authLoading } = useAuth();
const loading = ref(true);
const layoutLoading = computed(() => loading.value || authLoading.value);
const currentLayout = ref<any[]>([]);

// Store current layout items mapped by id for quick lookup
const layoutItemsById = computed(() => {
  const result: Record<string, any> = {};
  currentLayout.value.forEach(item => {
    result[item.i] = item;
  });
  return result;
});

// Helper function to get layout item by section id
function getLayoutItem(sectionId: string) {
  return layoutItemsById.value[sectionId];
}

// Load layout from storage or initialize with defaults
function loadLayout() {
  if (!isLoggedIn.value) return;
  
  try {
    const savedLayoutStr = localStorage.getItem('hubDashboardLayout');
    if (savedLayoutStr) {
      const savedLayout = JSON.parse(savedLayoutStr);
      
      // Validate saved layout
      if (Array.isArray(savedLayout) && savedLayout.length > 0) {
        // Ensure all current sections exist in the saved layout
        const updatedLayout = props.sections.map(section => {
          const saved = savedLayout.find((item: any) => item.i === section.id);
          if (saved) {
            return {
              ...saved,
              // Ensure minimum dimensions
              w: Math.max(saved.w || section.width, 2),
              h: Math.max(saved.h || section.height, 2)
            };
          } else {
            return {
              i: section.id,
              x: section.x || 0,
              y: section.y || 0,
              w: section.width,
              h: section.height,
              minW: 2,
              minH: 2
            };
          }
        });
        
        currentLayout.value = updatedLayout;
        return;
      }
    }
    
    // If no valid saved layout, use default
    resetToDefaultLayout();
  } catch (error) {
    console.error('Error loading dashboard layout:', error);
    resetToDefaultLayout();
  }
}

// Initialize layout on mount
onMounted(() => {
  loadLayout();
  loading.value = false;
});

// Watch for login state changes
watch(() => isLoggedIn.value, (isLoggedIn) => {
  if (isLoggedIn) {
    loadLayout();
  }
});

// Watch for section changes
watch(() => props.sections, () => {
  if (isLoggedIn.value) {
    // Check if any new sections have been added
    const currentSectionIds = new Set(currentLayout.value.map(item => item.i));
    const newSections = props.sections.filter(section => !currentSectionIds.has(section.id));
    
    if (newSections.length > 0) {
      // Add new sections to the layout
      const newItems = newSections.map(section => ({
        i: section.id,
        x: section.x || 0,
        y: section.y || 0,
        w: section.width,
        h: section.height,
        minW: 2,
        minH: 2
      }));
      
      currentLayout.value = [...currentLayout.value, ...newItems];
    }
  }
}, { deep: true });

// Convert sections to layout format
function resetToDefaultLayout() {
  currentLayout.value = props.sections.map(section => ({
    i: section.id,
    x: section.x || 0,
    y: section.y || 0,
    w: section.width,
    h: section.height,
    minW: 2,
    minH: 2
  }));
}

// Reset layout to default
function resetLayout() {
  resetToDefaultLayout();
  localStorage.removeItem('hubDashboardLayout');
}

// Save layout when it changes
function onLayoutUpdated(newLayout: any[]) {
  if (isLoggedIn.value) {
    currentLayout.value = newLayout;
    localStorage.setItem('hubDashboardLayout', JSON.stringify(newLayout));
  }
}
</script>

<style>
.hub-layout-container {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent double scrollbars */
  height: 100%;
}

.dashboard-grid-wrapper {
  flex: 1;
  position: relative;
  overflow-y: auto; /* Scrolling happens at this level */
  overflow-x: hidden;
}

/* Grid Layout Core Styles */
.grid-layout {
  background-color: transparent;
  transition: height 200ms ease;
  width: 100%;
}

/* Grid Item Styling */
.grid-item {
  transition: transform 200ms ease, opacity 200ms ease;
  background-color: transparent;
  z-index: 1;
  cursor: default; /* Default cursor for non-draggable areas */
}

.grid-item.vue-grid-item.vue-draggable-dragging {
  transition: none;
  z-index: 10;
  opacity: 0.9;
  user-select: none;
}

.grid-item.vue-grid-item.resizing {
  z-index: 10;
  opacity: 0.9;
}

/* Dashboard Card Drag Interaction */
.drag-handle {
  cursor: move;
  user-select: none;
}

/* Customizing Grid Borders/Guides */
.vue-grid-layout {
  position: relative;
}

.vue-grid-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 8.33% 100px; /* 12 columns */
  background-image: linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px);
  pointer-events: none;
  z-index: 0;
}
</style>

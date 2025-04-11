<template>
  <div class="dashboard-card h-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
    <!-- Card Header with Visible Drag Handle -->
    <div class="drag-handle p-3 bg-gray-50 border-b border-gray-200 flex items-center select-none">
      <!-- Visual drag indicator -->
      <div class="drag-indicator flex-shrink-0 mr-2 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      
      <!-- Title -->
      <h2 class="text-lg font-medium text-primary-800 flex-grow truncate">{{ title }}</h2>
      
      <!-- Optional header actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <slot name="header-actions"></slot>
      </div>
    </div>
    
    <!-- Card Content with Overflow Handling -->
    <div class="card-content flex-grow overflow-auto p-4 relative">
      <!-- Loading state -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
        <LoadingSpinner :loading="true" />
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-red-500 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{{ error }}</p>
      </div>
      
      <!-- Regular content -->
      <div v-else class="h-full">
        <slot></slot>
      </div>
    </div>
    
    <!-- Visual resize handle (bottom right corner) -->
    <div class="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
      <svg width="10" height="10" viewBox="0 0 10 10" class="text-gray-300">
        <path d="M0 10L10 10L10 0" fill="currentColor" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../shared/LoadingSpinner.vue';

defineProps<{
  title: string;
  contentType: string;
  sectionId: string;
  loading?: boolean;
  error?: string | null;
}>();
</script>

<style scoped>
.dashboard-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  transition: box-shadow 0.2s ease-in-out;
}

.dashboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Make drag handle visually interactive */
.drag-handle {
  cursor: move;
  touch-action: none;
  user-select: none;
}

/* Add subtle animation to drag indicator on hover */
.drag-indicator {
  cursor: grab;
}

.drag-indicator:hover svg {
  transform: scale(1.1);
}

.drag-indicator:active {
  cursor: grabbing;
}

/* Fix issue with content overflow */
.card-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
}

/* Resize handle styling */
.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 4px;
  cursor: se-resize;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.resize-handle:hover {
  opacity: 1;
}

/* Enable text selection in card content */
.card-content {
  user-select: text;
  cursor: auto;
}

/* Only prevent text selection in specific areas */
.drag-handle *,
.resize-handle {
  user-select: none;
}
</style>

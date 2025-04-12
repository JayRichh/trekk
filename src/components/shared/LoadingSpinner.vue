<template>
  <Transition
    name="fade"
    enter-active-class="fade-enter-active"
    leave-active-class="fade-leave-active"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="loading-container">
        <img src="/loadingtree.gif" alt="Loading" class="w-20 h-20 object-contain" />
        <div v-if="showProgress" class="progress-container mt-3">
          <div class="progress-text mb-1 text-sm text-center">{{ progressText }}</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  loading: boolean;
  showProgress?: boolean;
  externalControl?: boolean;
  initialProgressText?: string;
}>();

const emit = defineEmits(['update:progress', 'update:progressText']);

const progress = ref(0);
const progressText = ref(props.initialProgressText || 'Loading...');
let interval: ReturnType<typeof setInterval> | null = null;

// Simulate progress for long-running operations
watch(() => props.loading, (isLoading) => {
  if (isLoading && props.showProgress && !props.externalControl) {
    // Reset progress when loading starts and not externally controlled
    progress.value = 0;
    startProgressSimulation();
  } else if (!isLoading && interval) {
    // Clear interval when loading stops
    window.clearInterval(interval);
    interval = null;
  }
});

// Update progress and text externally
function updateProgress(value: number, text?: string) {
  progress.value = Math.min(Math.max(0, value), 100);
  if (text) progressText.value = text;
  emit('update:progress', progress.value);
  if (text) emit('update:progressText', text);
}

function startProgressSimulation() {
  // Clear any existing interval
  if (interval) {
    clearInterval(interval);
  }
  
  // Simulate progress with different phases
  interval = setInterval(() => {
    if (progress.value < 30) {
      // Initial phase - loading data
      progress.value += 2;
      progressText.value = 'Loading data...';
    } else if (progress.value < 60) {
      // Middle phase - slower progress
      progress.value += 1;
      progressText.value = 'Processing data...';
    } else if (progress.value < 90) {
      // Final phase - very slow
      progress.value += 0.5;
      progressText.value = 'Finalizing...';
    } else if (progress.value < 98) {
      // Almost done
      progress.value += 0.2;
      progressText.value = 'Almost ready...';
    }
    
    // Don't reach 100% automatically - that happens when loading is complete
    if (progress.value >= 98) {
      progress.value = 98;
      clearInterval((interval as ReturnType<typeof setInterval>));
      interval = null;
    }
    
    emit('update:progress', progress.value);
    emit('update:progressText', progressText.value);
  }, 150);
}

// Expose methods to parent components
defineExpose({
  updateProgress
});

// Clean up interval on component unmount
onUnmounted(() => {
  if (interval !== null) {
    window.clearInterval(interval);
    interval = null;
  }
});

// If initial progress text is provided, use it
onMounted(() => {
  if (props.initialProgressText) {
    progressText.value = props.initialProgressText;
  }
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.progress-container {
  width: 250px;
}

.progress-text {
  color: #4b5563;
  font-weight: 500;
}

.progress-bar-bg {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #2A5F4F;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

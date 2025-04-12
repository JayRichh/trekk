<template>
  <div 
    :class="[
      'animate-pulse bg-gray-200 rounded-md overflow-hidden',
      className
    ]"
    :style="{
      width: width,
      height: height
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '1rem',
  },
  className: {
    type: String,
    default: '',
  }
});
</script>

<template>
  <div class="page-skeleton min-h-screen">
    <!-- Home Page Skeleton -->
    <div v-if="type === 'home'" class="home-skeleton">
      <!-- Hero Section -->
      <div class="relative min-h-[60vh] flex items-center overflow-hidden bg-gray-100">
        <div class="container relative z-10 px-4 max-w-7xl mx-auto">
          <div class="max-w-4xl mx-auto">
            <div class="text-center my-10">
              <SkeletonLoader height="6rem" width="60%" class="mx-auto mb-6" />
              <SkeletonLoader height="1.5rem" width="80%" class="mx-auto" />
            </div>
            <div class="text-center mb-12">
              <SkeletonLoader height="1rem" width="70%" class="mx-auto mb-2" />
              <SkeletonLoader height="1rem" width="50%" class="mx-auto" />
            </div>
            <div class="flex flex-col sm:flex-row gap-5 justify-center">
              <SkeletonLoader height="3rem" width="150px" class="mx-auto sm:mx-0" />
              <SkeletonLoader height="3rem" width="150px" class="mx-auto sm:mx-0" />
            </div>
            <div class="mt-24 mb-24 bg-gray-100 rounded-md py-6 max-w-4xl mx-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 px-6">
                <div class="flex flex-col items-center text-center">
                  <SkeletonLoader height="4rem" width="4rem" class="rounded-full mb-4" />
                  <SkeletonLoader height="2rem" width="40%" class="mb-2" />
                  <SkeletonLoader height="1rem" width="60%" />
                </div>
                <div class="flex flex-col items-center text-center">
                  <SkeletonLoader height="4rem" width="4rem" class="rounded-full mb-4" />
                  <SkeletonLoader height="2rem" width="40%" class="mb-2" />
                  <SkeletonLoader height="1rem" width="60%" />
                </div>
                <div class="flex flex-col items-center text-center">
                  <SkeletonLoader height="4rem" width="4rem" class="rounded-full mb-4" />
                  <SkeletonLoader height="2rem" width="40%" class="mb-2" />
                  <SkeletonLoader height="1rem" width="60%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="py-24 md:py-32 bg-white">
        <div class="container px-4 max-w-7xl mx-auto">
          <SkeletonLoader height="2rem" width="300px" class="mx-auto mb-16" />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div v-for="i in 3" :key="i" class="card shadow-md p-8">
              <SkeletonLoader height="5rem" width="5rem" class="rounded-full mb-6 mx-auto" />
              <SkeletonLoader height="1.5rem" width="70%" class="mb-4 mx-auto" />
              <SkeletonLoader height="0.8rem" width="90%" class="mb-2 mx-auto" />
              <SkeletonLoader height="0.8rem" width="80%" class="mb-2 mx-auto" />
              <SkeletonLoader height="0.8rem" width="60%" class="mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trails Page Skeleton -->
    <div v-else-if="type === 'trails'" class="trails-skeleton py-8">
      <div class="container mx-auto px-4">
        <!-- Header Banner -->
        <div class="relative mb-8 rounded-xl overflow-hidden h-48 bg-gray-100">
          <SkeletonLoader height="100%" width="100%" />
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sidebar Filters -->
          <div class="lg:w-1/3 xl:w-1/4">
            <div class="bg-white rounded-lg shadow p-4">
              <SkeletonLoader height="2rem" width="70%" class="mb-4" />
              <div class="space-y-4">
                <div v-for="i in 4" :key="i">
                  <SkeletonLoader height="1.5rem" width="50%" class="mb-2" />
                  <SkeletonLoader height="2.5rem" width="100%" />
                </div>
                <SkeletonLoader height="2.5rem" width="100%" class="mt-4" />
              </div>
            </div>
          </div>
          
          <!-- Content Area -->
          <div class="lg:w-2/3 xl:w-3/4">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow overflow-hidden">
                <SkeletonLoader height="160px" width="100%" />
                <div class="p-4">
                  <SkeletonLoader height="1.5rem" width="80%" class="mb-2" />
                  <SkeletonLoader height="1rem" width="50%" class="mb-4" />
                  <div class="flex justify-between">
                    <SkeletonLoader height="1.2rem" width="30%" />
                    <SkeletonLoader height="1.2rem" width="30%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Page Skeleton -->
    <div v-else-if="type === 'map'" class="map-skeleton relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      <SkeletonLoader height="100%" width="100%" />
      <!-- Sidebar Placeholder -->
      <div class="absolute top-0 left-0 bottom-0 w-80 bg-white/90 border-r border-gray-200 p-4">
        <SkeletonLoader height="2rem" width="70%" class="mb-6" />
        <div class="space-y-4">
          <div v-for="i in 3" :key="i">
            <SkeletonLoader height="1.5rem" width="60%" class="mb-2" />
            <SkeletonLoader height="2.5rem" width="100%" />
          </div>
          <!-- Trail List Skeletons -->
          <div class="mt-6 space-y-3">
            <div v-for="i in 5" :key="`trail-${i}`" class="bg-white rounded-md p-3 shadow-sm">
              <SkeletonLoader height="1.2rem" width="80%" class="mb-2" />
              <div class="flex justify-between">
                <SkeletonLoader height="1rem" width="30%" />
                <SkeletonLoader height="1rem" width="30%" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Controls Placeholder -->
      <div class="absolute top-4 right-4 flex flex-col space-y-2">
        <SkeletonLoader height="2.5rem" width="2.5rem" class="rounded-md" />
        <SkeletonLoader height="2.5rem" width="2.5rem" class="rounded-md" />
      </div>
    </div>

    <!-- Hub Page Skeleton -->
    <div v-else-if="type === 'hub'" class="hub-skeleton bg-gray-50 min-h-[calc(100vh-4rem)] p-6">
      <div class="container mx-auto">
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
          <SkeletonLoader height="2rem" width="60%" class="mb-4" />
          <SkeletonLoader height="1rem" width="80%" class="mb-2" />
          <SkeletonLoader height="1rem" width="40%" />
        </div>
        
        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Dashboard Cards -->
          <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-6">
              <SkeletonLoader height="1.5rem" width="50%" class="mb-4" />
              <div class="space-y-3">
                <div v-for="j in 3" :key="`item-${i}-${j}`">
                  <SkeletonLoader height="3rem" width="100%" class="rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trail Detail Skeleton -->
    <div v-else-if="type === 'trail-detail'" class="trail-detail-skeleton py-8">
      <div class="container mx-auto px-4">
        <!-- Hero Banner -->
        <div class="relative mb-8 rounded-xl overflow-hidden h-60 bg-gray-100">
          <SkeletonLoader height="100%" width="100%" />
        </div>

        <!-- Trail Information -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2">
            <SkeletonLoader height="2.5rem" width="70%" class="mb-3" />
            <div class="flex gap-3 mb-6">
              <SkeletonLoader height="1.5rem" width="100px" class="rounded-full" />
              <SkeletonLoader height="1.5rem" width="100px" class="rounded-full" />
            </div>
            
            <SkeletonLoader height="1rem" width="100%" class="mb-2" />
            <SkeletonLoader height="1rem" width="90%" class="mb-2" />
            <SkeletonLoader height="1rem" width="95%" class="mb-2" />
            <SkeletonLoader height="1rem" width="80%" class="mb-6" />
            
            <SkeletonLoader height="2rem" width="40%" class="mb-4" />
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div v-for="i in 4" :key="i" class="bg-gray-50 p-4 rounded-md">
                <SkeletonLoader height="1rem" width="60%" class="mb-2" />
                <SkeletonLoader height="1.5rem" width="80%" />
              </div>
            </div>
            
            <SkeletonLoader height="2rem" width="40%" class="mb-4" />
            <SkeletonLoader height="300px" width="100%" class="mb-6 rounded-lg" />
          </div>
          
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <SkeletonLoader height="1.5rem" width="70%" class="mb-6" />
              <div class="space-y-4">
                <SkeletonLoader height="2.5rem" width="100%" class="mb-3" />
                <SkeletonLoader height="2.5rem" width="100%" class="mb-6" />
                
                <SkeletonLoader height="1.5rem" width="60%" class="mb-3" />
                <div class="space-y-2">
                  <div v-for="i in 3" :key="`review-${i}`" class="border-b pb-3">
                    <div class="flex items-center gap-2 mb-2">
                      <SkeletonLoader height="2rem" width="2rem" class="rounded-full" />
                      <SkeletonLoader height="1rem" width="100px" />
                    </div>
                    <SkeletonLoader height="0.8rem" width="100%" class="mb-1" />
                    <SkeletonLoader height="0.8rem" width="90%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Default / Auth Pages Skeleton -->
    <div v-else class="auth-skeleton py-10">
      <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <SkeletonLoader height="2rem" width="60%" class="mx-auto mb-8" />
          <div class="space-y-4">
            <div v-for="i in 3" :key="i">
              <SkeletonLoader height="1.2rem" width="40%" class="mb-2" />
              <SkeletonLoader height="2.5rem" width="100%" />
            </div>
            <SkeletonLoader height="2.5rem" width="100%" class="mt-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue';

defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['home', 'trails', 'trail-detail', 'map', 'hub', 'default'].includes(value);
    }
  }
});
</script>

<template>
  <div class="animate-fade-in">
    <!-- Hero section -->
    <section class="relative min-h-[80vh] flex items-center overflow-hidden">
      <!-- Background image with overlay -->
      <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${heroImageUrl})`, filter: 'brightness(0.5)' }"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-primary-dark/90 to-primary/70"></div>
      
      <!-- Content -->
      <div class="container relative z-10 px-4 max-w-7xl mx-auto">
        <div class="max-w-4xl mx-auto">
          <!-- Logo/Brand -->
          <div class="text-center my-10">
            <h1 class="text-[5rem] md:text-[10rem] font-black tracking-tighter leading-none text-white">
              <span class="text-shadow-lg drop-shadow-xl">TREKK</span>
            </h1>
            <p class="text-xl md:text-2xl font-medium tracking-wide text-white mt-2 drop-shadow-md">
              Elevate Your Adventure
            </p>
          </div>
          
          <!-- Description -->
          <div class="text-center mb-12">
            <p class="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Interactive 3D topographical mapping for hikers and adventurers seeking the path less traveled
            </p>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-col sm:flex-row gap-5 justify-center">
            <router-link to="/map" class="btn btn-lg bg-white text-forest-dark font-semibold hover:bg-gray-100 shadow-lg border-2 border-white">
              <span class="text-base">Explore Map</span>
            </router-link>
            <router-link to="/trails" class="btn btn-lg bg-accent text-white font-semibold hover:bg-accent-600 shadow-lg border-2 border-accent">
              <span class="text-base">Browse Trails</span>
            </router-link>
          </div>
          
          <!-- Stats Bar -->
          <div class="mt-24 mb-24 bg-white/15 backdrop-blur-md rounded-md py-6 max-w-4xl mx-auto shadow-xl border border-white/10 ">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
                  </svg>
                </div>
                <div class="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">500+</div>
                <div class="text-base font-medium text-white/90 tracking-wide">Trails Mapped</div>
              </div>
              
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 13.5V12l-9.5 -7L3 12v1.5m18 0l-9.5 7L3 13.5m18 0v7.5h-18v-7.5"/>
                  </svg>
                </div>
                <div class="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">50+</div>
                <div class="text-base font-medium text-white/90 tracking-wide">Regions</div>
              </div>
              
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12L12 7M12 12L16 14"/>
                  </svg>
                </div>
                <div class="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">10,000+</div>
                <div class="text-base font-medium text-white/90 tracking-wide">Total km</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Trail Tech Toolkit section -->
    <section class="py-24 md:py-32 bg-gray-50">
      <div class="container px-4 max-w-7xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-primary-700">Your Trail Tech Toolkit</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Card 1: Interactive Maps -->
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105 bg-white">
            <div class="card-body p-6">
              <div class="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l6-3l6 3l6-3v13l-6 3l-6-3l-6 3V7z M9 4v13 M15 7v13" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3 text-primary-700">Interactive 3D Maps</h3>
              <ul class="space-y-2 text-text-light text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Topographical visualization with elevation data</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Multiple view modes (terrain, satellite, hybrid)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Interactive markers and trail highlights</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Card 2: Trail Data -->
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105 bg-white">
            <div class="card-body p-6">
              <div class="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3 text-primary-700">Advanced Trail Data</h3>
              <ul class="space-y-2 text-text-light text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>GPX file import and export functionality</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Detailed elevation profiles and analysis</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Terrain type and difficulty assessments</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Card 3: Real-time Information -->
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105 bg-white">
            <div class="card-body p-6">
              <div class="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3 text-primary-700">Real-time Updates</h3>
              <ul class="space-y-2 text-text-light text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Live weather conditions and forecasts</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Trail status and safety alerts</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Crowd data and hiker locations</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Card 4: Personal Tools -->
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105 bg-white">
            <div class="card-body p-6">
              <div class="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3 text-primary-700">Personal Tools</h3>
              <ul class="space-y-2 text-text-light text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Customizable wishlists with priority levels</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Goal tracking with progress visualization</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-accent mt-1">•</span>
                  <span>Trail ratings and personal logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="text-center mt-12">
          <router-link to="/trails" class="btn btn-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md">
            <span class="text-base">Explore All Features</span>
          </router-link>
        </div>
      </div>
    </section>
    <!-- Enhanced CTA Section -->
    <section class="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-600 text-white">
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="absolute top-0 right-0 w-96 h-96 transform translate-x-1/3 -translate-y-1/3">
          <path fill="currentColor" d="M139.6,-196.4C183.9,-177.5,224.4,-139.6,246.6,-92.9C268.8,-46.2,272.6,9.3,258.6,60.1C244.6,110.9,212.7,156.9,170.1,185.8C127.5,214.7,74.3,226.4,23.2,227.9C-27.9,229.4,-77.1,220.6,-116.9,196.3C-156.7,172,-187.2,132.3,-202,88.6C-216.9,44.8,-216.2,-2.8,-207.6,-49.9C-199,-97,-182.5,-143.7,-151.8,-175.7C-121.1,-207.8,-76.2,-225.2,-29.3,-233.3C17.5,-241.5,66.2,-240.4,110.7,-224.1C155.2,-207.9,195.4,-176.5,139.6,-196.4Z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="absolute bottom-0 left-0 w-96 h-96 transform -translate-x-1/3 translate-y-1/3">
          <path fill="currentColor" d="M46.1,-78.5C59.2,-71.3,69.3,-57.8,74.8,-43.1C80.3,-28.4,81.2,-12.6,79.7,2.7C78.2,18,74.2,32.7,64.4,42C54.7,51.3,39.1,55.2,24.8,61.8C10.5,68.4,-2.6,77.7,-16.9,78.2C-31.2,78.8,-46.7,70.7,-53.7,58.3C-60.7,45.8,-59.2,29.1,-60.9,13.7C-62.6,-1.6,-67.4,-15.5,-63.7,-26.2C-60,-36.9,-47.8,-44.4,-35.8,-51.9C-23.7,-59.4,-11.9,-66.9,2.7,-71.2C17.2,-75.6,34.5,-77,46.1,-78.5Z" />
        </svg>
      </div>
      
      <div class="container px-4 max-w-7xl mx-auto relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <!-- Content side -->
          <div>
            <h2 class="text-3xl md:text-5xl font-bold mb-6">Ready for Adventure?</h2>
            <p class="text-xl mb-8 text-white/90 leading-relaxed">
              Join over <span class="font-bold">10,000 hikers</span> using Trekk to discover new trails, track their adventures, and connect with nature like never before.
            </p>
            
            <!-- Feature highlights -->
            <div class="grid grid-cols-2 gap-6 mb-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span class="text-sm">Set personal hiking goals</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span class="text-sm">Rate and save favorites</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22V12h6v10" />
                  </svg>
                </div>
                <span class="text-sm">Build your trail wishlist</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="text-white">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <span class="text-sm">View your trail analytics</span>
              </div>
            </div>
            
            <router-link to="/signup" class="btn btn-lg bg-white text-primary-800 font-semibold hover:bg-gray-100 shadow-lg border-2 border-white">
              <span class="text-base">Get Started Today</span>
            </router-link>
          </div>
          
          <!-- Image/graphics side -->
          <div class="relative hidden md:block">
            <div class="relative z-10 bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
              <div class="aspect-[4/3] bg-gradient-to-br from-primary-400/20 to-primary-700/20 rounded-lg flex items-center justify-center overflow-hidden relative">
                <!-- Topographical map stylized design -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="absolute inset-0 w-full h-full opacity-30">
                  <path d="M0,100 Q200,150 400,100 T800,100 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,200 Q200,250 400,200 T800,200 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,300 Q200,350 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,400 Q200,450 400,400 T800,400 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,500 Q200,550 400,500 T800,500 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
                </svg>
                
                <!-- Trail path -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="absolute inset-0 w-full h-full">
                  <path d="M100,500 C150,400 200,450 250,350 S350,200 450,150 S600,50 700,100" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 10" />
                </svg>
                
                <!-- Mountain Icon -->
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" class="text-white opacity-90">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 3L12 7L16 3M18 13L22 9L12 21L2 9L6 13M6 13L12 7L18 13M12 7V21" />
                  </svg>
                </div>
                
                <!-- Location markers -->
                <div class="absolute top-1/4 right-1/4 w-3 h-3 bg-accent rounded-full animate-ping"></div>
                <div class="absolute bottom-1/3 left-1/3 w-3 h-3 bg-accent rounded-full animate-ping" style="animation-delay: 1s;"></div>
              </div>
              
              <!-- Dashboard-like UI element -->
              <div class="mt-4 px-3 py-2 bg-white/10 border border-white/20 rounded">
                <div class="flex justify-between items-center text-xs text-white">
                  <div>Personal Best: 24.5km</div>
                  <div>Next Goal: 30km</div>
                </div>
                <!-- Progress bar -->
                <div class="w-full h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-accent rounded-full" style="width: 80%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Footer -->
   
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getDefaultTrailImage } from '../utils/imageUtils';

// Generate a consistent hero image URL using Lorem Picsum
const heroImageUrl = computed(() => {
  // Use getTrailImageUrl with a fixed seed for consistency
  return `https://picsum.photos/seed/home-hero/1600/900`;
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

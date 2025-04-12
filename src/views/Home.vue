<template>
  <div class="animate-fade-in">
    <!-- Hero section -->
    <section class="relative min-h-[80vh] flex items-center overflow-hidden">
      <!-- Background image with overlay -->
      <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1551632811-561732d1e306'); filter: brightness(0.5);"></div>
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
    
    <!-- Features section -->
    <section class="py-24 md:py-32 bg-background">
      <div class="container px-4 max-w-7xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-primary-700">Key Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105">
            <div class="card-body text-center p-8">
              <div class="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 18h2M2 9l10-5l10 5m-9 2v7m11-4l-3-3m-3 0l-3 3" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4 text-primary-700">3D Terrain Visualization</h3>
              <p class="text-text-light leading-relaxed">
                Experience trails in immersive 3D topography powered by advanced mapping technology
              </p>
            </div>
          </div>
          
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105">
            <div class="card-body text-center p-8">
              <div class="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l4-4l-4-4m-5 4h9" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4 text-primary-700">Detailed Trail Information</h3>
              <p class="text-text-light leading-relaxed">
                Get comprehensive trail data including elevation profiles, difficulty ratings, and user experiences
              </p>
            </div>
          </div>
          
          <div class="card card-hover shadow-md transform transition-transform hover:scale-105">
            <div class="card-body text-center p-8">
              <div class="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4 text-primary-700">Real-time Updates</h3>
              <p class="text-text-light leading-relaxed">
                Stay informed with live updates on trail conditions, weather changes, and other hikers' locations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Showcase section -->
    <section class="py-24 md:py-32 bg-gray-50">
      <div class="container px-4 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="order-2 lg:order-1">
            <h2 class="text-3xl md:text-4xl font-bold mb-8 text-primary-700">Plan Your Next Adventure</h2>
            <ul class="space-y-6 my-10">
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                  </svg>
                </span>
                <span class="text-text-light text-lg">Interactive 3D maps with elevation data</span>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                  </svg>
                </span>
                <span class="text-text-light text-lg">Multiple view modes for different needs</span>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                  </svg>
                </span>
                <span class="text-text-light text-lg">Live trail condition updates</span>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                  </svg>
                </span>
                <span class="text-text-light text-lg">Detailed trail metrics and insights</span>
              </li>
            </ul>
            <router-link to="/trails" class="btn btn-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md">
              <span class="text-base">Start Exploring</span>
            </router-link>
          </div>
          
          <div class="order-1 lg:order-2 rounded-xl overflow-hidden shadow-xl">
            <!-- Placeholder for trail image -->
            <div class="aspect-video bg-gradient-to-br from-primary-600 to-forest-dark flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100" class="text-white opacity-80">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 5l-6-3l-6 3l-4-2v14l4 2l6-3l6 3l4-2v-14l-4 2z M8 14V4 M16 10v10 M12 12v9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- CTA Section -->
    <section class="py-20 md:py-28 bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100">
      <div class="container px-4 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto">
        <h2 class="text-3xl md:text-5xl font-bold mb-6">Ready to hit the trails?</h2>
        <p class="text-xl mb-10 text-gray-300 leading-relaxed">
        Join thousands of hikers using Trekk to discover new adventures and explore the world's most beautiful landscapes
        </p>
        <router-link to="/signup" class="btn btn-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 shadow-lg border-2 border-gray-100">
        <span class="text-base">Get Started Today</span>
        </router-link>
      </div>
      </div>
    </section>
    <!-- Footer -->
   
  </div>
</template>

<script setup lang="ts">
// No loading logic needed here - handled by RouterViewWrapper
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

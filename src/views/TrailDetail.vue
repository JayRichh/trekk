<template>
  <div class="pb-8 animate-fade-in">
    <div class="container mx-auto px-4" v-if="trail">
      <div class="my-6 flex gap-4 md:gap-6">
        <router-link to="/trails" class="flex items-center text-gray-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 6l-6 6l6 6"/>
          </svg>
          Back to trails
        </router-link>
        
        <button @click="backToMap" class="flex items-center text-gray-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6l-6 6"/>
          </svg>
          View on map
        </button>
      </div>
      
      <div class="mb-10">
        <!-- Hero image section with improved styling -->
        <div class="mb-6 relative">
          <div class="h-60 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
            <div 
              class="w-full h-full bg-cover bg-center"
              :style="{ backgroundImage: `url(${trailImageUrl})` }"
            ></div>
            <!-- Add a gradient overlay on the image -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <!-- Trail name overlay on the image -->
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 class="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">{{ trail.name }}</h1>
              <div class="flex flex-wrap items-center gap-4 mb-3">
                <div class="px-3 py-1.5 rounded text-sm font-semibold uppercase shadow-sm"
                  :class="{
                    'bg-green-500 text-white': trail.difficulty === 'easy',
                    'bg-yellow-500 text-gray-800': trail.difficulty === 'moderate',
                    'bg-orange-500 text-white': trail.difficulty === 'difficult',
                    'bg-red-500 text-white': trail.difficulty === 'extreme'
                  }">
                  {{ trail.difficulty }}
                </div>
                <div v-if="trail.reviews && trail.reviews.length" class="flex items-center text-sm text-white">
                  <svg class="text-yellow-400 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  <span>{{ getAverageRating(trail) }}</span>
                  <span class="ml-1">({{ trail.reviews.length }} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <!-- Trail description summary -->
          <p class="text-lg text-gray-700 mb-6">{{ trail.description?.substring(0, 200) }}{{ trail.description && trail.description.length > 200 ? '...' : '' }}</p>
          
          <!-- Trail Actions -->
          <div class="flex items-center gap-3 mb-5">
            <div class="px-2 py-1 rounded text-xs font-semibold uppercase"
              :class="{
                'bg-green-500 text-white': trail.difficulty === 'easy',
                'bg-yellow-500 text-gray-800': trail.difficulty === 'moderate',
                'bg-orange-500 text-white': trail.difficulty === 'difficult',
                'bg-red-500 text-white': trail.difficulty === 'extreme'
              }">
              {{ trail.difficulty }}
            </div>
            <div v-if="trail.reviews && trail.reviews.length" class="flex items-center text-sm text-gray-500">
              <svg class="text-yellow-400 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span>{{ getAverageRating(trail) }}</span>
              <span class="ml-1">({{ trail.reviews.length }} reviews)</span>
            </div>
          </div>
          
          <!-- Trail Actions -->
          <div class="flex items-center gap-3 mb-3">
            <TrailActions 
              v-if="isLoggedIn"
              :trail-id="trail.id"
              :icon-only="false"
              size="md"
              button-style="outline"
              @wishlist-updated="onWishlistUpdated"
              @rating-saved="onRatingsUpdated"
            />
          </div>
        </div>
      </div>
      
      <!-- Key stats cards with improved styling -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div class="bg-white rounded-lg p-5 shadow-lg border border-gray-100 flex items-center transform transition-transform hover:scale-105">
          <div class="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19h18M5 17h.01M7 10h.01M11 13h.01M13 7h.01M17 13h.01M19 7l-4 6 -4 -3 -4 6"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <div class="text-xs text-gray-500 mb-0.5">Distance</div>
            <div class="text-lg font-semibold text-primary">{{ trail.length }} km</div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-5 shadow-lg border border-gray-100 flex items-center transform transition-transform hover:scale-105">
          <div class="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 13.5V12l-9.5 -7L3 12v1.5m18 0l-9.5 7L3 13.5m18 0v7.5h-18v-7.5"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <div class="text-xs text-gray-500 mb-0.5">Elevation Gain</div>
            <div class="text-lg font-semibold text-primary">{{ trail.elevationGain }} m</div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-5 shadow-lg border border-gray-100 flex items-center transform transition-transform hover:scale-105">
          <div class="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12L12 7M12 12L16 14"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <div class="text-xs text-gray-500 mb-0.5">Est. Time</div>
            <div class="text-lg font-semibold text-primary">{{ trail.estimatedTime }}</div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">About this trail</h2>
            <p class="text-gray-700">{{ trail.description }}</p>
          </div>
        
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Interactive Map</h2>
            <div class="h-[300px] rounded-md overflow-hidden mb-4" ref="trailMapContainer"></div>
            <div class="flex gap-2">
              <button @click="centerMap" class="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l0 18M3 12l18 0"/>
                </svg>
                Center Map
              </button>
              <button @click="toggle3D" class="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12l-8 -4.5l8 -4.5l8 4.5l-8 4.5M12 12l0 9.5M17 17l-5 3l-5 -3"/>
                </svg>
                Toggle 3D
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Elevation Profile</h2>
            <div class="h-[200px] w-full" ref="elevationProfileContainer">
              <div class="h-full flex flex-col">
                <div class="flex-grow w-full">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" class="w-full h-full rounded bg-gray-100">
                    <path d="M0,200 L100,150 L200,180 L300,100 L400,80 L500,120 L600,50 L700,70 L800,90" fill="none" stroke="#5D85A6" stroke-width="3" />
                    <path d="M0,200 L100,150 L200,180 L300,100 L400,80 L500,120 L600,50 L700,70 L800,90 L800,200 L0,200" fill="url(#elevation-gradient)" fill-opacity="0.2" />
                    <defs>
                      <linearGradient id="elevation-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#5D85A6" />
                        <stop offset="100%" stop-color="#5D85A6" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div class="flex justify-between text-xs text-gray-500 pt-1">
                  <div>0 km</div>
                  <div>{{ Math.round(trail.length / 2 * 10) / 10 }} km</div>
                  <div>{{ trail.length }} km</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Trail Conditions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15l8 -8l4 4l6 -6M6.5 15h-3v-3M19 6v3h3"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-sm font-semibold text-primary mb-1">Terrain Type</h3>
                  <p class="text-xs text-gray-500">{{ trail.terrainType || 'Mixed terrain with some rocky sections and well-maintained paths.' }}</p>
                </div>
              </div>
              
              <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c-4.4 0 -8 3.6 -8 8s3.6 8 8 8s8 -3.6 8 -8s-3.6 -8 -8 -8M12 11l0 -8M12 12l3.535 -3.535"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-sm font-semibold text-primary mb-1">Best Time to Visit</h3>
                  <p class="text-xs text-gray-500">{{ trail.bestTimeToVisit || 'Spring through Fall. Summer can be hot, consider early morning hikes.' }}</p>
                </div>
              </div>
              
              <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7l2 -2M15 3h4v4M19 21l-4 -4l4 -4M7 9l-2 2M3 9h4v4M3 3l4 4L3 11M7 15l-2 2M3 15h4v4M12 16a4 4 0 1 0 0 -8a4 4 0 0 0 0 8z"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-sm font-semibold text-primary mb-1">Water Sources</h3>
                  <p class="text-xs text-gray-500">{{ trail.waterSources || 'Limited. Bring at least 2 liters of water per person.' }}</p>
                </div>
              </div>
              
              <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c-1 -1.5 -2 -3 -2 -4.5c0 -2.5 2 -4.5 4.5 -4.5s4.5 2 4.5 4.5c0 1.5 -1 3 -2 4.5M15 13a6 6 0 1 0 -6 6h6"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-sm font-semibold text-primary mb-1">Cell Reception</h3>
                  <p class="text-xs text-gray-500">{{ trail.cellReception || 'Spotty. Download maps for offline use before your hike.' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- New sections: Recommended campsites -->
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Recommended Campsites</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Campsite 1 -->
              <div class="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                <h3 class="font-semibold text-primary-600 mb-1">Pine Valley Camp</h3>
                <div class="flex items-center text-sm text-gray-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6l-6 6"/>
                  </svg>
                  <span>2.4 km from trailhead</span>
                </div>
                <p class="text-xs text-gray-600 mb-2">Family-friendly campsite with picnic tables and fire rings. Water available on-site.</p>
                <div class="flex items-center justify-between">
                  <div class="flex">
                    <span class="text-yellow-400">★★★★</span><span class="text-gray-300">★</span>
                  </div>
                  <span class="text-xs text-gray-500">$15/night</span>
                </div>
              </div>
              
              <!-- Campsite 2 -->
              <div class="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                <h3 class="font-semibold text-primary-600 mb-1">Riverside Retreat</h3>
                <div class="flex items-center text-sm text-gray-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6l-6 6"/>
                  </svg>
                  <span>5.1 km along trail</span>
                </div>
                <p class="text-xs text-gray-600 mb-2">Secluded spots along the river. Limited facilities. Pack in, pack out.</p>
                <div class="flex items-center justify-between">
                  <div class="flex">
                    <span class="text-yellow-400">★★★★★</span>
                  </div>
                  <span class="text-xs text-gray-500">Free (permit req.)</span>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-sm text-gray-500 italic">
              Note: Campsite information will be updated regularly with our upcoming campsite API.
            </div>
          </div>
          
          <!-- Recommended gear/items -->
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Recommended Gear</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-start">
                <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5"/>
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-primary-600 mb-1">Essential Gear</h3>
                  <ul class="text-xs text-gray-600 space-y-1 list-disc ml-4">
                    <li>Hiking boots with good ankle support</li>
                    <li>Trekking poles for steep sections</li>
                    <li>Minimum 2L water capacity</li>
                    <li>Sun protection (hat, sunscreen)</li>
                    <li>First aid kit</li>
                  </ul>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8a5 5 0 0 0 5 -5v-3a3 3 0 0 0 -3 -3h-1v-2a5 5 0 0 0 -5 -5h-4a5 5 0 0 0 -5 5v2h-1a3 3 0 0 0 -3 3v3a5 5 0 0 0 5 5z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-primary-600 mb-1">Weather-Specific</h3>
                  <ul class="text-xs text-gray-600 space-y-1 list-disc ml-4">
                    <li>Rain jacket (even in summer)</li>
                    <li>Insulated layer for early morning starts</li>
                    <li>Bug repellent (high season)</li>
                    <li>Microspikes (winter/early spring)</li>
                    <li>Gaiters for muddy sections</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="font-semibold text-primary-600 mb-2">Recommended Navigation</h3>
              <div class="flex flex-wrap gap-3">
                <div class="bg-gray-100 rounded-md px-3 py-1.5 text-xs text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1 text-primary">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l6-3l6 3l6-3v13l-6 3l-6-3l-6 3V7z M9 4v13 M15 7v13"/>
                  </svg>
                  Trekk Offline Maps
                </div>
                <div class="bg-gray-100 rounded-md px-3 py-1.5 text-xs text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1 text-primary">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18.5l-3-1.5l-6 3v-13l6-3l6 3l6-3v7.5 M9 4v13 M15 7v5.5 M18 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M20.2 20.2l1.8 1.8"/>
                  </svg>
                  GPS Device
                </div>
                <div class="bg-gray-100 rounded-md px-3 py-1.5 text-xs text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1 text-primary">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1 -1.8 -1"/>
                  </svg>
                  Compass
                </div>
                <div class="bg-gray-100 rounded-md px-3 py-1.5 text-xs text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="mr-1 text-primary">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.875 12C19.875 12 19.875 12 19.875 12C19.875 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 4.125 16.5563 4.125 12C4.125 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 19.875 7.44365 19.875 12Z"/>
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.75V12L15 15"/>
                  </svg>
                  Portable Charger
                </div>
              </div>
            </div>
          </div>
          
          <!-- Seasonal Information -->
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Seasonal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-primary-600 mb-3">Best Seasons</h3>
                <div class="flex mb-4">
                  <div class="flex-1 text-center">
                    <div class="rounded-md h-3 mx-2 mb-1" :class="{ 'bg-green-500': true, 'bg-gray-200': false }"></div>
                    <div class="text-xs font-medium">Spring</div>
                  </div>
                  <div class="flex-1 text-center">
                    <div class="rounded-md h-3 mx-2 mb-1" :class="{ 'bg-green-500': true, 'bg-gray-200': false }"></div>
                    <div class="text-xs font-medium">Summer</div>
                  </div>
                  <div class="flex-1 text-center">
                    <div class="rounded-md h-3 mx-2 mb-1" :class="{ 'bg-green-500': true, 'bg-gray-200': false }"></div>
                    <div class="text-xs font-medium">Fall</div>
                  </div>
                  <div class="flex-1 text-center">
                    <div class="rounded-md h-3 mx-2 mb-1" :class="{ 'bg-green-500': false, 'bg-gray-200': true }"></div>
                    <div class="text-xs font-medium">Winter</div>
                  </div>
                </div>
                
                <div class="text-xs text-gray-600 mb-4">
                  <p>This trail is best experienced from late spring through early fall. Wildflowers peak in June, while fall colors are spectacular in late September.</p>
                </div>
                
                <h3 class="font-semibold text-primary-600 mb-2">Weather Considerations</h3>
                <div class="text-xs text-gray-600 space-y-2">
                  <p><span class="font-medium">Summer:</span> Temperatures can reach 85°F (29°C) at lower elevations. Start early to avoid afternoon heat.</p>
                  <p><span class="font-medium">Fall:</span> Cooler temperatures but variable weather. Bring layers and check forecast.</p>
                  <p><span class="font-medium">Winter:</span> Not recommended due to snow coverage and avalanche risk.</p>
                </div>
              </div>
              
              <div>
                <h3 class="font-semibold text-primary-600 mb-3">Trail Conditions by Season</h3>
                <div class="mb-4">
                  <div class="flex justify-between text-xs font-medium mb-1">
                    <span>Spring</span>
                    <span>Muddy sections, snow at higher elevations until May</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-yellow-500 h-1.5 rounded-full" style="width: 70%"></div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="flex justify-between text-xs font-medium mb-1">
                    <span>Summer</span>
                    <span>Dry, excellent conditions</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-green-500 h-1.5 rounded-full" style="width: 95%"></div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="flex justify-between text-xs font-medium mb-1">
                    <span>Fall</span>
                    <span>Variable weather, stunning foliage</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-green-500 h-1.5 rounded-full" style="width: 90%"></div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="flex justify-between text-xs font-medium mb-1">
                    <span>Winter</span>
                    <span>Snow-covered, advanced skills required</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-red-500 h-1.5 rounded-full" style="width: 30%"></div>
                  </div>
                </div>
                
                <div class="text-xs text-gray-500 italic mt-4">
                  Trail conditions updated monthly and after significant weather events.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Wildlife & Nature -->
          <div class="bg-white rounded-lg p-6 shadow-lg border border-gray-100 mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Wildlife & Nature</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-primary-600 mb-2">Flora Highlights</h3>
                <ul class="text-xs text-gray-600 space-y-1.5">
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Alpine wildflowers (peak in June-July)
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Old-growth pine forest
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Riparian vegetation near creek crossings
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Aspen groves with spectacular fall colors
                  </li>
                </ul>
                
                <h3 class="font-semibold text-primary-600 mb-2 mt-4">Geological Features</h3>
                <p class="text-xs text-gray-600">
                  This trail passes through spectacular granite formations, with dramatic viewpoints overlooking glacier-carved valleys. Several sections feature exposed bedrock dating back millions of years.
                </p>
              </div>
              
              <div>
                <h3 class="font-semibold text-primary-600 mb-2">Wildlife Viewing</h3>
                <p class="text-xs text-gray-600 mb-3">
                  This area is home to diverse wildlife. Keep your distance and never feed wild animals.
                </p>
                <ul class="text-xs text-gray-600 space-y-1.5">
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Black bears (active spring-fall)
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Mule deer (common year-round)
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Golden eagles (look skyward at higher elevations)
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Various songbirds (best viewing at dawn)
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-5">
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="text-yellow-600 mr-2 flex-shrink-0 mt-0.5">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v.01m-1-13.27l-7.5 7.5a2.12 2.12 0 0 0 0 3l3.5 3.5a2.12 2.12 0 0 0 3 0l7.5-7.5a2.12 2.12 0 0 0 0-3l-3.5-3.5a2.12 2.12 0 0 0-3 0z"/>
                </svg>
                <div class="flex-grow">
                  <h3 class="text-sm font-semibold text-primary-600 mb-1">Wildlife Safety</h3>
                  <p class="text-xs text-gray-600">Store food properly and make noise while hiking to avoid surprising wildlife. Carry bear spray in bear country and know how to use it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="bg-white rounded-lg p-6 shadow-md mb-6">
            <h2 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Reviews</h2>
            
            <RatingList 
              :trail-id="trail.id" 
              :show-filters="true"
              :show-pagination="false"
              :items-per-page="5"
              @ratings-updated="onRatingsUpdated"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!trail" class="flex flex-col items-center justify-center h-[300px] text-gray-500">
      <!-- Content-specific loading spinner (not a full-page loader) -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <LoadingSpinner 
          ref="loadingSpinnerRef"
          :loading="isContentLoading" 
          :show-progress="true"
          :external-control="true"
          initial-progress-text="Loading trail details..." 
        />
      </div>
    </div>
    
    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-semibold mb-4">Rate This Trail</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div class="flex gap-2">
            <button 
              v-for="i in 5" 
              :key="i"
              @click="reviewForm.rating = i"
              class="text-2xl" 
              :class="{ 'text-yellow-400': i <= reviewForm.rating, 'text-gray-300': i > reviewForm.rating }"
            >
              ★
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="comment" class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea 
            id="comment"
            v-model="reviewForm.comment"
            rows="3"
            class="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Share your experience..."
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label for="tips" class="block text-sm font-medium text-gray-700 mb-1">Tips for Other Hikers</label>
          <textarea 
            id="tips"
            v-model="reviewForm.tips"
            rows="2"
            class="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Optional tips or advice..."
          ></textarea>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button @click="showReviewModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm">
            Cancel
          </button>
          <button @click="submitReview" class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import LoadingSpinner from '../components/shared/LoadingSpinner.vue';
import RatingList from '../components/ratings/RatingList.vue';
import TrailActions from '../components/trails/TrailActions.vue';
import { useRoute, useRouter } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Trail } from '../types/trail';
import { apiService } from '../services/apiService';
import { useAuth } from '../composables/useAuth';
import { getMapboxToken } from '../lib/mapTokenHelper';
import { getTrailImageUrl, getDefaultTrailImage } from '../utils/imageUtils';

const route = useRoute();
const router = useRouter();
const trailMapContainer = ref<HTMLElement | null>(null);
const elevationProfileContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;
let is3D = ref(true);

// Define loading steps with progress percentages
const LOADING_STEPS = {
  START: { progress: 5, text: 'Initializing...' },
  FETCH_TRAIL: { progress: 40, text: 'Loading trail data...' },
  PREPARE_MAP: { progress: 70, text: 'Preparing map...' },
  COMPLETE: { progress: 100, text: 'Ready!' }
};

// Trail data
const trail = ref<Trail | null>(null);
const isContentLoading = ref(true); // Renamed to avoid conflict with global loading
const loadingSpinnerRef = ref<InstanceType<typeof LoadingSpinner> | null>(null);

// Helper function for safely updating content loading progress
function updateContentProgress(progress: number, text: string): void {
  if (loadingSpinnerRef.value && isContentLoading.value) {
    loadingSpinnerRef.value.updateProgress(progress, text);
  }
}

// Authentication state
const { isLoggedIn } = useAuth();

// Generate trail image URL using consistent pattern:
// 1. Check if trail exists
// 2. Use trail's imageUrl if available
// 3. Otherwise generate a URL using the trail ID for consistency across the app
const trailImageUrl = computed(() => {
  if (!trail.value) {
    return getDefaultTrailImage(1200, 600);
  }
  
  // Always use our utility function to ensure unique, consistent images
  return getTrailImageUrl(trail.value.id, 1200, 600, { blur: 1 });
});

// Review form
const showReviewModal = ref(false);
const submitting = ref(false);
const reviewForm = ref({
  rating: 0,
  comment: '',
  tips: '',
  photos: [] as string[]
});

// Load trail data - This will run after RouterViewWrapper completes its loading
onMounted(async () => {
  const trailId = route.params.id as string;
  isContentLoading.value = true;
  
  try {
    // Start - 5%
    updateContentProgress(LOADING_STEPS.START.progress, LOADING_STEPS.START.text);
    
    // Short delay to show initial state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Fetch trail data - 40%
    updateContentProgress(LOADING_STEPS.FETCH_TRAIL.progress, LOADING_STEPS.FETCH_TRAIL.text);
    
    // Load trail data from API
    const trailData = await apiService.getTrailById(trailId);
    trail.value = trailData;
    
    // Prepare map - 70%
    updateContentProgress(LOADING_STEPS.PREPARE_MAP.progress, LOADING_STEPS.PREPARE_MAP.text);
    
    // Initialize map after data is loaded
    initializeMap();
    
    // Complete - 100%
    updateContentProgress(LOADING_STEPS.COMPLETE.progress, LOADING_STEPS.COMPLETE.text);
    
    // Small delay to show completion state
    await new Promise(resolve => setTimeout(resolve, 300));
    
  } catch (error) {
    console.error('Failed to load trail details:', error);
    // Show error in loading spinner
    updateContentProgress(100, 'Error loading trail details');
  } finally {
    // Add slight delay before hiding loading spinner
    setTimeout(() => {
      isContentLoading.value = false;
    }, 200);
  }
});

// Clean up when component is destroyed
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Initialize map
const initializeMap = () => {
  if (!trailMapContainer.value || !trail.value?.coordinates) return;
  
  // Get and decode Mapbox token from environment
  mapboxgl.accessToken = getMapboxToken();
  
  map = new mapboxgl.Map({
    container: trailMapContainer.value,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: trail.value?.coordinates?.[0]?.slice(0, 2) as [number, number] || [0, 0],
    zoom: 12,
    pitch: 60,
    bearing: 0,
    projection: { name: 'mercator' },
    antialias: true,
  });

  map.on('load', () => {
    if (!map || !trail.value?.coordinates) return;
    
    // Add 3D terrain
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
    });

    // Add sky layer for realistic 3D
    map.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15,
      },
    });

    // Add trail source
    map.addSource('trail', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trail.value.coordinates,
          },
        }],
      },
    });

    // Add trail layer
    map.addLayer({
      id: 'trail-path',
      type: 'line',
      source: 'trail',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#5D85A6',
        'line-width': 4,
      },
    });

    // Add markers for start and end points
    if (trail.value?.coordinates?.length) {
      const startCoords = trail.value.coordinates[0]?.slice(0, 2) as [number, number];
      const endCoords = trail.value.coordinates[trail.value.coordinates.length - 1]?.slice(0, 2) as [number, number];
      
      if (startCoords) {
        new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(startCoords)
          .addTo(map);
      }
      
      if (endCoords) {
        new mapboxgl.Marker({ color: '#F44336' })
          .setLngLat(endCoords)
          .addTo(map);
      }
    }
    
    // Fit map to trail bounds
    const bounds = new mapboxgl.LngLatBounds();
    trail.value?.coordinates?.forEach(coord => {
      bounds.extend([coord[0], coord[1]] as [number, number]);
    });
    
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  });
};

// Center map on trail
const centerMap = () => {
  if (!map || !trail.value?.coordinates) return;
  
  const bounds = new mapboxgl.LngLatBounds();
  trail.value?.coordinates?.forEach(coord => {
    bounds.extend([coord[0], coord[1]] as [number, number]);
  });
  
  map.fitBounds(bounds, {
    padding: 50,
    duration: 1000,
  });
};

// Toggle 3D mode
const toggle3D = () => {
  if (!map) return;
  
  is3D.value = !is3D.value;
  
  if (is3D.value) {
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    map.setPitch(60);
  } else {
    map.setTerrain(null);
    map.setPitch(0);
    
    // Update trail source with 2D coordinates when switching to 2D mode
    if (map.getSource('trail') && trail.value?.coordinates) {
      const source = map.getSource('trail') as mapboxgl.GeoJSONSource;
      const features = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trail.value.coordinates.map(coord => [coord[0], coord[1]]),
          },
        }]
      };
      source.setData(features as any);
    }
  }
};

// Calculate average rating
const getAverageRating = (trail: Trail): string => {
  if (!trail.reviews || trail.reviews.length === 0) return 'N/A';
  
  const sum = trail.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / trail.reviews.length).toFixed(1);
};

// Open review form modal
const openReviewForm = () => {
  reviewForm.value = {
    rating: 0,
    comment: '',
    tips: '',
    photos: []
  };
  showReviewModal.value = true;
};

// Navigate back to map view
const backToMap = () => {
  if (trail.value) {
    // Navigate to map view with trail ID as query parameter
    router.push({
      path: '/map',
      query: { trail: trail.value.id }
    });
  } else {
    // If no trail, just go to map
    router.push('/map');
  }
};

// Handle ratings updates
const onRatingsUpdated = async () => {
  if (!trail.value) return;
  
  try {
    // Refresh trail data to show updated ratings
    const trailData = await apiService.getTrailById(trail.value.id);
    trail.value = trailData;
  } catch (error) {
    console.error('Failed to refresh trail data:', error);
  }
};

// Handle wishlist updates
const onWishlistUpdated = (inWishlist: boolean) => {
  console.log(`Trail ${inWishlist ? 'added to' : 'removed from'} wishlist`);
  // Could add a toast notification here in a real implementation
};

// Submit review
const submitReview = async () => {
  if (!trail.value || reviewForm.value.rating === 0) return;
  
  submitting.value = true;
  
  try {
    const success = await apiService.submitRating(
      trail.value.id,
      reviewForm.value.rating,
      reviewForm.value.comment,
      reviewForm.value.tips,
      reviewForm.value.photos
    );
    
    if (success) {
      // Refresh trail data to show new review
      await onRatingsUpdated();
      showReviewModal.value = false;
    }
  } catch (error) {
    console.error('Failed to submit review:', error);
  } finally {
    submitting.value = false;
  }
};
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

<template>
  <div class="flex flex-col bg-background min-h-screen">
    <MetaTags />
    <header class="bg-primary-600 text-white shadow-md sticky top-0 z-50">
      <div class="container py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-2xl font-bold tracking-tight text-white hover:text-white hover:underline">
            Trekk
          </router-link>
          
          <nav class="flex items-center space-x-4 sm:space-x-6">
            <router-link 
              to="/" 
              class="text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md font-medium relative nav-link"
              :class="{ 'active': $route.path === '/' }"
            >
              Home
            </router-link>
            <router-link 
              to="/trails" 
              class="text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md font-medium relative nav-link"
              :class="{ 'active': $route.path.startsWith('/trails') }"
            >
              Trails
            </router-link>
            <router-link 
              to="/map" 
              class="text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md font-medium relative nav-link"
              :class="{ 'active': $route.path.startsWith('/map') }"
            >
              Map
            </router-link>
            
            <!-- Hub link (only for logged in users) -->
            <router-link 
              v-if="isLoggedIn"
              to="/hub" 
              class="text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md font-medium relative nav-link"
              :class="{ 'active': $route.path.startsWith('/hub') }"
            >
              Hub
            </router-link>
            
            <!-- Authentication links -->
            <template v-if="isLoggedIn">
              <router-link 
                to="/profile" 
                class="flex items-center gap-2 text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md relative nav-link"
                :class="{ 'active': $route.path.startsWith('/profile') }"
              >
                <span class="hidden sm:inline text-sm font-medium">{{ userProfile?.displayName || 'Profile' }}</span>
                <div class="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white font-medium overflow-hidden">
                  <span v-if="!userProfile?.avatarUrl">
                    {{ (userProfile?.displayName?.[0] || 'U').toUpperCase() }}
                  </span>
                  <img 
                    v-else 
                    :src="userProfile.avatarUrl" 
                    :alt="userProfile.displayName || 'User'" 
                    class="h-full w-full object-cover"
                  />
                </div>
              </router-link>
            </template>
            <template v-else>
              <router-link 
                to="/login" 
                class="text-white hover:text-white hover:bg-white/20 px-2 py-1 rounded-md font-medium relative nav-link"
                :class="{ 'active': $route.path.startsWith('/login') || $route.path.startsWith('/forgot-password') || $route.path.startsWith('/reset-password') }"
              >
                Login
              </router-link>
              <router-link 
                to="/signup" 
                class="bg-white text-primary-700 font-medium px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-100 relative"
                :class="{ 'active-signup': $route.path.startsWith('/signup') }"
              >
                Sign Up
              </router-link>
            </template>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="flex-grow overflow-hidden">
      <RouterViewWrapper />
    </main>
    
    <AppFooter v-if="!$route.path.startsWith('/hub')" />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import { useWishlist } from './composables/useWishlist';
import { useGoals } from './composables/useGoals';
import { useRatings } from './composables/useRatings';
import { onMounted, watch } from 'vue';
import MetaTags from './components/shared/MetaTags.vue';
import AppFooter from './components/shared/AppFooter.vue';
import RouterViewWrapper from './components/shared/RouterViewWrapper.vue';

const { isLoggedIn, userProfile, user } = useAuth();
const { fetchUserWishlist } = useWishlist();
const { fetchUserGoals } = useGoals();
const { fetchUserRatings } = useRatings();

// Preload user data when logged in
onMounted(async () => {
  if (isLoggedIn.value) {
    console.log('[DEBUG] Preloading user data on app mount');
    try {
      // Use Promise.all to load data concurrently, but ensure all promises are awaited
      await Promise.all([
        fetchUserWishlist(),
        fetchUserGoals(),
        fetchUserRatings()
      ]);
      console.log('[DEBUG] Initial data loading complete');
    } catch (error) {
      console.error('[DEBUG] Error preloading user data:', error);
    }
  }
});

// Watch for login state changes to preload data
watch(() => isLoggedIn.value, async (newValue) => {
  if (newValue) {
    console.log('[DEBUG] User logged in, preloading data');
    try {
      // Use Promise.all to load data concurrently, but ensure all promises are awaited
      await Promise.all([
        fetchUserWishlist(),
        fetchUserGoals(),
        fetchUserRatings()
      ]);
      console.log('[DEBUG] Login data loading complete');
    } catch (error) {
      console.error('[DEBUG] Error loading user data after login:', error);
    }
  }
});
</script>

<style scoped>
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: white;
  transition: width 0.3s;
  opacity: 0;
}

/* Special styling for signup button */
.active-signup {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
}

/* Ensure content area is always at least viewport height minus header */
main {
  min-height: calc(100vh - 4rem);
}
</style>

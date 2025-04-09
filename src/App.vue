<template>
  <div class="min-h-screen flex flex-col bg-background">
    <MetaTags />
    <header class="bg-primary-600 text-white shadow-md">
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
    
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import MetaTags from './components/shared/MetaTags.vue';

const { isLoggedIn, userProfile } = useAuth();
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
</style>

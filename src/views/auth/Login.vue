<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="section-title mb-2">Sign in to your account</h2>
        <p class="text-sm text-text-light">
          Or
          <router-link to="/signup" class="text-accent hover:text-accent-700">
            create a new account
          </router-link>
        </p>
      </div>
      
      <div v-if="successMsg" class="bg-green-50 p-4 rounded text-sm text-green-700 mb-4">
        {{ successMsg }}
      </div>
      
      <div v-if="errorMsg" class="alert alert-error">
        {{ errorMsg }}
      </div>
      
      <form class="form" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div class="form-group">
            <label for="email" class="form-label">Email address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="form-input"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-6">
          <div class="form-inline">
            <input
              id="remember_me"
              type="checkbox"
              class="form-checkbox"
              v-model="rememberMe"
            />
            <label for="remember_me" class="text-sm text-text">
              Remember me
            </label>
          </div>
          
          <router-link to="/forgot-password" class="text-sm text-accent hover:text-accent-700">
            Forgot your password?
          </router-link>
        </div>
        
        <div class="mt-6">
          <button
            type="submit"
            class="btn w-full"
            :class="{'btn-disabled': loading}"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref(route.query.message as string || '');

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';

  try {
    const { success, error } = await login(email.value, password.value);
    
    if (success) {
      router.push('/');
    } else {
      errorMsg.value = error || 'Failed to login. Please check your credentials.';
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

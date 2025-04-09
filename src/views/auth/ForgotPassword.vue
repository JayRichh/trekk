<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-primary">Forgot Password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <div v-if="status === 'success'" class="bg-green-50 p-4 rounded text-sm text-green-700 mb-4">
        Password reset link sent! Check your email inbox.
      </div>
      
      <div v-if="status === 'error'" class="bg-red-50 p-4 rounded text-sm text-red-700 mb-4">
        {{ errorMsg }}
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-accent text-white rounded disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </div>
        
        <div class="text-center">
          <router-link to="/login" class="text-sm text-accent hover:text-accent-700">
            Return to login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';

const { requestPasswordReset } = useAuth();

const email = ref('');
const loading = ref(false);
const status = ref<'idle' | 'success' | 'error'>('idle');
const errorMsg = ref('');

async function handleSubmit() {
  loading.value = true;
  status.value = 'idle';
  errorMsg.value = '';

  try {
    const { success, error } = await requestPasswordReset(email.value);
    
    if (success) {
      status.value = 'success';
      email.value = ''; // Clear the email field
    } else {
      status.value = 'error';
      errorMsg.value = error || 'Failed to send reset email. Please try again.';
    }
  } catch (error: any) {
    status.value = 'error';
    errorMsg.value = error.message || 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-primary">Reset Password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Create a new password for your account
        </p>
      </div>
      
      <div v-if="status === 'success'" class="bg-green-50 p-4 rounded text-sm text-green-700 mb-4">
        Your password has been updated successfully.
        <div class="mt-2">
          <router-link to="/login" class="text-green-800 hover:text-green-900 font-medium underline">
            Return to login
          </router-link>
        </div>
      </div>
      
      <div v-if="status === 'error'" class="bg-red-50 p-4 rounded text-sm text-red-700 mb-4">
        {{ errorMsg }}
      </div>
      
      <form v-if="status !== 'success'" class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-accent text-white rounded disabled:opacity-50"
            :disabled="loading || !isPasswordValid || !doPasswordsMatch"
          >
            {{ loading ? 'Updating Password...' : 'Reset Password' }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const route = useRoute();
const { updatePassword } = useAuth();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const status = ref<'idle' | 'success' | 'error'>('idle');
const errorMsg = ref('');

// Computed properties for password validation
const isPasswordValid = computed(() => password.value.length >= 8);
const doPasswordsMatch = computed(() => password.value === confirmPassword.value);

// Check for access token in URL
onMounted(() => {
  // Supabase handles the token validation automatically when navigating to this page
  // after clicking the reset password link in email
  
  // Check if we have hash fragment in the URL, which may indicate we're in an iframe
  if (window.location.hash) {
    console.log('Hash fragment detected, this may be part of the Supabase auth flow');
  }
});

async function handleSubmit() {
  if (!isPasswordValid.value) {
    errorMsg.value = 'Password must be at least 8 characters long';
    status.value = 'error';
    return;
  }
  
  if (!doPasswordsMatch.value) {
    errorMsg.value = 'Passwords do not match';
    status.value = 'error';
    return;
  }
  
  loading.value = true;
  status.value = 'idle';
  errorMsg.value = '';

  try {
    const { success, error } = await updatePassword(password.value);
    
    if (success) {
      status.value = 'success';
      // Clear the form
      password.value = '';
      confirmPassword.value = '';
    } else {
      status.value = 'error';
      errorMsg.value = error || 'Failed to update password. The reset link may have expired.';
    }
  } catch (error: any) {
    status.value = 'error';
    errorMsg.value = error.message || 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

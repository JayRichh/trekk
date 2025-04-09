<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-primary">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link to="/login" class="text-accent hover:text-accent-700">
            sign in to existing account
          </router-link>
        </p>
      </div>
      
      <div v-if="errorMsg" class="bg-red-50 p-4 rounded text-sm text-red-700 mb-4">
        {{ errorMsg }}
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="space-y-4">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              id="displayName"
              type="text"
              v-model="displayName"
              required
              class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="Your Name"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div class="flex items-start">
          <input
            id="terms"
            type="checkbox"
            class="h-4 w-4 text-accent border-gray-300 rounded mt-1"
            v-model="agreeToTerms"
            required
          />
          <label for="terms" class="ml-2 block text-sm text-gray-700">
            I agree to the
            <a href="#" class="text-accent hover:text-accent-700">Terms of Service</a>
            and
            <a href="#" class="text-accent hover:text-accent-700">Privacy Policy</a>
          </label>
        </div>
        
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-accent text-white rounded disabled:opacity-50"
            :disabled="loading || !agreeToTerms || !isPasswordValid || !doPasswordsMatch"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const { register } = useAuth();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeToTerms = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const isPasswordValid = computed(() => password.value.length >= 8);
const doPasswordsMatch = computed(() => password.value === confirmPassword.value);

async function handleSignup() {
  if (!isPasswordValid.value) {
    errorMsg.value = 'Password must be at least 8 characters long';
    return;
  }
  
  if (!doPasswordsMatch.value) {
    errorMsg.value = 'Passwords do not match';
    return;
  }
  
  loading.value = true;
  errorMsg.value = '';

  try {
    const { success, error, emailConfirmationSent } = await register(
      email.value, 
      password.value, 
      displayName.value
    );
    
    if (success) {
      if (emailConfirmationSent) {
        // Show success message about email confirmation
        router.push({ 
          path: '/login', 
          query: { 
            message: 'Please check your email to confirm your account before logging in.' 
          } 
        });
      } else {
        // User was created and automatically logged in
        router.push('/');
      }
    } else {
      errorMsg.value = error || 'Failed to create account. Please try again later.';
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

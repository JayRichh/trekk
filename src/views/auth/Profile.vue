<template>
  <div class="min-h-[70vh] py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold text-primary mb-8">Your Profile</h1>
      
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="userProfile" class="bg-white rounded-lg shadow p-6">
        <!-- Display success message when profile is updated -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
        
        <!-- Display prompt to fill in display name if empty -->
        <div v-if="!userProfile.displayName" class="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
          Please set your display name to complete your profile.
        </div>
        
        <div class="flex flex-col sm:flex-row items-start gap-6">
          <div class="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
            <span v-if="!userProfile.avatarUrl" class="text-4xl font-semibold text-gray-500">
              {{ (userProfile.displayName?.[0] || 'U').toUpperCase() }}
            </span>
            <img 
              v-else 
              :src="userProfile.avatarUrl" 
              :alt="userProfile.displayName || 'User'" 
              class="w-full h-full object-cover"
            />
            
            <label 
              class="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              for="avatar-upload"
            >
              <span>Change</span>
            </label>
            <input 
              type="file" 
              id="avatar-upload" 
              class="hidden" 
              accept="image/*"
              @change="handleAvatarUpload"
            />
          </div>
          
          <div class="flex-grow">
            <form @submit.prevent="updateUserProfile" class="space-y-4">
              <div>
                <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input 
                  id="displayName" 
                  type="text" 
                  v-model="form.displayName" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  :value="userProfile.email" 
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div class="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  class="px-4 py-2 bg-accent text-white rounded-md disabled:opacity-50"
                  :disabled="updating"
                >
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="mt-12 pt-6 border-t border-gray-200">
          <h2 class="text-xl font-semibold mb-4">Security</h2>
          
          <button 
            @click="showPasswordModal = true" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Change Password
          </button>
          
          <button 
            @click="handleLogout" 
            class="ml-4 px-4 py-2 bg-red-500 text-white rounded-md text-sm"
            :disabled="loggingOut"
          >
            {{ loggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
      
      <div v-else class="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center">
        <p class="text-yellow-700">You need to be logged in to view your profile.</p>
        <div class="mt-4">
          <router-link to="/login" class="px-4 py-2 bg-accent text-white rounded-md text-sm">
            Sign In
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-semibold mb-4">Change Password</h3>
        
        <div v-if="passwordError" class="bg-red-50 p-4 rounded text-sm text-red-700 mb-4">
          {{ passwordError }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="newPassword"
              type="password"
              v-model="passwordForm.newPassword"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          
          <div>
            <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              v-model="passwordForm.confirmPassword"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button @click="showPasswordModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm">
            Cancel
          </button>
          <button 
            @click="updatePassword" 
            class="px-4 py-2 bg-accent text-white rounded-md text-sm"
            :disabled="updatingPassword || !isPasswordValid || !doPasswordsMatch"
          >
            {{ updatingPassword ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { uploadImage, supabase } from '../../lib/supabase';

const router = useRouter();
const { userProfile, loading: authLoading, isLoggedIn, updateProfile, logout, updatePassword: authUpdatePassword } = useAuth();

const loading = ref(true);
const updating = ref(false);
const loggingOut = ref(false);
const successMessage = ref('');

const form = ref({
  displayName: '',
});

// Avatar upload
const avatarUploading = ref(false);

// Password change
const showPasswordModal = ref(false);
const updatingPassword = ref(false);
const passwordError = ref('');
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
});

// Computed properties for password validation
const isPasswordValid = computed(() => passwordForm.value.newPassword.length >= 8);
const doPasswordsMatch = computed(() => passwordForm.value.newPassword === passwordForm.value.confirmPassword);

// Watch for changes in userProfile
watch(userProfile, (newProfile) => {
  if (newProfile) {
    form.value.displayName = newProfile.displayName || '';
  }
});

onMounted(() => {
  // Use the loading state from useAuth
  loading.value = authLoading.value;
  
  // Set initial form values if userProfile is already loaded
  if (userProfile.value) {
    form.value.displayName = userProfile.value.displayName || '';
  }
  
  // Watch for auth loading state changes
  watch(authLoading, (isLoading) => {
    loading.value = isLoading;
  });
});

async function updateUserProfile() {
  if (!userProfile.value) return;
  
  // Validate input
  if (!form.value.displayName || form.value.displayName.trim() === '') {
    successMessage.value = 'Display name cannot be empty';
    return;
  }
  
  updating.value = true;
  successMessage.value = 'Updating profile...'; // Show immediate feedback
  
  try {
    // Use the updateProfile function from useAuth composable
    const result = await updateProfile({
      displayName: form.value.displayName
    });
    
    if (result.success) {
      if ('warning' in result && result.warning) {
        // Show success but with warning
        successMessage.value = `Profile updated with warning: ${result.warning}`;
        console.warn('Profile update warning:', result.warning);
      } else {
        successMessage.value = 'Profile updated successfully!';
        console.log('Profile updated successfully with display name:', form.value.displayName);
      }
      
      // Set a timer to clear the success message after 3 seconds
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else if (result.error) {
      console.error('Failed to update profile:', result.error);
      successMessage.value = `Failed to update profile: ${result.error || 'Unknown error'}`;
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    successMessage.value = `Error updating profile: ${error?.message || 'Unknown error'}`;
  } finally {
    updating.value = false;
  }
}

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0] || !userProfile.value) return;
  
  avatarUploading.value = true;
  successMessage.value = ''; // Clear any existing message
  
  try {
    const file = input.files[0];
    
    // Show uploading status
    successMessage.value = 'Uploading profile picture...';
    
    // Upload the image to Supabase storage
    const avatarUrl = await uploadImage(file, 'avatars', userProfile.value.id);
    
    if (avatarUrl) {
      console.log('Image uploaded successfully:', avatarUrl);
      
      // Update both local UI and profile in database
      if (!userProfile.value) return;
      
      // Immediately update local UI for better UX
      userProfile.value.avatarUrl = avatarUrl;
      
      // Use the updateProfile function from useAuth
      const result = await updateProfile({ avatarUrl });
      
      if (result.success) {
        if ('warning' in result && result.warning) {
          // Show success but with warning
          successMessage.value = `Profile picture updated with warning: ${result.warning}`;
          console.warn('Profile update warning:', result.warning);
        } else {
          successMessage.value = 'Profile picture updated successfully!';
        }
        
        // Set a timer to clear the success message after 3 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } else if (result.error) {
        console.error('Failed to update profile with avatar URL:', result.error);
        successMessage.value = 'Profile picture uploaded but failed to update profile. Please try again.';
      }
    } else {
      successMessage.value = 'Failed to upload profile picture. Please try again.';
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    successMessage.value = 'An error occurred while uploading. Please try again.';
  } finally {
    avatarUploading.value = false;
  }
}

async function updatePassword() {
  if (!isPasswordValid.value) {
    passwordError.value = 'Password must be at least 8 characters';
    return;
  }
  
  if (!doPasswordsMatch.value) {
    passwordError.value = 'Passwords do not match';
    return;
  }
  
  updatingPassword.value = true;
  passwordError.value = '';
  
  try {
    const { success, error } = await authUpdatePassword(passwordForm.value.newPassword);
    
    if (success) {
      showPasswordModal.value = false;
      passwordForm.value = {
        newPassword: '',
        confirmPassword: ''
      };
    } else {
      passwordError.value = error || 'Failed to update password';
    }
  } catch (error: any) {
    passwordError.value = error.message || 'An unexpected error occurred';
  } finally {
    updatingPassword.value = false;
  }
}

async function handleLogout() {
  loggingOut.value = true;
  
  try {
    await logout();
    router.push('/');
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <footer class="bg-gray-800 text-white/90 mt-auto">
    <div class="container px-4 max-w-7xl mx-auto">
      <!-- Main footer content -->
      <div class="py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div class="md:col-span-1">
          <h3 class="text-2xl font-bold text-white mb-4">TREKK</h3>
          <p class="mb-6 max-w-md text-base leading-relaxed">
            Elevate your hiking experience with interactive 3D maps, detailed trail information, and a community of fellow adventurers.
          </p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul class="space-y-3">
            <li><router-link to="/map" class="text-white/90 hover:text-white transition-colors">Explore Map</router-link></li>
            <li><router-link to="/trails" class="text-white/90 hover:text-white transition-colors">Browse Trails</router-link></li>
            <li><router-link to="/hub" class="text-white/90 hover:text-white transition-colors">My Dashboard</router-link></li>
            <li>
              <button 
                @click="showSuggestionDialog = true" 
                class="text-white/90 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Suggest an Improvement</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-white mb-4">Resources</h4>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/90 hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" class="text-white/90 hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="text-white/90 hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" class="text-white/90 hover:text-white transition-colors">Help Center</a></li>
          </ul>
        </div>
      </div>
      
      <!-- Copyright bar -->
      <div class="py-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm mb-4 md:mb-0">© 2025 Trekk. All rights reserved.</p>
        <div class="flex space-x-6">
          <a href="#" class="text-white/90 hover:text-white transition-colors text-sm">Terms</a>
          <a href="#" class="text-white/90 hover:text-white transition-colors text-sm">Privacy</a>
          <a href="#" class="text-white/90 hover:text-white transition-colors text-sm">Contact</a>
        </div>
      </div>
    </div>
    
    <!-- Suggestion Dialog -->
    <div v-if="showSuggestionDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 text-gray-800">
        <h3 class="text-xl font-bold mb-4">Suggest an Improvement</h3>
        
        <p class="text-gray-600 mb-4">
          We value your feedback! Share your ideas for new features or improvements to make Trekk even better.
        </p>
        
        <div class="mb-4">
          <textarea 
            v-model="suggestion" 
            rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your suggestion..."
          ></textarea>
        </div>
        
        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="mb-4 bg-green-100 text-green-700 p-3 rounded-md text-sm">
          {{ successMessage }}
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            @click="closeDialog" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {{ successMessage ? 'Close' : 'Cancel' }}
          </button>
          <button 
            v-if="!successMessage"
            @click="submitSuggestion" 
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            :disabled="submitting || !suggestion.trim()"
          >
            <span v-if="submitting">Submitting...</span>
            <span v-else>Submit</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSuggestions } from '../../composables/useSuggestions';

const { createSuggestion } = useSuggestions();

const showSuggestionDialog = ref(false);
const suggestion = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function submitSuggestion() {
  if (!suggestion.value.trim()) {
    errorMessage.value = 'Please enter your suggestion';
    return;
  }
  
  submitting.value = true;
  errorMessage.value = '';
  
  try {
    const result = await createSuggestion(suggestion.value);
    
    if (result.success) {
      successMessage.value = 'Thank you for your suggestion! We appreciate your feedback.';
      suggestion.value = '';
    } else {
      errorMessage.value = result.error || 'Failed to submit suggestion. Please try again.';
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.';
    console.error('Error submitting suggestion:', error);
  } finally {
    submitting.value = false;
  }
}

function closeDialog() {
  if (successMessage.value) {
    // Reset everything if we're closing after success
    suggestion.value = '';
    errorMessage.value = '';
    successMessage.value = '';
  }
  showSuggestionDialog.value = false;
}
</script>

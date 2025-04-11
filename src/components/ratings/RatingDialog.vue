<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      ref="dialogContainer"
      class="rating-dialog fixed bg-white rounded-lg shadow-xl z-50 w-full max-w-md"
      :style="{ 
        top: `${position.y}px`, 
        left: `${position.x}px`, 
        transform: 'translate(-50%, -50%)'
      }"
    >
      <div class="p-5">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ isEdit ? 'Edit Rating' : 'Rate This Trail' }}</h3>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
          
        <form @submit.prevent="submitRating">
          <!-- Star Rating -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div class="flex gap-2">
              <button 
                v-for="star in 5" 
                :key="star" 
                type="button"
                @click="form.rating = star"
                class="text-2xl focus:outline-none transition-colors"
                :class="{ 'text-yellow-400': star <= form.rating, 'text-gray-300': star > form.rating }"
              >
                ★
              </button>
            </div>
            <div v-if="errors.rating" class="mt-1 text-red-500 text-xs">{{ errors.rating }}</div>
          </div>
          
          <!-- Comment -->
          <div class="mb-5">
            <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              id="comment"
              v-model="form.comment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Share your experience..."
            ></textarea>
          </div>
          
          <!-- Tips -->
          <div class="mb-5">
            <label for="tips" class="block text-sm font-medium text-gray-700 mb-2">Tips for Other Hikers (Optional)</label>
            <textarea
              id="tips"
              v-model="form.tips"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any advice for fellow hikers?"
            ></textarea>
          </div>
          
          <!-- Image Upload -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Add Photo (Optional)</label>
            <div class="flex items-center gap-4">
              <div v-if="imagePreview || form.image_url" class="relative w-24 h-24 rounded-md overflow-hidden">
                <img :src="imagePreview || form.image_url" alt="Preview" class="w-full h-full object-cover" />
                <button 
                  type="button" 
                  @click="clearImage"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                >
                  <span>×</span>
                </button>
              </div>
              <label 
                v-else
                class="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-xs text-gray-500 mt-1">Upload</p>
                </div>
                <input 
                  type="file" 
                  class="hidden" 
                  accept="image/*"
                  @change="onImageSelected"
                />
              </label>
              
              <div class="text-xs text-gray-500">
                <p>Max file size: 2MB</p>
                <p>Supported formats: JPEG, PNG</p>
              </div>
            </div>
            <div v-if="errors.image" class="mt-1 text-red-500 text-xs">{{ errors.image }}</div>
          </div>
          
          <!-- Error and Success Messages -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {{ errorMessage }}
          </div>
          
          <div v-if="successMessage" class="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {{ successMessage }}
          </div>
          
          <!-- Form Buttons -->
          <div class="flex justify-end gap-3">
            <button 
              type="button" 
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="submitting"
            >
              <span v-if="submitting">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>{{ isEdit ? 'Update Rating' : 'Submit Rating' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="$emit('close')"
    ></div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import { useRatings } from '../../composables/useRatings';

const props = defineProps<{
  show: boolean;
  trailId: string;
  ratingId?: string;
  clickPosition?: { x: number; y: number };
  initialRating?: {
    rating: number;
    comment?: string;
    tips?: string;
    image_url?: string;
  };
}>();

const emit = defineEmits(['close', 'saved']);

const { createRating, updateRating, uploadRatingImage } = useRatings();

const dialogContainer = ref<HTMLElement | null>(null);
const position = reactive({ x: 0, y: 0 });
const submitting = ref(false);
const imagePreview = ref<string | null>(null);
const imageFile = ref<File | null>(null);
const errorMessage = ref('');
const successMessage = ref('');
const errors = reactive({
  rating: '',
  image: ''
});

const form = reactive({
  rating: 0,
  comment: '',
  tips: '',
  image_url: ''
});

const isEdit = computed(() => !!props.ratingId);

// Set form initial values if editing
watch(() => props.initialRating, (newValue) => {
  if (newValue) {
    form.rating = newValue.rating;
    form.comment = newValue.comment || '';
    form.tips = newValue.tips || '';
    form.image_url = newValue.image_url || '';
  } else {
    resetForm();
  }
}, { immediate: true });

// Position the dialog when it's shown
watch(() => props.show, async (newValue) => {
  if (newValue) {
    await nextTick();
    calculatePosition();
  }
});

// Calculate the position of the dialog
function calculatePosition() {
  if (!dialogContainer.value) return;
  
  const dialogRect = dialogContainer.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // If clickPosition is provided, use it
  if (props.clickPosition) {
    let { x, y } = props.clickPosition;
    
    // Adjust if the dialog would go outside the viewport
    if (x - dialogRect.width / 2 < 20) {
      x = dialogRect.width / 2 + 20;
    } else if (x + dialogRect.width / 2 > viewportWidth - 20) {
      x = viewportWidth - dialogRect.width / 2 - 20;
    }
    
    if (y - dialogRect.height / 2 < 20) {
      y = dialogRect.height / 2 + 20;
    } else if (y + dialogRect.height / 2 > viewportHeight - 20) {
      y = viewportHeight - dialogRect.height / 2 - 20;
    }
    
    position.x = x;
    position.y = y;
  } else {
    // Center in viewport if no click position
    position.x = viewportWidth / 2;
    position.y = viewportHeight / 2;
  }
}

// Handle image selection
function onImageSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    errors.image = 'Image must be less than 2MB';
    return;
  }
  
  // Check file type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    errors.image = 'Only JPEG and PNG images are supported';
    return;
  }
  
  errors.image = '';
  imageFile.value = file;
  
  // Create a preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  imageFile.value = null;
  imagePreview.value = null;
  form.image_url = '';
}

function resetForm() {
  form.rating = 0;
  form.comment = '';
  form.tips = '';
  form.image_url = '';
  imageFile.value = null;
  imagePreview.value = null;
  errorMessage.value = '';
  successMessage.value = '';
  errors.rating = '';
  errors.image = '';
}

async function submitRating() {
  // Validate form
  let isValid = true;
  errors.rating = '';
  
  if (form.rating === 0) {
    errors.rating = 'Please select a rating';
    isValid = false;
  }
  
  if (!isValid) return;
  
  submitting.value = true;
  errorMessage.value = '';
  
  try {
    // Handle image upload if there is a new image
    let imageUrl = form.image_url;
    if (imageFile.value) {
      const uploadResult = await uploadRatingImage(imageFile.value);
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url;
      } else {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }
    }
    
    // Create or update the rating
    const ratingData = {
      trail_id: props.trailId,
      rating: form.rating,
      comment: form.comment,
      tips: form.tips,
      image_url: imageUrl
    };
    
    let result;
    if (isEdit.value && props.ratingId) {
      result = await updateRating(props.ratingId, ratingData);
    } else {
      result = await createRating(ratingData);
    }
    
    if (result.success) {
      successMessage.value = isEdit.value 
        ? 'Your rating has been updated successfully!' 
        : 'Your rating has been submitted successfully!';
      
      // Emit the saved event with the result
      emit('saved', result.data);
      
      // Close dialog after a short delay
      setTimeout(() => {
        emit('close');
        resetForm();
      }, 1500);
    } else {
      throw new Error(result.error || 'Failed to save rating');
    }
  } catch (error) {
    console.error('Error saving rating:', error);
    errorMessage.value = typeof error === 'object' && error !== null && 'message' in error
      ? (error.message as string)
      : 'An unexpected error occurred. Please try again.';
  } finally {
    submitting.value = false;
  }
}

// Ensure the dialog is properly positioned when mounted
onMounted(() => {
  if (props.show) {
    calculatePosition();
  }
});
</script>

<style scoped>
.rating-dialog {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

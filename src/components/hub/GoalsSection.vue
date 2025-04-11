<template>
  <DashboardCard title="My Goals" content-type="goals" section-id="goals" :loading="loading" :error="error">
    <div v-if="goals.length === 0" class="flex flex-col items-center justify-center h-full text-center py-6">
      <div class="text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <p class="text-gray-500 mb-4">You haven't set any hiking goals yet</p>
      <button
        @click="showAddGoalForm = true"
        class="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
      >
        Create a Goal
      </button>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2">
          <button 
            @click="activeFilter = 'all'"
            class="px-2 py-1 rounded-md text-sm"
            :class="activeFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
          >
            All
          </button>
          <button 
            @click="activeFilter = 'pending'"
            class="px-2 py-1 rounded-md text-sm"
            :class="activeFilter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'"
          >
            Pending
          </button>
          <button 
            @click="activeFilter = 'in_progress'"
            class="px-2 py-1 rounded-md text-sm"
            :class="activeFilter === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'"
          >
            In Progress
          </button>
          <button 
            @click="activeFilter = 'completed'"
            class="px-2 py-1 rounded-md text-sm"
            :class="activeFilter === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'"
          >
            Completed
          </button>
        </div>
        <button
          @click="showAddGoalForm = true"
          class="text-primary-600 hover:text-primary-800"
        >
          + New Goal
        </button>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="goal in filteredGoals"
          :key="goal.id"
          class="border border-gray-100 rounded-md p-3 bg-white hover:shadow-sm transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium">{{ goal.title }}</h4>
            <div 
              class="text-xs px-2 py-0.5 rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-700': goal.status === 'pending',
                'bg-blue-100 text-blue-700': goal.status === 'in_progress',
                'bg-green-100 text-green-700': goal.status === 'completed'
              }"
            >
              {{ formatStatus(goal.status) }}
            </div>
          </div>
          
          <p v-if="goal.description" class="text-sm text-gray-600 mb-2">{{ goal.description }}</p>
          
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <div>{{ formatGoalType(goal.type) }}</div>
            <div v-if="goal.target_date">Target: {{ formatDate(goal.target_date) }}</div>
          </div>
          
          <div class="flex justify-end gap-2 mt-2">
            <button
              v-if="goal.status !== 'completed'"
              @click="updateGoalStatus(goal.id, 'completed')"
              class="text-xs text-green-600 hover:text-green-800"
            >
              Mark Complete
            </button>
            <button
              v-if="goal.status === 'pending'"
              @click="updateGoalStatus(goal.id, 'in_progress')"
              class="text-xs text-blue-600 hover:text-blue-800"
            >
              Start
            </button>
            <button
              @click="confirmDelete(goal)"
              class="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Goal Modal -->
    <div v-if="showAddGoalForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
        <h3 class="text-lg font-bold mb-4">Create New Goal</h3>
        
        <div class="space-y-4">
          <div>
            <label for="goal-title" class="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
            <input
              id="goal-title"
              v-model="newGoal.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="E.g., Hike 100 miles this year"
            />
          </div>
          
          <div>
            <label for="goal-description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              id="goal-description"
              v-model="newGoal.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Additional details about your goal"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="goal-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="goal-type"
                v-model="newGoal.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="distance">Distance</option>
                <option value="elevation">Elevation</option>
                <option value="completion">Trail Completion</option>
                <option value="visit">Location Visit</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label for="goal-target-date" class="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
              <input
                id="goal-target-date"
                v-model="newGoal.target_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button 
            @click="showAddGoalForm = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="createNewGoal"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            :disabled="!newGoal.title"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-bold mb-3">Delete Goal</h3>
        <p class="mb-4">Are you sure you want to delete this goal? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteSelectedGoal"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGoals, type Goal } from '../../composables/useGoals';
import { useAuth } from '../../composables/useAuth';
import DashboardCard from './DashboardCard.vue';

const { goals, loading, error, fetchUserGoals, createGoal, updateGoalStatus: updateStatus, deleteGoal } = useGoals();
const { isLoggedIn } = useAuth();

const showAddGoalForm = ref(false);
const showDeleteConfirm = ref(false);
const goalToDelete = ref<Goal | null>(null);
const activeFilter = ref('all');

const newGoal = ref({
  title: '',
  description: '',
  type: 'distance',
  status: 'pending',
  target_date: '',
  meta: null
});

const filteredGoals = computed(() => {
  if (activeFilter.value === 'all') {
    return goals.value;
  }
  return goals.value.filter(goal => goal.status === activeFilter.value);
});

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUserGoals();
  }
});

// Watch for changes in auth state
watch(() => isLoggedIn.value, async (newValue) => {
  if (newValue) {
    await fetchUserGoals();
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return status;
  }
}

function formatGoalType(type: string): string {
  switch (type) {
    case 'distance': return 'Distance Goal';
    case 'elevation': return 'Elevation Goal';
    case 'completion': return 'Trail Completion';
    case 'visit': return 'Visit Location';
    default: return 'Other Goal';
  }
}

async function createNewGoal() {
  if (!newGoal.value.title) return;
  
  const goalData = {
    ...newGoal.value,
    status: 'pending',
    target_date: newGoal.value.target_date || null,
  };
  
  const result = await createGoal(goalData);
  
  if (result.success) {
    // Clear form and close modal
    newGoal.value = {
      title: '',
      description: '',
      type: 'distance',
      status: 'pending',
      target_date: '',
      meta: null
    };
    showAddGoalForm.value = false;
  } else {
    console.error('Failed to create goal:', result.error);
  }
}

async function updateGoalStatus(id: string, status: Goal['status']) {
  const result = await updateStatus(id, status);
  
  if (!result.success) {
    console.error('Failed to update goal status:', result.error);
  }
}

function confirmDelete(goal: Goal) {
  goalToDelete.value = goal;
  showDeleteConfirm.value = true;
}

async function deleteSelectedGoal() {
  if (!goalToDelete.value) return;
  
  const result = await deleteGoal(goalToDelete.value.id);
  
  if (result.success) {
    showDeleteConfirm.value = false;
    goalToDelete.value = null;
  } else {
    console.error('Failed to delete goal:', result.error);
  }
}
</script>

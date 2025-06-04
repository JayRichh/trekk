import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'distance' | 'elevation' | 'completion' | 'visit' | string;
  status: 'pending' | 'in_progress' | 'completed' | string;
  target_date: string | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export type GoalCreate = Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type GoalUpdate = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export function useGoals() {
  const { user } = useAuth();
  const goals = ref<Goal[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const trailGoalsCache = ref<Record<string, string>>({});

  // Fetch all goals for the current user
  const fetchUserGoals = async () => {
    if (!user.value) return;
    
    loading.value = true;
    error.value = null;
    console.log(`[DEBUG] fetchUserGoals: Using mock data for debugging`);
    
    try {
      // Return mock goals data
      const mockGoalsData: Goal[] = [
        {
          id: 'mock-goal-1',
          user_id: user.value?.id || 'mock-user',
          title: 'Hike 100 miles this year',
          description: 'Complete at least 100 miles of hiking by the end of the year',
          type: 'distance',
          status: 'in_progress',
          target_date: new Date(new Date().getFullYear(), 11, 31).toISOString(), // Dec 31 current year
          meta: { current_distance: 45, target_distance: 100 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-goal-2',
          user_id: user.value?.id || 'mock-user',
          title: 'Complete Alpine Lake Loop',
          description: 'Hike the entire Alpine Lake Loop trail',
          type: 'completion',
          status: 'pending',
          target_date: null,
          meta: { trail_id: 'trail-1' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-goal-3',
          user_id: user.value?.id || 'mock-user',
          title: 'Climb 5,000 feet of elevation',
          description: 'Reach cumulative elevation gain of 5,000 feet',
          type: 'elevation',
          status: 'completed',
          target_date: null,
          meta: { current_elevation: 5200, target_elevation: 5000 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log(`[DEBUG] fetchUserGoals: Using ${mockGoalsData.length} mock goal items`);
      goals.value = mockGoalsData;
      
      // Update trailGoalsCache for any completion goals with trail_id in meta
      mockGoalsData.forEach(goal => {
        if (goal.type === 'completion' && goal.meta?.trail_id) {
          trailGoalsCache.value[goal.meta.trail_id] = goal.id;
        }
      });
      
      console.log(`[DEBUG] fetchUserGoals: Mock goal data ready`);
    } catch (err: any) {
      console.error('Error setting mock goals:', err);
      error.value = err.message || 'Failed to set mock goals';
    } finally {
      loading.value = false;
    }
  };
  
  // Create a new goal
  const createGoal = async (goalData: GoalCreate) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`[DEBUG] Mock client: Would create goal "${goalData.title}"`);
      
      // Create a mock goal with generated ID
      const mockGoal: Goal = {
        id: `mock-goal-${Date.now()}`,
        user_id: user.value.id,
        ...goalData,
        // Ensure defaults for nullable fields
        description: goalData.description || '',
        target_date: goalData.target_date || null,
        meta: goalData.meta || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to local state
      goals.value = [mockGoal, ...goals.value];
      
      // If it's a trail completion goal, add to cache
      if (mockGoal.type === 'completion' && mockGoal.meta?.trail_id) {
        trailGoalsCache.value[mockGoal.meta.trail_id] = mockGoal.id;
      }
      
      return { success: true, data: mockGoal };
    } catch (err: any) {
      console.error('Error creating goal:', err);
      error.value = err.message || 'Failed to create goal';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Update an existing goal
  const updateGoal = async (id: string, updates: GoalUpdate) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`[DEBUG] Mock client: Would update goal ${id} with:`, updates);
      
      // Update local state
      const index = goals.value.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = goals.value[index];
      if (!currentGoal) {
        throw new Error('Goal not found');
      }
      
      // Create updated goal object
      const updatedGoal: Goal = {
        ...currentGoal,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      goals.value[index] = updatedGoal;
      
      return { success: true, data: updatedGoal };
    } catch (err: any) {
      console.error('Error updating goal:', err);
      error.value = err.message || 'Failed to update goal';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a goal
  const deleteGoal = async (id: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`[DEBUG] Mock client: Would delete goal ${id}`);
      
      // Get the goal before deleting to check if it's a trail goal
      const goalToDelete = goals.value.find(g => g.id === id);
      
      // Update local state
      goals.value = goals.value.filter(g => g.id !== id);
      
      // If it was a trail completion goal, remove from cache
      if (goalToDelete && goalToDelete.type === 'completion' && goalToDelete.meta?.trail_id) {
        delete trailGoalsCache.value[goalToDelete.meta.trail_id];
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      error.value = err.message || 'Failed to delete goal';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Update goal status
  const updateGoalStatus = async (id: string, status: Goal['status']) => {
    return updateGoal(id, { status });
  };
  
  // Get goal statistics
  const getGoalStats = () => {
    const completed = goals.value.filter(g => g.status === 'completed').length;
    const inProgress = goals.value.filter(g => g.status === 'in_progress').length;
    const pending = goals.value.filter(g => g.status === 'pending').length;
    const total = goals.value.length;
    
    return {
      completed,
      inProgress,
      pending,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };
  
  // Check if a trail is in user's goals
  const hasTrailGoal = async (trailId: string): Promise<boolean> => {
    if (!user.value) return false;
    
    console.log(`[DEBUG] Checking if trail ${trailId} is in goals for user ${user.value.id}`);
    
    // Check cache first
    if (trailId in trailGoalsCache.value) {
      console.log(`[DEBUG] Trail found in goals cache with ID ${trailGoalsCache.value[trailId]}`);
      return true;
    }
    
    // Make sure goals are loaded
    if (goals.value.length === 0) {
      console.log(`[DEBUG] No local goals state, loading mock goals`);
      await fetchUserGoals();
    }
    
    // Check if we have goals loaded already
    const trailGoal = goals.value.find(g => 
      g.type === 'completion' && 
      g.meta && 
      g.meta.trail_id === trailId
    );
    
    if (trailGoal) {
      console.log(`[DEBUG] Trail found in local goals state with ID ${trailGoal.id}`);
      trailGoalsCache.value[trailId] = trailGoal.id;
      return true;
    }
    
    console.log(`[DEBUG] Trail not found in local goals state`);
    return false;
  };
  
  // Toggle trail goal (add or remove)
  const toggleTrailGoal = async (trailId: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    const hasGoal = await hasTrailGoal(trailId);
    
    if (hasGoal) {
      // Remove the goal
      const goalId = trailGoalsCache.value[trailId];
      
      if (!goalId) {
        return { success: false, error: 'Goal ID not found in cache' };
      }
      
      const result = await deleteGoal(goalId);
      
      if (result.success) {
        delete trailGoalsCache.value[trailId];
      }
      
      return result;
    } else {
      // Add the goal
      return createGoal({
        title: `Complete trail`,
        description: `Complete the trail as a personal goal`,
        type: 'completion',
        status: 'pending',
        target_date: null,
        meta: { trail_id: trailId }
      });
    }
  };

  return {
    goals,
    loading,
    error,
    fetchUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalStatus,
    getGoalStats,
    hasTrailGoal,
    toggleTrailGoal
  };
}

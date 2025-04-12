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
    
    try {
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.value.id)
        .order('updated_at', { ascending: false });
        
      if (err) throw err;
      
      goals.value = data || [];
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      error.value = err.message || 'Failed to fetch goals';
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
      const newGoal = {
        user_id: user.value.id,
        ...goalData,
        // Ensure defaults for nullable fields
        description: goalData.description || '',
        target_date: goalData.target_date || null,
        meta: goalData.meta || {}
      };
      
      const { data, error: err } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();
        
      if (err) throw err;
      
      // Add to local state
      if (data) {
        goals.value = [data, ...goals.value];
      }
      
      return { success: true, data };
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
      const { data, error: err } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.value.id) // Ensure user can only update their own goals
        .select()
        .single();
        
      if (err) throw err;
      
      // Update local state
      if (data) {
        const index = goals.value.findIndex(g => g.id === id);
        if (index !== -1) {
          goals.value[index] = { ...goals.value[index], ...data };
        }
      }
      
      return { success: true, data };
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
      const { error: err } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id); // Ensure user can only delete their own goals
        
      if (err) throw err;
      
      // Update local state
      goals.value = goals.value.filter(g => g.id !== id);
      
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
    
    // Check if we have goals loaded already
    if (goals.value.length > 0) {
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
    } else {
      console.log(`[DEBUG] No local goals state, checking database`);
    }
    
    // Otherwise, check database
    try {
      const { data, error: err } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.value.id)
        .eq('type', 'completion')
        .contains('meta', { trail_id: trailId });
        
      if (err) throw err;
      
      const safeData = data || [];
      const found = safeData.length > 0 && safeData[0] && safeData[0].id;
      console.log(`[DEBUG] Database goals check result: ${found ? 'Found' : 'Not found'}, rows: ${safeData.length}`);
      
      if (found && safeData[0]) {
        trailGoalsCache.value[trailId] = safeData[0].id;
        
        // If we found it in the database but no goals are loaded, fetch all goals
        if (goals.value.length === 0) {
          console.log(`[DEBUG] Found in database but local goals empty, refreshing goals`);
          fetchUserGoals();
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`Error checking if trail ${trailId} is in goals:`, err);
      return false;
    }
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

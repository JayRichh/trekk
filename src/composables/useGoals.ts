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

  return {
    goals,
    loading,
    error,
    fetchUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalStatus,
    getGoalStats
  };
}

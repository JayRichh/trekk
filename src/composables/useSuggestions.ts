import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Suggestion {
  id: string;
  user_id: string | null;
  content: string;
  status: 'new' | 'reviewing' | 'implemented' | 'declined' | string;
  created_at: string;
  updated_at: string;
}

export function useSuggestions() {
  const { user } = useAuth();
  const suggestions = ref<Suggestion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all suggestions for the current user
  const fetchUserSuggestions = async () => {
    if (!user.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: err } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false });
        
      if (err) throw err;
      
      suggestions.value = data || [];
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      error.value = err.message || 'Failed to fetch suggestions';
    } finally {
      loading.value = false;
    }
  };
  
  // Create a new suggestion
  const createSuggestion = async (content: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newSuggestion = {
        user_id: user.value?.id || null, // Allow anonymous suggestions
        content,
        status: 'new'
      };
      
      const { data, error: err } = await supabase
        .from('suggestions')
        .insert(newSuggestion)
        .select()
        .single();
        
      if (err) throw err;
      
      // Add to local state if user is logged in
      if (user.value && data) {
        suggestions.value = [data, ...suggestions.value];
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating suggestion:', err);
      error.value = err.message || 'Failed to create suggestion';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a suggestion
  const deleteSuggestion = async (id: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const { error: err } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id); // Ensure user can only delete their own suggestions
        
      if (err) throw err;
      
      // Update local state
      suggestions.value = suggestions.value.filter(s => s.id !== id);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting suggestion:', err);
      error.value = err.message || 'Failed to delete suggestion';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    suggestions,
    loading,
    error,
    fetchUserSuggestions,
    createSuggestion,
    deleteSuggestion
  };
}

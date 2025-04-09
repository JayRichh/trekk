import { ref, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const userProfile = ref<{
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null>(null);

  const isLoggedIn = computed(() => !!user.value);

  // Initialize the auth state
  onMounted(async () => {
    await refreshUser();
    loading.value = false;

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        user.value = session.user;
        await loadUserProfile();
      } else {
        user.value = null;
        userProfile.value = null;
      }
    });
  });

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      user.value = data.session?.user || null;
      if (user.value) {
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      user.value = null;
      userProfile.value = null;
    }
  };

  // Load user profile from the database or fallback to auth metadata
  const loadUserProfile = async () => {
    if (!user.value) return;

    try {
      // Try to get profile from public.profiles table (not users)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio')
        .eq('id', user.value.id)
        .single();

      // If table doesn't exist or other error, use auth user metadata instead
      if (error) {
        if (error.code === '42P01') { // relation does not exist
          console.log('Profiles table does not exist, using auth metadata instead');
          createProfileFromAuthUser();
          return;
        } else if (error.code === 'PGRST116') { // Record not found
          console.log('Profile not found, using auth metadata instead');
          createProfileFromAuthUser();
          return;
        }
        throw error;
      }

      if (data) {
        userProfile.value = {
          id: data.id,
          email: user.value.email || '',
          displayName: data.display_name,
          avatarUrl: data.avatar_url
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to auth user metadata
      createProfileFromAuthUser();
    }
  };

  // Create profile from auth user metadata
  const createProfileFromAuthUser = async () => {
    if (!user.value) return;
    
    try {
      // Get user metadata from auth
      const { data: userData } = await supabase.auth.getUser();
      const metadata = userData.user?.user_metadata || {};
      
      // Create profile from auth user data
      userProfile.value = {
        id: user.value.id,
        email: user.value.email || '',
        displayName: metadata.name || metadata.display_name || user.value.email?.split('@')[0] || 'User',
        avatarUrl: metadata.avatar_url || null
      };
      
      // Also try to create the profile in the database
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.value.id,
            display_name: userProfile.value.displayName,
            avatar_url: userProfile.value.avatarUrl
          })
          .single();
          
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating profile in database:', insertError);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    } catch (error) {
      console.error('Error creating profile from auth user:', error);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      user.value = data.user;
      await loadUserProfile();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Register a new user
  const register = async (email: string, password: string, displayName: string) => {
    try {
      // Create user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName, // Changed from display_name to name to match Supabase schema
            email: email
          }
        }
      });

      if (error) throw error;
      
      // Check if email confirmation was sent
      if (data.user && data.user.confirmation_sent_at) {
        // This means email confirmation was sent successfully
        return { 
          success: true, 
          emailConfirmationSent: true 
        };
      }

      // If we get here, the user was created without requiring email confirmation
      if (data.user) {
        try {
          // Create user profile in database
          // Note: There should be a trigger in the database to automatically create the profile,
          // but we'll try to create it manually as a fallback
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: displayName
            });

          if (profileError) {
            console.error('Failed to create user profile:', profileError);
            // We'll still consider signup successful even if profile creation fails
            // The profile should be created by the database trigger or later when the user logs in
          }
        } catch (profileErr) {
          console.error('Error creating user profile:', profileErr);
          // Still return success for the auth part
        }
        
        return { success: true, emailConfirmationSent: false };
      }

      return { success: false, error: 'Failed to create account' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Log out the current user
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      user.value = null;
      userProfile.value = null;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Request a password reset
  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Update user password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Update user profile - using direct database update only
  const updateProfile = async (updates: { displayName?: string; avatarUrl?: string }) => {
    if (!user.value) return { success: false, error: 'Not logged in' };
    if (!updates.displayName && !updates.avatarUrl) return { success: false, error: 'No updates provided' };

    console.log('Starting profile update with:', updates);
    
    // Update local userProfile state immediately for better UX
    if (userProfile.value) {
      if (updates.displayName) userProfile.value.displayName = updates.displayName;
      if (updates.avatarUrl) userProfile.value.avatarUrl = updates.avatarUrl;
    } else {
      userProfile.value = {
        id: user.value.id,
        email: user.value.email || '',
        displayName: updates.displayName || '',
        avatarUrl: updates.avatarUrl || null
      };
    }
    
    // Skip auth metadata update and go directly to database update
    try {
      const dbUpdateData: Record<string, any> = {};
      if (updates.displayName) dbUpdateData.display_name = updates.displayName;
      if (updates.avatarUrl) dbUpdateData.avatar_url = updates.avatarUrl;
      
      console.log('Updating database profile with:', dbUpdateData);
      
      // Use a direct update with a timeout
      const updatePromise = supabase
        .from('profiles')
        .update(dbUpdateData)
        .eq('id', user.value.id);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database update timed out')), 3000);
      });
      
      // Race the update against the timeout
      const { error: dbError } = await Promise.race([updatePromise, timeoutPromise]) as any;
      
      if (dbError) {
        console.error('Error updating profile in database:', dbError);
        return { 
          success: false, 
          error: `Failed to update profile: ${dbError.message}`
        };
      }
      
      console.log('Database profile updated successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Exception during database update:', error);
      
      // If it's a timeout error, still return success since we updated the local state
      if (error.message === 'Database update timed out') {
        console.log('Database update timed out, but local state was updated');
        return { 
          success: true, 
          warning: 'Profile update timed out, but changes were saved locally'
        };
      }
      
      return { 
        success: false, 
        error: error.message
      };
    }
  };

  return {
    user,
    userProfile,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    refreshUser
  };
}

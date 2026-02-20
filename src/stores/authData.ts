import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, type User } from '../lib/supabase';

// Define the authentication state interface
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Define the authentication actions interface
interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

// Combined interface for the store
interface AuthStore extends AuthState, AuthActions {}

// Create the authentication store using Zustand with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isInitialized: false,

      // Initialize authentication state
      initialize: async () => {
        // Prevent multiple initializations
        const currentState = useAuthStore.getState();
        if (currentState.isInitialized) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const { data: { session }, error } = await auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: error.message,
              isInitialized: true
            });
            return;
          }

          if (session?.user) {
            set({ 
              user: session.user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null,
              isInitialized: true
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: null,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: 'Failed to initialize authentication',
            isInitialized: true
          });
        }
      },

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await auth.signIn({ email, password });
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message,
              user: null,
              isAuthenticated: false 
            });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            return { success: true };
          }

          set({ 
            isLoading: false, 
            error: 'Login failed - no user data received',
            user: null,
            isAuthenticated: false 
          });
          return { success: false, error: 'Login failed - no user data received' };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            isAuthenticated: false 
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await auth.signOut();
          
          if (error) {
            console.error('Error signing out:', error);
            set({ 
              isLoading: false, 
              error: error.message 
            });
            return;
          }

          // Clear the authentication state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
          
        } catch (error) {
          console.error('Error during logout:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during logout';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },

      // Utility actions
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // Storage key name
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // Only persist user and authentication status
    }
  )
);

// Selector hooks for better performance and convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthInitialized = () => useAuthStore((state) => state.isInitialized);

// Individual action hooks for better performance
export const useLogin = () => useAuthStore((state) => state.login);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useSetUser = () => useAuthStore((state) => state.setUser);
export const useSetLoading = () => useAuthStore((state) => state.setLoading);
export const useSetError = () => useAuthStore((state) => state.setError);
export const useClearError = () => useAuthStore((state) => state.clearError);
export const useInitializeAuth = () => useAuthStore((state) => state.initialize);

// Combined action hooks (creates new object on every render - use sparingly)
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  initialize: state.initialize,
}));

export default useAuthStore;

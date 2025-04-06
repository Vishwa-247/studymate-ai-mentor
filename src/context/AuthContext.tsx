
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncUserProfile: (userId: string, fullName: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // useNavigate hook is now safely used inside the Router context
  const navigate = useNavigate();

  // Function to sync user data with our users table
  const syncUserProfile = async (userId: string, fullName: string, email: string) => {
    try {
      console.log("Syncing user profile:", { userId, fullName, email });
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          name: fullName,
          email: email
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error("Error syncing user profile:", error);
        throw error;
      }
      
      console.log("User profile synced successfully");
    } catch (error: any) {
      console.error("Error syncing user profile:", error.message);
      toast({
        title: "Profile sync error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      try {
        // Set loading state
        if (mounted) setIsLoading(true);
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Sync user profile if session exists
          if (session?.user) {
            const { id, email, user_metadata } = session.user;
            const fullName = user_metadata?.full_name || '';
            
            if (id && email) {
              await syncUserProfile(id, fullName, email);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    // Initialize auth
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Sync user profile if session exists
          if (session?.user) {
            const { id, email, user_metadata } = session.user;
            const fullName = user_metadata?.full_name || '';
            
            if (id && email) {
              await syncUserProfile(id, fullName, email);
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user',
          },
        },
      });
      
      if (error) throw error;
      
      // If sign up is successful and we have a user, sync with our users table
      if (data?.user) {
        await syncUserProfile(data.user.id, fullName, email);
      }
      
      toast({
        title: "Account created!",
        description: "Check your email for the confirmation link."
      });
      
      // Redirect to dashboard if email confirmation is not required
      // Otherwise, stay on the current page with a message to check email
      if (data?.session) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // First clear local state
      setUser(null);
      setSession(null);
      
      // Then call supabase signOut
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
      
      // Force navigation to home page
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    syncUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

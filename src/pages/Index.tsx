import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import AuthPage from "./Auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAuthSuccess = () => {
    // Auth state will be handled by the listener
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user} 
        userProfile={userProfile} 
        onNavigate={handleNavigate}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <CustomerDashboard 
            user={user} 
            userProfile={userProfile} 
            onNavigate={handleNavigate}
          />
        )}
        
        {currentView === 'chat' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Support Chat</h2>
            <p className="text-muted-foreground">Chat feature coming soon...</p>
          </div>
        )}
        
        {currentView === 'orders' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">My Orders</h2>
            <p className="text-muted-foreground">Orders view coming soon...</p>
          </div>
        )}
        
        {currentView === 'admin' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p className="text-muted-foreground">Admin features coming soon...</p>
          </div>
        )}
        
        {currentView === 'help' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Help Center</h2>
            <p className="text-muted-foreground">Help center coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

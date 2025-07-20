import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AddQAComponent } from "@/components/admin/AddQAComponent";
import { HelpCenter } from "@/components/help/HelpCenter";
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
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found, fetching profile for:', session.user.id);
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('No user, clearing profile');
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Initial profile fetch for:', session.user.id);
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('fetchUserProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Profile query result:', { data, error });

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating...');
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        
        if (user) {
          const isAdmin = user.email === 'admin@ecorider.com';
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              first_name: isAdmin ? 'System' : (user.user_metadata?.first_name || 'User'),
              last_name: isAdmin ? 'Administrator' : (user.user_metadata?.last_name || 'Customer'),
              mobile_number: user.user_metadata?.mobile_number || '',
              role: isAdmin ? 'admin' : 'customer'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            return;
          }
          
          console.log('Created new profile:', newProfile);
          setUserProfile(newProfile);
          return;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Setting user profile:', data);
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

  console.log('Render state:', { user: !!user, session: !!session, userProfile, loading });

  if (!user || !session) {
    console.log('Showing auth page - user:', !!user, 'session:', !!session);
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
        {currentView === 'dashboard' && userProfile?.role === 'admin' && (
          <AdminDashboard 
            user={user} 
            userProfile={userProfile} 
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && userProfile?.role === 'customer' && (
          <CustomerDashboard 
            user={user} 
            userProfile={userProfile} 
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && !userProfile && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        )}
        
        {currentView === 'add-qa' && userProfile?.role === 'admin' && (
          <AddQAComponent onBack={() => setCurrentView('dashboard')} />
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
          <HelpCenter onBack={() => setCurrentView('dashboard')} />
        )}
      </main>
    </div>
  );
};

export default Index;

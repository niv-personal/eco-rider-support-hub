import { useState, useEffect } from "react";
import { Plus, Users, MessageSquare, HelpCircle, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  user: any;
  userProfile: any;
  onNavigate: (path: string) => void;
}

export function AdminDashboard({ user, userProfile, onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    openQueries: 0,
    totalQA: 0
  });
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // Fetch customer count
      const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch open queries count
      const { count: openQueriesCount } = await supabase
        .from('customer_queries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch Q&A count
      const { count: qaCount } = await supabase
        .from('predefined_qa')
        .select('*', { count: 'exact', head: true });

      // Fetch recent queries
      const { data: queriesData, error: queriesError } = await supabase
        .from('customer_queries')
        .select(`
          *,
          profiles:customer_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (queriesError) throw queriesError;

      setStats({
        totalCustomers: customerCount || 0,
        totalOrders: ordersCount || 0,
        openQueries: openQueriesCount || 0,
        totalQA: qaCount || 0
      });

      setRecentQueries(queriesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getQueryStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-primary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, Administrator!
        </h1>
        <p className="text-blue-100 mb-4">
          Manage your Eco Rider customer support system
        </p>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onNavigate('add-qa')} 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Q&A
          </Button>
          <Button 
            onClick={() => onNavigate('manage-queries')} 
            variant="outline"
            className="bg-transparent border-white/30 text-white hover:bg-white/20"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Manage Queries
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openQueries}</p>
                <p className="text-sm text-muted-foreground">Open Queries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQA}</p>
                <p className="text-sm text-muted-foreground">Q&A Pairs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('add-qa')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Add Q&A</h3>
                <p className="text-sm text-muted-foreground">Create new predefined answers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('manage-queries')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Queries</h3>
                <p className="text-sm text-muted-foreground">Review customer inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('manage-qa')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Q&A</h3>
                <p className="text-sm text-muted-foreground">Edit existing answers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Queries */}
      {recentQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Customer Queries
            </CardTitle>
            <CardDescription>
              Latest support requests from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div key={query.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{query.query_text}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        From: {query.profiles?.first_name} {query.profiles?.last_name}
                      </p>
                    </div>
                    <Badge className={getQueryStatusColor(query.status)}>
                      {query.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {new Date(query.created_at).toLocaleDateString()}
                    </p>
                    {query.status === 'open' && (
                      <Button size="sm" variant="outline">
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('manage-queries')}
            >
              View All Queries
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
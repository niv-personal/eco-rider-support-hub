import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, Clock, CheckCircle, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ViewQueriesComponentProps {
  user: any;
  onBack: () => void;
  onSubmitNew: () => void;
}

interface Query {
  id: string;
  query_text: string;
  response_text: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  file_name: string | null;
  file_url: string | null;
}

export function ViewQueriesComponent({ user, onBack, onSubmitNew }: ViewQueriesComponentProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_queries')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQueries(data || []);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button onClick={onSubmitNew}>
          <Plus className="h-4 w-4 mr-2" />
          Submit New Query
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Support Queries</h1>
            <p className="text-muted-foreground">Track and manage your support requests</p>
          </div>
        </div>
      </div>

      {queries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No queries yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any support queries yet
            </p>
            <Button onClick={onSubmitNew}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Query
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <Card key={query.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(query.status)}
                      <Badge className={getStatusColor(query.status)}>
                        {query.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(query.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium line-clamp-2 mb-2">{query.query_text}</h3>
                    {query.response_text && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        Response: {query.response_text}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuery(query)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
                {query.file_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>📎 Attachment: {query.file_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Query Detail Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Query Details
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedQuery && new Date(selectedQuery.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuery && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(selectedQuery.status)}
                  <Badge className={getStatusColor(selectedQuery.status)}>
                    {selectedQuery.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Your Query:</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedQuery.query_text}</p>
                </div>
              </div>

              {selectedQuery.response_text && (
                <div>
                  <h4 className="font-medium mb-2">Support Response:</h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedQuery.response_text}</p>
                  </div>
                </div>
              )}

              {selectedQuery.file_name && (
                <div>
                  <h4 className="font-medium mb-2">Attachment:</h4>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm">📎 {selectedQuery.file_name}</span>
                    {selectedQuery.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={selectedQuery.file_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {new Date(selectedQuery.created_at).toLocaleString()}</p>
                <p>Last updated: {new Date(selectedQuery.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
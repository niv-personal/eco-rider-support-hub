import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Search, Send, CheckCircle, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ManageQueriesComponentProps {
  onBack: () => void;
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
  customer_id: string;
  customer_name?: {
    first_name: string;
    last_name: string;
  };
}

export function ManageQueriesComponent({ onBack }: ManageQueriesComponentProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    let filtered = queries;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(query => 
        query.query_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.response_text && query.response_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (query.customer_name && 
          `${query.customer_name.first_name} ${query.customer_name.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(query => query.status === statusFilter);
    }

    setFilteredQueries(filtered);
  }, [searchTerm, statusFilter, queries]);

  const fetchQueries = async () => {
    try {
      // Fetch queries
      const { data: queriesData, error: queriesError } = await supabase
        .from('customer_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (queriesError) throw queriesError;

      // Fetch customer names
      const customerIds = [...new Set(queriesData?.map(q => q.customer_id) || [])];
      const { data: customersData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', customerIds);

      // Combine the data
      const enrichedQueries = queriesData?.map(query => ({
        ...query,
        customer_name: customersData?.find(c => c.user_id === query.customer_id)
      })) || [];

      setQueries(enrichedQueries);
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

  const handleRespond = (query: Query) => {
    setSelectedQuery(query);
    setResponseText(query.response_text || "");
  };

  const submitResponse = async () => {
    if (!selectedQuery || !responseText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('customer_queries')
        .update({
          response_text: responseText.trim(),
          status: 'answered',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuery.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response sent successfully"
      });

      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === selectedQuery.id 
          ? { ...q, response_text: responseText.trim(), status: 'answered', updated_at: new Date().toISOString() }
          : q
      ));

      setSelectedQuery(null);
      setResponseText("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeQuery = async (queryId: string) => {
    try {
      const { error } = await supabase
        .from('customer_queries')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', queryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Query marked as closed"
      });

      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === queryId 
          ? { ...q, status: 'closed', updated_at: new Date().toISOString() }
          : q
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Manage Customer Queries
          </CardTitle>
          <CardDescription>
            Respond to and manage customer support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queries, responses, or customer names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Queries List */}
          {filteredQueries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {queries.length === 0 ? (
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No customer queries found.</p>
                </div>
              ) : (
                <p>No queries match your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <Card key={query.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(query.status)}
                        <Badge className={getStatusColor(query.status)}>
                          {query.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {query.customer_name ? 
                            `${query.customer_name.first_name} ${query.customer_name.last_name}` : 
                            'Unknown Customer'
                          }
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(query.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-2 line-clamp-2">{query.query_text}</h3>
                      
                      {query.response_text && (
                        <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg mb-2">
                          <h4 className="text-sm font-medium text-primary mb-1">Your Response:</h4>
                          <p className="text-sm line-clamp-2">{query.response_text}</p>
                        </div>
                      )}
                      
                      {query.file_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>📎 {query.file_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {query.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => handleRespond(query)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Respond
                        </Button>
                      )}
                      {query.status === 'answered' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespond(query)}
                          >
                            Edit Response
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => closeQuery(query.id)}
                          >
                            Close Query
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedQuery?.response_text ? 'Edit Response' : 'Respond to Query'}
            </DialogTitle>
            <DialogDescription>
              Customer: {selectedQuery?.customer_name ? 
                `${selectedQuery.customer_name.first_name} ${selectedQuery.customer_name.last_name}` : 
                'Unknown Customer'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuery && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Customer Query:</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedQuery.query_text}</p>
                </div>
              </div>

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

              <div>
                <h4 className="font-medium mb-2">Your Response:</h4>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-32"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={submitResponse} 
                  disabled={submitting || !responseText.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {selectedQuery.response_text ? 'Update Response' : 'Send Response'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedQuery(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Edit, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ManageQAComponentProps {
  onBack: () => void;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ManageQAComponent({ onBack }: ManageQAComponentProps) {
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [filteredQAPairs, setFilteredQAPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchQAPairs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQAPairs(qaPairs);
    } else {
      const filtered = qaPairs.filter(qa => 
        qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qa.category && qa.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQAPairs(filtered);
    }
  }, [searchTerm, qaPairs]);

  const fetchQAPairs = async () => {
    try {
      const { data, error } = await supabase
        .from('predefined_qa')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQAPairs(data || []);
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

  const toggleQAStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('predefined_qa')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setQAPairs(prev => prev.map(qa => 
        qa.id === id ? { ...qa, is_active: !currentStatus } : qa
      ));

      toast({
        title: "Success",
        description: `Q&A pair ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteQAPair = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Q&A pair? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('predefined_qa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQAPairs(prev => prev.filter(qa => qa.id !== id));

      toast({
        title: "Success",
        description: "Q&A pair deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
    <div className="max-w-4xl mx-auto space-y-6">
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
            <FileText className="h-5 w-5" />
            Manage Q&A Pairs
          </CardTitle>
          <CardDescription>
            View, edit, and manage all predefined questions and answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, answers, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {filteredQAPairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {qaPairs.length === 0 ? (
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Q&A pairs found. Add your first Q&A pair to get started!</p>
                </div>
              ) : (
                <p>No Q&A pairs match your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQAPairs.map((qa) => (
                <Card key={qa.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {qa.category && (
                        <Badge variant="secondary" className="text-xs">
                          {qa.category}
                        </Badge>
                      )}
                      <Badge 
                        variant={qa.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {qa.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleQAStatus(qa.id, qa.is_active)}
                      >
                        {qa.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQAPair(qa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Question:</h4>
                      <p className="text-sm">{qa.question}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Answer:</h4>
                      <p className="text-sm text-muted-foreground">{qa.answer}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                    <span>Created: {new Date(qa.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(qa.updated_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
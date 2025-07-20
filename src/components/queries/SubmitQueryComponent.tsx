import { useState } from "react";
import { ArrowLeft, Send, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubmitQueryComponentProps {
  user: any;
  onBack: () => void;
}

export function SubmitQueryComponent({ user, onBack }: SubmitQueryComponentProps) {
  const [queryText, setQueryText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!queryText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your query",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('customer_queries')
        .insert({
          customer_id: user.id,
          query_text: queryText.trim(),
          file_name: fileName || null,
          file_url: fileUrl || null,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your query has been submitted successfully"
      });
      
      // Reset form
      setQueryText("");
      setFileName("");
      setFileUrl("");
      
      // Go back to previous view
      onBack();
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Submit New Query
          </CardTitle>
          <CardDescription>
            Describe your issue or question and our support team will help you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="query">Describe your issue or question *</Label>
              <Textarea
                id="query"
                placeholder="Please provide as much detail as possible about your issue..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="min-h-32"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileName">Attachment Name (optional)</Label>
                <Input
                  id="fileName"
                  placeholder="e.g., invoice.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">Attachment URL (optional)</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Query
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
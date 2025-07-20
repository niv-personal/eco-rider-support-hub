import { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle, ChevronRight, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HelpCenterProps {
  onBack: () => void;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface QAFeedback {
  qaId: string;
  satisfied: boolean;
}

export function HelpCenter({ onBack }: HelpCenterProps) {
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [filteredQAs, setFilteredQAs] = useState<QAPair[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<QAFeedback[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchQAPairs();
  }, []);

  useEffect(() => {
    filterQAs();
  }, [qaPairs, searchTerm, selectedCategory]);

  const fetchQAPairs = async () => {
    try {
      const { data, error } = await supabase
        .from('predefined_qa')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

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

  const filterQAs = () => {
    let filtered = qaPairs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(qa => 
        qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(qa => qa.category === selectedCategory);
    }

    setFilteredQAs(filtered);
  };

  const getCategories = () => {
    const categories = [...new Set(qaPairs.map(qa => qa.category).filter(Boolean))];
    return categories.sort();
  };

  const getQAsByCategory = () => {
    const categories = getCategories();
    const categorized: Record<string, QAPair[]> = {};
    const uncategorized: QAPair[] = [];

    filteredQAs.forEach(qa => {
      if (qa.category) {
        if (!categorized[qa.category]) {
          categorized[qa.category] = [];
        }
        categorized[qa.category].push(qa);
      } else {
        uncategorized.push(qa);
      }
    });

    return { categorized, uncategorized, categories };
  };

  const handleFeedback = (qaId: string, satisfied: boolean) => {
    setFeedback(prev => {
      const existingIndex = prev.findIndex(f => f.qaId === qaId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { qaId, satisfied };
        return updated;
      } else {
        return [...prev, { qaId, satisfied }];
      }
    });

    toast({
      title: "Thank you!",
      description: satisfied ? "We're glad this helped!" : "We'll work to improve this answer."
    });
  };

  const getFeedbackForQA = (qaId: string): boolean | null => {
    const qaFeedback = feedback.find(f => f.qaId === qaId);
    return qaFeedback ? qaFeedback.satisfied : null;
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
          <div className="h-32 bg-muted rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { categorized, uncategorized, categories } = getQAsByCategory();

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

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to commonly asked questions about Eco Rider scooters
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for questions or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Q&A Content */}
      {filteredQAs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 
                "Try adjusting your search terms or browse different categories." :
                "No help articles are available at the moment."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Categorized Q&As */}
          {Object.entries(categorized).map(([category, qas]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">{category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({qas.length} {qas.length === 1 ? 'question' : 'questions'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {qas.map((qa, index) => (
                    <AccordionItem key={qa.id} value={`${category}-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{qa.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 pl-7">
                          <div className="prose prose-sm max-w-none">
                            {qa.answer.split('\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-3 last:mb-0 text-muted-foreground leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Was this helpful?</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={getFeedbackForQA(qa.id) === true ? "default" : "outline"}
                                onClick={() => handleFeedback(qa.id, true)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant={getFeedbackForQA(qa.id) === false ? "destructive" : "outline"}
                                onClick={() => handleFeedback(qa.id, false)}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}

          {/* Uncategorized Q&As */}
          {uncategorized.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>General Questions</CardTitle>
                <CardDescription>
                  {uncategorized.length} general {uncategorized.length === 1 ? 'question' : 'questions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {uncategorized.map((qa, index) => (
                    <AccordionItem key={qa.id} value={`general-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{qa.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 pl-7">
                          <div className="prose prose-sm max-w-none">
                            {qa.answer.split('\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-3 last:mb-0 text-muted-foreground leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Was this helpful?</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={getFeedbackForQA(qa.id) === true ? "default" : "outline"}
                                onClick={() => handleFeedback(qa.id, true)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant={getFeedbackForQA(qa.id) === false ? "destructive" : "outline"}
                                onClick={() => handleFeedback(qa.id, false)}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-4">
            Contact our support team for personalized help
          </p>
          <Button onClick={() => onBack()}>
            Start Live Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
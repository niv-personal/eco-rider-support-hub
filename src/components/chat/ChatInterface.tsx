import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Paperclip, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  user: any;
  userProfile: any;
  onBack: () => void;
}

interface Message {
  id: string;
  sender_type: 'customer' | 'system';
  message_text: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export function ChatInterface({ user, userProfile, onBack }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('customer_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'customer' | 'system'
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createNewConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          customer_id: user.id,
          title: 'New Conversation'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(data.id);
      setConversations([data, ...conversations]);
      
      // Send welcome message
      await sendSystemMessage(data.id, "Hello! I'm your Eco Rider support assistant. How can I help you today?");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const findBestAnswer = async (userMessage: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('predefined_qa')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const lowerMessage = userMessage.toLowerCase();
      
      // Simple keyword matching for predefined answers
      const matchedQA = data?.find(qa => {
        const questionWords = qa.question.toLowerCase().split(' ');
        return questionWords.some(word => 
          word.length > 3 && lowerMessage.includes(word)
        );
      });

      return matchedQA?.answer || null;
    } catch (error) {
      console.error('Error finding answer:', error);
      return null;
    }
  };

  const sendSystemMessage = async (conversationId: string, text: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'system',
        message_text: text
      });

    if (!error && conversationId === currentConversation) {
      fetchMessages(conversationId);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!currentConversation) return;

    setLoading(true);
    
    try {
      let fileUrl = null;
      let fileName = null;

      // Handle file upload if there's a selected file
      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        // For demo purposes, we'll just store the file name
        // In a real app, you'd upload to Supabase Storage
        fileName = selectedFile.name;
        fileUrl = `demo://uploads/${filePath}`;
        setUploading(false);
      }

      // Send user message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: currentConversation,
          sender_type: 'customer',
          message_text: newMessage.trim() || `Uploaded file: ${fileName}`,
          file_url: fileUrl,
          file_name: fileName
        });

      if (messageError) throw messageError;

      // Clear input
      const messageText = newMessage.trim();
      setNewMessage("");
      setSelectedFile(null);

      // Refresh messages
      await fetchMessages(currentConversation);

      // Try to find an automated response
      if (messageText) {
        const autoResponse = await findBestAnswer(messageText);
        
        if (autoResponse) {
          setTimeout(async () => {
            await sendSystemMessage(currentConversation, autoResponse);
          }, 1000); // Delay to make it feel more natural
        } else {
          // Send a fallback message
          setTimeout(async () => {
            await sendSystemMessage(
              currentConversation,
              "Thank you for your message. A support agent will review your inquiry and respond shortly. In the meantime, you can check our Help Center for immediate answers to common questions."
            );
          }, 1000);
        }
      }

      // Update conversation title if it's still "New Conversation"
      const conversation = conversations.find(c => c.id === currentConversation);
      if (conversation?.title === 'New Conversation' && messageText) {
        const title = messageText.length > 50 ? 
          messageText.substring(0, 50) + '...' : 
          messageText;
        
        await supabase
          .from('chat_conversations')
          .update({ title })
          .eq('id', currentConversation);
        
        fetchConversations();
      }

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="p-4">
          <Button onClick={createNewConversation} className="w-full">
            Start New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer transition-colors ${
                  currentConversation === conversation.id ? 
                  'bg-primary/10 border-primary' : 
                  'hover:bg-muted'
                }`}
                onClick={() => setCurrentConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <p className="font-medium text-sm line-clamp-2">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!currentConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Eco Rider Support</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new conversation to get help with your scooter
                </p>
                <Button onClick={createNewConversation}>
                  Start Your First Chat
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Eco Rider Support</h3>
                  <p className="text-sm text-muted-foreground">
                    We're here to help with your scooter questions
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                      {message.sender_type === 'system' && (
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      
                      <div className={`rounded-lg p-3 ${
                        message.sender_type === 'customer'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.message_text}</p>
                        {message.file_name && (
                          <Badge variant="secondary" className="mt-2">
                            📎 {message.file_name}
                          </Badge>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'customer'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      
                      {message.sender_type === 'customer' && (
                        <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-3 w-3 text-secondary" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              {selectedFile && (
                <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeSelectedFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading || uploading}
                  className="flex-1"
                />
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || uploading || (!newMessage.trim() && !selectedFile)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
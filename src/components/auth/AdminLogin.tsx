import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@ecorider.com",
    password: "admin1234"
  });
  const { toast } = useToast();

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      // Try to create admin user first
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'System',
            last_name: 'Administrator',
            role: 'admin'
          }
        }
      });

      // If user already exists, that's fine, just sign them in
      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin signed in successfully!"
      });
      onSuccess();
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

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      // Try to create admin user first
      const { error: signUpError } = await supabase.auth.signUp({
        email: "admin@ecorider.com",
        password: "admin1234",
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'System',
            last_name: 'Administrator',
            role: 'admin'
          }
        }
      });

      // If user already exists, that's fine, just sign them in
      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@ecorider.com",
        password: "admin1234"
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin signed in successfully!"
      });
      onSuccess();
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
    <div className="w-full max-w-md">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Login Options
      </Button>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-secondary" />
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your administrator credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <Button 
            onClick={handleAdminLogin} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In as Admin"}
          </Button>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={handleQuickLogin} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <Lock className="h-4 w-4 mr-2" />
              Quick Login (Default Admin)
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Default: admin@ecorider.com / admin1234
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
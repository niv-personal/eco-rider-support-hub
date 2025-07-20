import { AuthForm } from "@/components/ui/auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setupAdminAndSampleData } from "@/utils/setup-admin";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Settings } from "lucide-react";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [setupLoading, setSetupLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupAdmin = async () => {
    setSetupLoading(true);
    try {
      await setupAdminAndSampleData();
      toast({
        title: "Setup Complete",
        description: "Admin user and sample data created! You can now login with admin@ecorider.com / admin1234"
      });
    } catch (error: any) {
      toast({
        title: "Setup Error", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">ER</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Eco Rider
          </h1>
          <p className="text-muted-foreground mt-2">
            Customer Support Portal
          </p>
        </div>
        
        {/* Setup Card */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              First Time Setup
            </CardTitle>
            <CardDescription>
              Initialize the system with admin user and sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSetupAdmin}
              disabled={setupLoading}
              className="w-full"
              variant="outline"
            >
              {setupLoading ? "Setting up..." : "Setup Admin & Sample Data"}
            </Button>
          </CardContent>
        </Card>
        
        <AuthForm onSuccess={onSuccess} />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team</p>
          <p className="mt-1">support@ecorider.com</p>
        </div>
      </div>
    </div>
  );
}
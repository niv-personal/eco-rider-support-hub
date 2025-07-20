import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users } from "lucide-react";

interface AuthSelectionProps {
  onSelectAdmin: () => void;
  onSelectCustomer: () => void;
}

export function AuthSelection({ onSelectAdmin, onSelectCustomer }: AuthSelectionProps) {
  return (
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

      <div className="space-y-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectCustomer}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">Customer Login</CardTitle>
                <CardDescription>
                  Access your account with email/password or mobile/OTP
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectAdmin}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">Admin Login</CardTitle>
                <CardDescription>
                  Administrator access to manage the support system
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Contact our support team</p>
        <p className="mt-1">support@ecorider.com</p>
      </div>
    </div>
  );
}
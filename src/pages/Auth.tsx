import { useState } from "react";
import { AuthSelection } from "@/components/auth/AuthSelection";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { CustomerLogin } from "@/components/auth/CustomerLogin";

interface AuthPageProps {
  onSuccess: () => void;
}

type AuthView = 'selection' | 'admin' | 'customer';

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<AuthView>('selection');

  const handleSelectAdmin = () => setCurrentView('admin');
  const handleSelectCustomer = () => setCurrentView('customer');
  const handleBack = () => setCurrentView('selection');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {currentView === 'selection' && (
        <AuthSelection 
          onSelectAdmin={handleSelectAdmin}
          onSelectCustomer={handleSelectCustomer}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminLogin 
          onSuccess={onSuccess}
          onBack={handleBack}
        />
      )}
      
      {currentView === 'customer' && (
        <CustomerLogin 
          onSuccess={onSuccess}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
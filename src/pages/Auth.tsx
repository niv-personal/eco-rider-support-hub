import { AuthForm } from "@/components/ui/auth-form";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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
        
        <AuthForm onSuccess={onSuccess} />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team</p>
          <p className="mt-1">support@ecorider.com</p>
          <p className="mt-2 text-xs">Default admin: admin@ecorider.com / admin1234</p>
        </div>
      </div>
    </div>
  );
}
import { User, LogOut, MessageCircle, Package, Settings, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user: any;
  userProfile: any;
  onNavigate: (path: string) => void;
}

export function Navigation({ user, userProfile, onNavigate }: NavigationProps) {
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
    }
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ER</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Eco Rider
                </h1>
                <p className="text-xs text-muted-foreground">Customer Support</p>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation buttons for mobile */}
            <div className="flex items-center space-x-2 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('chat')}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('orders')}
                >
                  <Package className="h-4 w-4" />
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userProfile?.first_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {userProfile?.first_name ? 
                        `${userProfile.first_name} ${userProfile.last_name}` : 
                        user?.email
                      }
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs text-secondary font-medium">
                      {isAdmin ? "Administrator" : "Customer"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onNavigate('chat')}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Support Chat</span>
                </DropdownMenuItem>
                
                {!isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => onNavigate('orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onNavigate('queries')}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Queries</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onNavigate('help')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help Center</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
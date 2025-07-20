import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const { toast } = useToast();

  // Email/Password form data
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    mobile: "",
    confirmPassword: ""
  });

  // Mobile/OTP form data
  const [mobileFormData, setMobileFormData] = useState({
    mobile: "",
    otp: ""
  });

  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    try {
      if (isSignUp) {
        if (emailFormData.password !== emailFormData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: emailFormData.email,
          password: emailFormData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: emailFormData.firstName,
              last_name: emailFormData.lastName,
              mobile_number: emailFormData.mobile,
              role: 'customer'
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to confirm your account."
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFormData.email,
          password: emailFormData.password
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
        onSuccess();
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

  const handleMobileAuth = async () => {
    setLoading(true);
    try {
      if (!otpSent) {
        // For demo purposes, we'll just set OTP as sent
        // In a real app, you'd integrate with SMS provider
        setOtpSent(true);
        setMobileNumber(mobileFormData.mobile);
        toast({
          title: "OTP Sent",
          description: "Use the default OTP: 654321"
        });
      } else {
        // Validate OTP (demo implementation)
        if (mobileFormData.otp === "654321") {
          // Create a temporary user account or sign in
          // For demo, we'll create an account with email as mobile@ecorider.com
          const email = `${mobileFormData.mobile}@ecorider.com`;
          const { error } = await supabase.auth.signUp({
            email,
            password: `mobile_${mobileFormData.mobile}`, // Auto-generated password
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                first_name: "Customer",
                last_name: "User",
                mobile_number: mobileFormData.mobile,
                role: 'customer'
              }
            }
          });

          if (error && error.message.includes("already registered")) {
            // User exists, sign them in
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: `mobile_${mobileFormData.mobile}`
            });
            if (signInError) throw signInError;
          } else if (error) {
            throw error;
          }

          toast({
            title: "Success",
            description: "Signed in successfully!"
          });
          onSuccess();
        } else {
          throw new Error("Invalid OTP. Use 654321");
        }
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

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
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
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailFormData.email}
                      onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={() => handleEmailAuth(false)} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleAdminLogin} 
                      variant="outline" 
                      className="w-full"
                      disabled={loading}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Admin Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                  <CardDescription className="text-center">
                    Fill in your details to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={emailFormData.firstName}
                        onChange={(e) => setEmailFormData({ ...emailFormData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={emailFormData.lastName}
                        onChange={(e) => setEmailFormData({ ...emailFormData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+1234567890"
                      value={emailFormData.mobile}
                      onChange={(e) => setEmailFormData({ ...emailFormData, mobile: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailFormData.email}
                      onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={emailFormData.confirmPassword}
                      onChange={(e) => setEmailFormData({ ...emailFormData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={() => handleEmailAuth(true)} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="mobile">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Mobile Login</CardTitle>
              <CardDescription className="text-center">
                {!otpSent ? "Enter your mobile number to receive OTP" : "Enter the OTP sent to your mobile"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+1234567890"
                      value={mobileFormData.mobile}
                      onChange={(e) => setMobileFormData({ ...mobileFormData, mobile: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleMobileAuth} 
                    className="w-full" 
                    disabled={loading || !mobileFormData.mobile}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      placeholder="654321"
                      value={mobileFormData.otp}
                      onChange={(e) => setMobileFormData({ ...mobileFormData, otp: e.target.value })}
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground">Default OTP: 654321</p>
                  </div>
                  <Button 
                    onClick={handleMobileAuth} 
                    className="w-full" 
                    disabled={loading || !mobileFormData.otp}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button 
                    onClick={() => {
                      setOtpSent(false);
                      setMobileFormData({ mobile: "", otp: "" });
                    }} 
                    variant="outline" 
                    className="w-full"
                  >
                    Back
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
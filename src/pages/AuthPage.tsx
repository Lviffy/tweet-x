
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

const AuthPage = () => {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear fields when switching tabs
  const reset = () => {
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Sign in error:", error);
        toast({ 
          title: "Sign In Failed", 
          description: error.message, 
          variant: "destructive" 
        });
      } else if (data.user) {
        toast({ 
          title: "Signed In!", 
          description: "Welcome back." 
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      toast({ 
        title: "Sign In Failed", 
        description: "An unexpected error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use the current domain without the hash for the redirect
      const baseUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${baseUrl}/auth`
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          toast({ 
            title: "Account Already Exists", 
            description: "This email is already registered. Please sign in instead.", 
            variant: "destructive" 
          });
          setTab("signin");
        } else {
          toast({ 
            title: "Sign Up Failed", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      } else {
        console.log("Sign up successful:", data);
        if (data.user && !data.user.email_confirmed_at) {
          toast({ 
            title: "Check your inbox", 
            description: "Please check your email and click the confirmation link to complete your registration." 
          });
        } else {
          toast({ 
            title: "Account Created!", 
            description: "You can now sign in with your credentials." 
          });
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      toast({ 
        title: "Sign Up Failed", 
        description: "An unexpected error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome to Promptverse AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(value) => { setTab(value); reset(); }}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="w-4 h-4 mr-1" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button disabled={loading} className="w-full" type="submit">
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Choose a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button disabled={loading} className="w-full" type="submit">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

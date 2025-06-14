
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You have been signed in successfully."
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-border/10">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm hover:text-gray-300 transition-colors">About</a>
            <a href="#" className="text-sm hover:text-gray-300 transition-colors">Technologies</a>
            <a href="#" className="text-sm hover:text-gray-300 transition-colors">Products</a>
            <a href="#" className="text-sm hover:text-gray-300 transition-colors">Discover</a>
          </nav>

          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-base font-bold">↗</span>
            </div>
            <span className="text-base font-medium">Promptverse AI</span>
          </div>

          {/* Right nav */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm hover:text-gray-300 transition-colors">Team</a>
              <a href="#" className="text-sm hover:text-gray-300 transition-colors">Pricing</a>
              <a href="#" className="text-sm hover:text-gray-300 transition-colors">Buy Premium</a>
            </nav>
            
            {loading ? (
              <div className="w-20 h-10 bg-gray-600 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden sm:block">
                  {user.email}
                </span>
                <Button 
                  className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

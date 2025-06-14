
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    // Subscribe to auth changes
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
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
          <div className="flex items-center space-x-2">
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
            {user ? (
              <Button className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition"
                      onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition"
                      onClick={() => navigate("/auth")}>
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



import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SparkleBackground from "@/components/SparkleBackground";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/tweet-generator");
    } else {
      navigate("/auth");
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20">
      <SparkleBackground />
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-24">
        <HeroSection />
        
        <div className="text-center mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              {user ? "Start Generating" : "Get Started"}
            </Button>
            
            {user && (
              <Button 
                onClick={handleDashboard}
                size="lg"
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform transition hover:scale-105"
              >
                Dashboard
              </Button>
            )}
          </div>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create engaging tweets effortlessly with our AI-powered generator. 
            Perfect for content creators, marketers, and social media enthusiasts.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;

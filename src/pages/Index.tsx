
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SparkleBackground from "@/components/SparkleBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20 relative overflow-hidden">
      {/* Sparkle background effects */}
      <SparkleBackground />
      
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
    </div>
  );
};

export default Index;

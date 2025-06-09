
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SparkleBackground from "@/components/SparkleBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20 relative overflow-hidden">
      {/* Sparkle background effects */}
      <SparkleBackground />
      
      {/* Bottom center glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-t from-white/20 via-white/10 to-transparent blur-3xl opacity-80 pointer-events-none"></div>
      
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
    </div>
  );
};

export default Index;

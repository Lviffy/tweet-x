
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SparkleBackground from "@/components/SparkleBackground";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Initialize Unicorn Studio when component mounts
    if (window.UnicornStudio) {
      window.UnicornStudio.init().catch((err: any) => {
        console.error("Failed to initialize Unicorn Studio:", err);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20 relative overflow-hidden">
      {/* Unicorn Studio Background */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        data-us-project="XxlOGeJnIdiCdlKJSD63"
        data-us-scale="1"
        data-us-dpi="1.5"
        data-us-lazyload="true"
        data-us-disablemobile="true"
        data-us-alttext="Animated background"
        data-us-arialabel="Interactive animated background scene"
        style={{ width: '100%', height: '100%' }}
      />
      

      
      {/* Bottom center glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-t from-white/20 via-white/10 to-transparent blur-3xl opacity-80 pointer-events-none z-10"></div>
      
      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>
      
      {/* Hero Section */}
      <div className="relative z-20">
        <HeroSection />
      </div>
    </div>
  );
};

export default Index;

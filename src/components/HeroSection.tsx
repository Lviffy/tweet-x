
import { Button } from "@/components/ui/button";
import { Wand2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 ">
      <div className="container mx-auto text-center">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.5,
            ease: "easeIn"
          }}
        >
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight font-weight-600">
            Find Inspiration.
            <br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Create, Generate,
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Produce & Automate.
            </span>
          </h1>

          {/* Description */}
          <p className="text-md text-muted-foreground max-w-3xl mx-auto font-normal">
            Welcome to PromptVerse. Effortlessly create content, explore endless prompts, and stay ahead with 
            real-time trends. Generate founder-style tweets with AI, automate social media, and boost productivity 
            with our stunning, futuristic design.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link to="/tweet-generator">
              <Button className="flex items-center gap-2 rounded-full bg-transparent text-white font-medium px-6 py-2 hover:bg-gray-100 hover:text-black transition border border-white">
                <Wand2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Generating
              </Button>
            </Link>
            
            <Button className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition">
              Download
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

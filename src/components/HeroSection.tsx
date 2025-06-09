
import { Button } from "@/components/ui/button";
import { Wand2, Download } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Brand name */}
          <div className="text-muted-foreground text-lg font-medium">
            Promptverse AI
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
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
          <p className="text-md text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            Welcome to PromptVerse. Effortlessly create content, explore endless prompts, and stay ahead with 
            real-time trends. Automate emails, social media, and more while our AI extracts knowledge from any 
            document or URL. Experience a stunning, futuristic design that boosts productivity.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg bg-transparent border border-foreground/20 hover:bg-foreground/10 transition-all duration-300 group"
            >
              <Wand2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Generating
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

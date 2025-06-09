import { Button } from "@/components/ui/button";

const Header = () => {
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
            <Button className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-gray-100 transition">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarSessionList } from "./sidebar/SidebarSessionList";
import { SidebarUserProfile } from "./sidebar/SidebarUserProfile";

export const TweetGeneratorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewSession = () => {
    // Navigate to tweet generator without session ID to create new session
    navigate("/tweet-generator", { replace: true });
    // Force a page refresh to reset all state
    window.location.href = "/tweet-generator";
  };

  // Active state for sidebar links
  const isStarPage = location.pathname.startsWith('/starred-tweets');

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="font-semibold text-lg">Tweet Generator</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="p-4 space-y-4">
          <Button 
            onClick={handleNewSession} 
            className="w-full"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>

          <Button
            variant={isStarPage ? "secondary" : "ghost"}
            className="w-full flex items-center justify-start"
            onClick={() => navigate("/starred-tweets")}
          >
            <Star className="w-4 h-4 mr-2" />
            Starred Tweets
          </Button>

          <SidebarNavigation />
          <SidebarSessionList />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarUserProfile />
      </SidebarFooter>
    </Sidebar>
  );
};

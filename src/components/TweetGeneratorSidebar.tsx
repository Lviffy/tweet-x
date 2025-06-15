
import { useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarSessionList } from "./sidebar/SidebarSessionList";
import { SidebarUserProfile } from "./sidebar/SidebarUserProfile";

export const TweetGeneratorSidebar = () => {
  const navigate = useNavigate();

  const handleNewSession = () => {
    // Navigate to tweet generator without session ID to create new session
    navigate("/tweet-generator", { replace: true });
    // Force a page refresh to reset all state
    window.location.href = "/tweet-generator";
  };

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

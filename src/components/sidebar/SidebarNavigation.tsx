
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, Star } from "lucide-react";

export const SidebarNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper for active route highlighting (reuse logic)
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <span
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <span
              onClick={() => navigate("/dashboard")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <span
              onClick={() => navigate("/starred-tweets")}
            >
              <Star className="w-4 h-4 mr-2" />
              Starred Tweets
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
};

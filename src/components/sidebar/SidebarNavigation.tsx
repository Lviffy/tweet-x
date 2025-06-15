
import { useNavigate } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings } from "lucide-react";

export const SidebarNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => navigate("/")}>
            <Home className="w-4 h-4" />
            Home
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => navigate("/dashboard")}>
            <Settings className="w-4 h-4" />
            Dashboard
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
};

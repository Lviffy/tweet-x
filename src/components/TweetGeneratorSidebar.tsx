
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Plus, 
  History, 
  User, 
  Settings,
  FileText,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TweetSession {
  id: string;
  title: string;
  created_at: string;
  topic: string;
}

export function TweetGeneratorSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();

  const { data: sessions = [] } = useQuery({
    queryKey: ['tweet-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tweet_sessions')
        .select('id, title, created_at, topic')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as TweetSession[];
    },
    enabled: !!user
  });

  const navigationItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "New Session", url: "/tweet-generator", icon: Plus },
    { title: "Dashboard", url: "/dashboard", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-muted text-primary font-medium flex items-center gap-2" 
                          : "hover:bg-muted/50 flex items-center gap-2"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Sessions */}
        {user && sessions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {state !== "collapsed" && "Recent Sessions"}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/tweet-generator/${session.id}`}
                        className="hover:bg-muted/50 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        {state !== "collapsed" && (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {session.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {session.topic.slice(0, 30)}...
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(session.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}


import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Plus, Home, Settings } from "lucide-react";

interface Session {
  id: string;
  title: string;
  created_at: string;
}

export const TweetGeneratorSidebar = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Direct query to tweet_sessions table
      const { data, error } = await supabase
        .from('tweet_sessions')
        .select('id, title, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    navigate("/tweet-generator");
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/tweet-generator/${sessionId}`);
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

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Sessions</h3>
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <SidebarMenu>
                  {sessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton 
                        onClick={() => handleSessionClick(session.id)}
                        className="w-full justify-start"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="truncate">{session.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <p className="text-sm text-muted-foreground">No sessions yet</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

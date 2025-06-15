
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Session {
  id: string;
  title: string;
  created_at: string;
}

export const SidebarSessionList = () => {
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

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('tweet_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        toast({
          title: "Error",
          description: "Failed to delete session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSessions(sessions.filter(session => session.id !== sessionId));
      
      toast({
        title: "Session deleted",
        description: "The session has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/tweet-generator/${sessionId}`);
  };

  return (
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
                <div className="flex items-center w-full">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <SidebarMenuButton 
                        onClick={() => handleSessionClick(session.id)}
                        className="flex-1 justify-start"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="truncate">{session.title}</span>
                      </SidebarMenuButton>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="right">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{session.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="ml-1 h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <p className="text-sm text-muted-foreground">No sessions yet</p>
        )}
      </ScrollArea>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Plus, Home, Settings, LogOut, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Session {
  id: string;
  title: string;
  created_at: string;
}

export const TweetGeneratorSidebar = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
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

      // Remove the session from local state
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

  const handleNewSession = () => {
    // Navigate to tweet generator without session ID to create new session
    navigate("/tweet-generator", { replace: true });
    // Force a page refresh to reset all state
    window.location.href = "/tweet-generator";
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/tweet-generator/${sessionId}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
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
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                Signed in
              </p>
            </div>
          </div>
          
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Sign Out
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

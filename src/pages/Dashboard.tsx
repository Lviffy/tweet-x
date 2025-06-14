
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { MessageSquare, Plus, TrendingUp } from "lucide-react";

interface Session {
  id: string;
  title: string;
  created_at: string;
  tweet_count?: number;
}

const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Mock data for now until database types are fixed
    const mockSessions: Session[] = [
      {
        id: "1",
        title: "AI Technology Trends",
        created_at: new Date().toISOString(),
        tweet_count: 3
      },
      {
        id: "2", 
        title: "Social Media Marketing Tips",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        tweet_count: 5
      }
    ];
    
    setSessions(mockSessions);
    setLoading(false);
  }, [user, navigate]);

  const handleSessionClick = (sessionId: string) => {
    navigate(`/tweet-generator/${sessionId}`);
  };

  const handleNewSession = () => {
    navigate("/tweet-generator");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20">
      <Header />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your tweet generation sessions
              </p>
            </div>
            <Button onClick={handleNewSession}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tweets
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessions.reduce((sum, session) => sum + (session.tweet_count || 0), 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Week
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessions.filter(s => 
                    new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.tweet_count || 0} tweets
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first tweet generation session to get started.
                  </p>
                  <Button onClick={handleNewSession}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TweetGeneratorSidebar } from "@/components/TweetGeneratorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, FileText, Clock, Hash, Smile, Megaphone } from "lucide-react";

interface DashboardSession {
  id: string;
  title: string;
  topic: string;
  tone: string;
  format: string;
  include_hashtags: boolean;
  include_emojis: boolean;
  include_cta: boolean;
  created_at: string;
  tweet_count: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['dashboard-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tweet_sessions')
        .select(`
          id,
          title,
          topic,
          tone,
          format,
          include_hashtags,
          include_emojis,
          include_cta,
          created_at,
          generated_tweets(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(session => ({
        ...session,
        tweet_count: session.generated_tweets?.[0]?.count || 0
      })) as DashboardSession[];
    },
    enabled: !!user
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const totalSessions = sessions.length;
  const totalTweets = sessions.reduce((sum, session) => sum + session.tweet_count, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-gray-900/20">
        <TweetGeneratorSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h1 className="text-4xl font-bold">Dashboard</h1>
                </div>
                <Button onClick={() => navigate("/tweet-generator")}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tweets Generated</CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTweets}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{user.email}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </CardContent>
                </Card>
              </div>

              {/* Sessions List */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Recent Sessions</h2>
                
                {isLoading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded w-16"></div>
                            <div className="h-6 bg-muted rounded w-12"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first tweet generation session to get started.
                      </p>
                      <Button onClick={() => navigate("/tweet-generator")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Session
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {sessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/tweet-generator/${session.id}`)}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                  {session.topic}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    {session.tweet_count} tweets
                                  </div>
                                  <div className="capitalize">{session.tone}</div>
                                  <div className="capitalize">{session.format}</div>
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                  {session.include_hashtags && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      <Hash className="h-3 w-3" />
                                      Hashtags
                                    </span>
                                  )}
                                  {session.include_emojis && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                      <Smile className="h-3 w-3" />
                                      Emojis
                                    </span>
                                  )}
                                  {session.include_cta && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      <Megaphone className="h-3 w-3" />
                                      CTA
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

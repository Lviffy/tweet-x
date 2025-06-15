
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useTweetGeneratorNavigation = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the tweet generator.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  const navigateHome = () => navigate("/");

  return {
    user,
    loading,
    navigateHome,
    navigate
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  industry: string | null;
  goals: string | null;
  interests: string | null;
}

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data as UserProfile))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async (formData: Partial<UserProfile>) => {
    if (!user) return;
    setLoading(true);
    // Upsert user profile (insert if not exists)
    await supabase.from("user_profiles").upsert([
      { id: user.id, ...formData, updated_at: new Date().toISOString() },
    ]);
    setProfile(prev => ({
      id: user.id,
      display_name:
        formData.display_name !== undefined
          ? formData.display_name
          : prev?.display_name ?? null,
      bio:
        formData.bio !== undefined
          ? formData.bio
          : prev?.bio ?? null,
      industry:
        formData.industry !== undefined
          ? formData.industry
          : prev?.industry ?? null,
      goals:
        formData.goals !== undefined
          ? formData.goals
          : prev?.goals ?? null,
      interests:
        formData.interests !== undefined
          ? formData.interests
          : prev?.interests ?? null,
    }));
    setLoading(false);
  };

  return { profile, loading: loading || authLoading, saveProfile };
};

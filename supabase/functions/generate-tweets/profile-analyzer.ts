
import { ProfileData } from './types.ts';

export async function getDetailedProfileAnalysis(supabase: any, userId: string, handles: string[]): Promise<ProfileData[]> {
  if (!handles || handles.length === 0) {
    return [];
  }

  try {
    const { data: profiles, error } = await supabase
      .from('scraped_profiles')
      .select('*')
      .eq('user_id', userId)
      .in('handle', handles);

    if (error) {
      console.error('Error fetching profile data:', error);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error('Error in getDetailedProfileAnalysis:', error);
    return [];
  }
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znpzbphywuragqvqqexp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHpicGh5d3VyYWdxdnFxZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTIzMzEsImV4cCI6MjA2NTQ4ODMzMX0.lPbYz5o6N-BKJrWbQ1MEenOtSdgV2XKufuTEJmS9wQ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpdwxsjzplnkuidkryee.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHd4c2p6cGxua3VpZGtyeWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODQwMDksImV4cCI6MjA2NDI2MDAwOX0.dxJNStyCW-dapSC-SxA31EDXSGgdZU1iyy5ZxNtZv64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Reminder = {
  id: string;
  user_id: string;
  medicine_name: string;
  reminder_time: string;
  created_at: string;
};

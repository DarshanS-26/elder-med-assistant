
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Reminder = {
  id: string;
  user_id: string;
  medicine_name: string;
  reminder_time: string;
  created_at: string;
};

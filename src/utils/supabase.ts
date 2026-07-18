import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bolamqagogvdipmpvbhu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G0RZZhAGWsi-bec_Vk8poA_1Hh3gsEc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

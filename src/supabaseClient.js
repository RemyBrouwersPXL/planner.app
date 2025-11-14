import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzuwefsbobsluoantyam.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dXdlZnNib2JzbHVvYW50eWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjQ3NTksImV4cCI6MjA3ODY0MDc1OX0.-gyq0HYkSXkwou6FhLVKnbNDXKArSmtEw6n0AYmiO88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
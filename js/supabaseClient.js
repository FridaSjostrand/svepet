// Kopplar sidan till Supabase-projektet "Svepet".
// anon-nyckeln är säker att ha i klientkoden — det är RLS-reglerna i
// databasen (se supabase/schema.sql) som faktiskt skyddar datan, inte
// hemlighållandet av den här nyckeln. Använd ALDRIG service_role-nyckeln
// här — den kringgår RLS helt och ska aldrig finnas i kod som når webbläsaren.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://qeeimxfdhbgirkturyek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWlteGZkaGJnaXJrdHVyeWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODc1MzksImV4cCI6MjEwMTI2MzUzOX0.cao17hfuqOL8tXDzEPa4lTUwwcyF4eZQD1QNfuCalHs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

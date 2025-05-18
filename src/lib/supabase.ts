
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdeysbnriwiwolgremsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZXlzYm5yaXdpd29sZ3JlbXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTY1NjIsImV4cCI6MjA2MzA5MjU2Mn0.pOAr4_PsCmhryGYSuBp9qeeg7HLXdm7KeFr_L98uXmw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

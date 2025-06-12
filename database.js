import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
const supabaseUrl = 'https://caeytkufykvjrfizvqcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZXl0a3VmeWt2anJmaXp2cWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTQ2NzYsImV4cCI6MjA2NTAzMDY3Nn0.bKHsVqCkmnH-CtX1HlcsxO6fCcUjLboMx4xRqXRsxgg';
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
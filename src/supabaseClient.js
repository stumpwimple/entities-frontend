import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xmjskkioikpynmxnsskj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanNra2lvaWtweW5teG5zc2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU4NzUwMzYsImV4cCI6MjAxMTQ1MTAzNn0.apCed_vCzc7HnRPX_t_dlQWHEDGr9Q4X3ahnjtqFpc8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;

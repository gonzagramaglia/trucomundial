import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envStr = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envStr.split('\n').filter(Boolean).map(line => line.split('=')));
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await supabase.from('fixture_results').upsert({
    match_id: 'test_penalties',
    score_a: 1,
    score_b: 1,
    status: 'finished_penalties_A'
  });
  console.log("Error:", error);
  console.log("Data:", data);
  // delete it after
  await supabase.from('fixture_results').delete().eq('match_id', 'test_penalties');
}
run();

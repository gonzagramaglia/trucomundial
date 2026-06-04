import fs from 'fs';
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const url = `${env.VITE_SUPABASE_URL}/rest/v1/tournaments?select=id,name,creator_id,organizer`;
const apikey = env.VITE_SUPABASE_ANON_KEY;

fetch(url, { headers: { 'apikey': apikey, 'Authorization': 'Bearer ' + apikey } })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);

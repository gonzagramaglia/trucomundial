import fs from 'fs';

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = `${env.VITE_SUPABASE_URL}/rest/v1/rpc/check_policies`; // Let's try direct SQL via RPC if it exists, or check tables
const apikey = env.VITE_SUPABASE_ANON_KEY;

// Since we cannot run raw SQL directly through PostgREST unless there is a function,
// we will output the recommended SQL statement. Let's inspect the registrations table permissions by trying to select.
console.log('Testing select on tournament_registrations...');
fetch(`${env.VITE_SUPABASE_URL}/rest/v1/tournament_registrations?limit=1`, {
  headers: {
    'apikey': apikey,
    'Authorization': 'Bearer ' + apikey
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('Select registrations test:', data);
  })
  .catch(console.error);

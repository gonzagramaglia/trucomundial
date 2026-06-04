import fs from 'fs';
import path from 'path';

// Parse .env manually to avoid dependencies
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = `${env.VITE_SUPABASE_URL}/rest/v1/profiles?limit=1`;
const apikey = env.VITE_SUPABASE_ANON_KEY;

console.log('Fetching from URL:', url);

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': 'Bearer ' + apikey
  }
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('Result data structure:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(console.error);

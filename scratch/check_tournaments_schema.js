import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/tournaments';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      name: "Test Pending",
      status: "pending",
      organizer: "Me",
      max_participants: 4
    })
  });
  
  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Data:", data);
  
  if (response.status === 201 && data[0]?.id) {
    const delUrl = url + '?id=eq.' + data[0].id;
    await fetch(delUrl, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_ANON_KEY
      }
    });
  }
}
check();

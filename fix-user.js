const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function fixUser() {
  const phone = '14991262383';
  const fullName = 'Teste';

  // Find user in auth.users by listing them (since there is no getUserByPhone)
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("List users error:", error);
    return;
  }

  const existingUser = users.find(u => u.phone === phone || u.email?.includes(phone));
  
  if (existingUser) {
    console.log("Found existing user in auth.users:", existingUser.id);
    // Upsert into profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: existingUser.id,
        full_name: fullName,
        phone: phone,
        is_active: true,
        is_admin: false
      });

    if (profileError) {
      console.error("Profile Upsert Error:", profileError);
    } else {
      console.log("Profile fixed successfully.");
    }
  } else {
    console.log("User not found in auth.users");
  }
}

fixUser();

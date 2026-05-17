const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function test() {
  const phone = '11999999999' + Math.floor(Math.random() * 100);
  const fullName = 'Test User';
  const fakeEmail = `client_${phone}_${Date.now()}@ummaisumfotos.local`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: fakeEmail,
    phone: phone,
    password: `Pwd!${Math.random().toString(36).slice(-8)}`,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }

  const userId = authData.user.id;
  console.log("Created user:", userId);

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone,
      is_active: true,
      is_admin: false
    })
    .eq('id', userId);

  if (profileError) {
    console.error("Profile Error:", profileError);
  } else {
    console.log("Profile updated successfully.");
  }
}

test();


const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listBuckets() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key for now, maybe need service role? 
    // Actually server actions usually use service role equivalent or authenticated user. 
    // Let's try with service role if available, else anon.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets:", data.map(b => b.name));
    }
}

listBuckets();

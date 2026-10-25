import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dhkerczpvttjbcueuukl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ci83oLkpiAEJ-jq1G3ssUQ_PVkkmCiM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('registered_users').delete().neq('email', 'nexgenmobilehub55@gmail.com');
  console.log('Delete result:', { data, error });
}
test();

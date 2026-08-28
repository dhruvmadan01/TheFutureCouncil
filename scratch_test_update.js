const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://fwwbybbjvchrhozzzigp.supabase.co';
const supabaseKey = 'sb_publishable_f5qK_eS6qXGm5I7Em59aPQ_HvEH45h5';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const email = 'md.zarif.latif@g.bracu.ac.bd';
  const testVal = 'BRAC University, 4th Year | Phone: +8801308035203 | Fellowship: Yes | Society:  | RefBy: FELLOWSHIP | Q1: Test Q1 | Q2: Test Q2 | Q3: Test Q3';
  
  console.log("Attempting to update college field for email:", email);
  const { data, error } = await supabase
    .from('members')
    .update({ college: testVal })
    .eq('email', email)
    .select();
    
  if (error) {
    console.error("Update failed with error:", error);
  } else {
    console.log("Update response data:", data);
  }
}

testUpdate();

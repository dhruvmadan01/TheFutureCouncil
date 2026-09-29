-- Local/dev seed data: chapters, collections and a few demo startups.
-- Demo startups are owned by nobody (created_by null) and marked unclaimed.

insert into public.chapters (name, college, city, code) values
  ('TFC DU North',      'University of Delhi (North Campus)', 'Delhi',   'TFC-DU-01'),
  ('TFC NSUT',          'Netaji Subhas University of Technology', 'Delhi', 'TFC-NSUT-01'),
  ('TFC DTU',           'Delhi Technological University', 'Delhi',   'TFC-DTU-01'),
  ('TFC SRCC',          'Shri Ram College of Commerce', 'Delhi',     'TFC-SRCC-01'),
  ('TFC IIT Madras BS', 'IIT Madras BS Degree', 'Online',            'TFC-IITMBS-01')
on conflict (code) do nothing;

insert into public.startups (slug, name, one_liner, problem, solution, stage, industry, city, status_tags, verification_tier, claimed) values
  ('kisanlink', 'KisanLink', 'Helping small farmers sell crops directly to mandis',
   'Farmers lose 20–30% of crop value to layers of middlemen.', 'WhatsApp-first app that lists produce and matches nearby mandi buyers.',
   'launched', 'AgriTech', 'Delhi', '{needs_cofounder,hiring}', 'tfc_backed', false),
  ('preppal', 'PrepPal', 'AI mock interviews in Hindi', null, null, 'revenue', 'EdTech', 'Noida', '{hiring,raising}', 'verified', false),
  ('greenbin', 'GreenBin', 'Turning campus waste into compost', null, null, 'building', 'Climate', 'Delhi', '{needs_cofounder}', 'listed', false),
  ('feeflow', 'FeeFlow', 'UPI fee collection for coaching centres', null, null, 'idea', 'FinTech', 'Delhi', '{needs_cofounder}', 'listed', false)
on conflict (slug) do nothing;

insert into public.collections (slug, title, description, theme, is_published, sort_order) values
  ('launchpad-fellows-26', 'Launchpad Fellows ''26', 'The 20 founders in Fellowship ''26.', 'orange', true, 1),
  ('top-du', 'Top campus startups: DU', 'Built by Delhi University students.', 'forest', true, 2),
  ('built-for-bharat', 'Built for Bharat', 'Startups solving for the next 500 million.', 'amber', true, 3),
  ('ai-by-students', 'AI by students', 'AI products built on campus.', 'ink', true, 4)
on conflict (slug) do nothing;

insert into public.collection_items (collection_id, startup_id, position)
select c.id, s.id, 0 from public.collections c, public.startups s
where (c.slug, s.slug) in (('launchpad-fellows-26','kisanlink'), ('built-for-bharat','kisanlink'), ('top-du','greenbin'), ('ai-by-students','preppal'))
on conflict do nothing;

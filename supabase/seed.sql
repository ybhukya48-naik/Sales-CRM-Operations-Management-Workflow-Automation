-- Demo seed data for Cyond Operations Portal MVP
-- Run after migrations. Auth users must be created separately in Supabase Auth
-- (or use demo mode in the app without a live project).

-- Fixed UUIDs for deterministic local review
insert into public.lead_sources (id, name, description) values
  ('11111111-1111-1111-1111-111111111101', 'Google Ads', 'Paid search campaigns'),
  ('11111111-1111-1111-1111-111111111102', 'WhatsApp Referral', 'Customer / partner referrals via WhatsApp'),
  ('11111111-1111-1111-1111-111111111103', 'Website Form', 'cyond.in contact form'),
  ('11111111-1111-1111-1111-111111111104', 'Trade Show', 'Industry expo booth leads')
on conflict (name) do nothing;

insert into public.message_templates (id, name, body, channel) values
  (
    '22222222-2222-2222-2222-222222222201',
    'Day 0 — Intro',
    'Hi {{name}}, thanks for reaching out to Cyond! We help with waterproofing & structural repairs in {{city}}. When would be a good time for a quick call?',
    'whatsapp'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Day 3 — Value',
    'Hi {{name}}, sharing how Cyond diagnoses leakage root causes before quoting — so you only pay for what fixes the problem. Happy to walk you through a recent case.',
    'whatsapp'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Day 7 — Soft CTA',
    'Hello {{name}}, still exploring options for {{company}}? We can schedule a free site inspection this week. Reply YES and we will confirm a slot.',
    'whatsapp'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'Day 14 — Social proof',
    'Hi {{name}}, clients in Hyderabad often ask about warranty — every Cyond work order includes documented milestones and a warranty certificate. Want details?',
    'whatsapp'
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    'Day 30 — Last touch',
    'Hi {{name}}, closing the loop on your enquiry with Cyond. If timing is better later, just reply and we will pick it up — no pressure.',
    'whatsapp'
  )
on conflict (name) do nothing;

insert into public.nurture_sequences (id, name, description, is_active) values
  (
    '33333333-3333-3333-3333-333333333301',
    '30-Day Warm Lead',
    'Default WhatsApp nurture for warm enquiries — days 0, 3, 7, 14, 30.',
    true
  )
on conflict (name) do nothing;

insert into public.nurture_steps (id, sequence_id, day_offset, template_id, sort_order) values
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 0,  '22222222-2222-2222-2222-222222222201', 1),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 3,  '22222222-2222-2222-2222-222222222202', 2),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 7,  '22222222-2222-2222-2222-222222222203', 3),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 14, '22222222-2222-2222-2222-222222222204', 4),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333301', 30, '22222222-2222-2222-2222-222222222205', 5)
on conflict (sequence_id, day_offset) do nothing;

-- Note: prospects / tasks / profiles depend on auth.users.
-- Prefer the app demo mode (seeded in TypeScript) when no Supabase Auth users exist.

-- Capitolul 1 de circuite: „Primul circuit”, ca lecție nouă în Lumea lecțiilor.
--
-- De ce un rând nou și nu modificăm „Circuit Electric de Bază”:
--   lecția veche are și provocările cu motor, paralel și potențiometru, care vor fi refăcute
--   în capitolele 3–4. Până atunci rămâne publicată, așezată după capitolul 1.
--
-- Conținutul capitolului stă în repo (src/content/circuits/chapters/01-primul-circuit.ts).
-- Aici punem doar legătura: metadata.chapter = '01-primul-circuit'.
--
-- Unde se rulează: Supabase → SQL Editor (sau copiat în colabme-server/supabase/migrations/).
-- Se poate rula de mai multe ori: nu dublează rândul.

insert into public.lessons (
  slug,
  title,
  description,
  category,
  difficulty,
  template_type,
  thumbnail_url,
  min_xp_required,
  prerequisite_lesson_id,
  is_published,
  order_index,
  metadata
)
select
  'primul-circuit',
  'Primul circuit',
  'Afli ce face bateria, de ce curentul are nevoie de un drum complet și cum aprinzi un LED fără să-l arzi. 6 mini-lecții, cu exerciții și situații din viața reală.',
  'Fizică',
  1,
  'circuit_electric',
  thumbnail_url,
  0,
  null,
  true,
  19, -- înainte de „Circuit Electric de Bază” (20)
  '{"chapter": "01-primul-circuit"}'::jsonb
from public.lessons
where slug = 'circuit-electric-de-baza'
  and not exists (select 1 from public.lessons where slug = 'primul-circuit');

-- Verificare: trebuie să întoarcă un rând, cu chapter = 01-primul-circuit
select id, slug, title, order_index, metadata ->> 'chapter' as chapter
from public.lessons
where slug = 'primul-circuit';

-- Anulare (dacă e nevoie):
--   update public.lessons set is_published = false where slug = 'primul-circuit';
-- sau, de tot:
--   delete from public.lessons where slug = 'primul-circuit';

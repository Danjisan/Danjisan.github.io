# Audit cont, login, GDPR — checklist

> Audit din 2026-11-15 (client `danjisan.github.io` + migrațiile din `colabme-server`).
> Setările din dashboard-ul Supabase nu au putut fi verificate din cod — sunt marcate ca atare.
> Bifați când e făcut. Ordinea de lucru propusă: 1 → 2 → 3 → 4.

## 🔴 Critic

### 1. Escaladare de rol (oricine își putea da `admin`)
- [x] Clientul poate modifica doar `display_name` și `school_id`; trigger care blochează `role` / `xp` / `requested_role` din client — `colabme-server` `dcac905`, migrația `20261115_protect_profile_role.sql`
- [x] Rolul inițial îl decide trigger-ul de înregistrare; „profesor” rămâne în `requested_role` până la aprobare — client `dea40e7`
- [x] Migrația rulată în Supabase + verificat cine avea deja `admin` / `profesor`
- [ ] Test manual pe site live: cont nou „Profesor” → apare ca Vizitator cu nota de verificare; `update({ role: "admin" })` din consolă → eroare de permisiune
- [x] Ecran de admin `/admin/profesori`: cereri în așteptare (Aprobă / Respinge) și profesori activi (Revocă); verificarea se face întâi pe email, de un admin — `colabme-server` migrația `20261116_teacher_approval.sql` (funcții `admin_list_teachers`, `approve_teacher`, `reject_teacher`, `revoke_teacher`, jurnal în `private.role_changes`)
- [x] Migrația `20261116_teacher_approval.sql` rulată în Supabase (cu RLS pe `private.role_changes`) + verificarea (a): `anon` nu poate apela nicio funcție (2026-11-16)
- [ ] Testat pe site live: aprobare, respingere, revocare

### 2. Emailuri: nu există SMTP propriu
Serverul de email inclus în Supabase trimite doar către membrii echipei, cu limită de câteva mesaje pe oră. Fără SMTP propriu, ori confirmarea e oprită (oricine creează cont pe emailul altcuiva), ori emailurile nu ajung.
- [x] Ales furnizor SMTP din UE: Brevo
- [x] Domeniul `colabme.eu` autentificat în Brevo (brevo-code + DKIM la GoDaddy; DMARC exista deja)
- [x] Expeditor `no-reply@colabme.eu`; SMTP configurat în Supabase → Authentication → SMTP Settings (cheia SMTP fără expirare, dar Brevo o dezactivează după 90 de zile fără trimiteri)
- [ ] DPA Brevo descărcat și păstrat (e inclus în termenii lor)
- [ ] Verificat că linkul rescris de Brevo (click tracking, nu se poate opri pe planul gratuit) ajunge corect pe `/auth/confirm`
- [ ] Pornit „Confirm email” în Supabase — abia după punctul 3
- [ ] Șabloanele de email în română puse în Supabase — textele sunt în `docs/auth-email-templates.md`

### 3. Linkurile din email nu merg pe alt dispozitiv
Cu PKCE, linkul de confirmare / resetare funcționează doar în browserul din care s-a făcut cererea (ex. cerere pe laptop, mail deschis pe telefon → „Link invalid”). Filtrele de email (ex. Microsoft 365 la școli) deschid automat linkurile și consumă tokenul.
- [x] Pagină `/auth/confirm` care primește `token_hash` + `type` și apelează `verifyOtp` abia la click pe „Confirmă” (`src/pages/AuthConfirmPage.tsx`; resetarea și înregistrarea trimit `redirectTo` spre ea)
- [ ] Redirect URLs în Supabase: `/auth/confirm` pe colabme.eu, www și localhost
- [ ] Șabloanele Supabase (confirmare, resetare) schimbate să trimită spre `/auth/confirm?token_hash={{ .TokenHash }}&type=...`
- [ ] Testat cross-device: cerere pe laptop, link deschis pe telefon

## 🟠 Important

### 4. Mesaje la login și înregistrare
- [x] Cont neconfirmat: mesaj separat la login + buton „Retrimite emailul de confirmare” (`src/components/ResendConfirmation.tsx`)
- [x] După înregistrare: ecran „Verifică-ți emailul” în loc de „Cont creat cu succes! Poți să te loghezi acum.”
- [x] Erorile Supabase traduse în română (`src/lib/authErrors.ts`); „User already registered” arată același ecran ca succesul
- [x] „Nu știu dacă am cont”: mesaj la login care trimite spre „Am uitat parola” (fără să dezvăluim dacă emailul există)
- [ ] Testat pe site live, după pornirea „Confirm email”: cont nou → ecran „Verifică-ți emailul” → link → login; login înainte de confirmare → mesaj + retrimitere

### 5. YouTube pe pagina principală
`youtube-nocookie` pornit automat salvează date în browser și trimite IP-ul la Google fără acord (ePrivacy / Legea 506/2004).
- [ ] Playerul de pe pagina principală se încarcă doar după click, ca pe celelalte pagini
- [ ] (Opțional) thumbnail-uri găzduite local în loc de `i.ytimg.com`
- [ ] Actualizat textul din `/cookies` secțiunea 3

### 6. Ștergerea contului
- [ ] Verificat că funcția `delete_own_account` există în baza de date live (nu e în migrațiile din `colabme-server`)
- [ ] Pusă într-o migrație, ca să nu depindă de dashboard

### 7. Date expuse prin API (view-uri, funcții, RLS)
Tot ce e în schema `public` se poate citi prin API cu cheia publică a site-ului. RLS protejează tabelele, dar un view sau o funcție `security definer` rulează ca proprietarul lor și trece peste RLS.
- [x] `public.leaderboard` (nume, școală, `user_id` pentru toți utilizatorii, citibil de `anon`) mutat în `private.leaderboard`; clientul folosește `rpc('get_leaderboard')`, doar pentru utilizatori logați, fără `user_id` (2026-11-16, rulat în SQL Editor)
- [ ] Migrația pentru `leaderboard` / `get_leaderboard` copiată în `colabme-server`
- [ ] Rulat interogările de mai jos și rezolvat ce apare
- [ ] Security Advisor (Database → Advisors) rerulat după fiecare migrație nouă: 0 erori, avertismentele rămase sunt intenționate

<details>
<summary>Interogări de verificare (SQL Editor, câte una pe rând)</summary>

```sql
-- a) View-uri și materialized views din public care trec peste RLS
--    (materialized views ignoră RLS mereu → nu au ce căuta în public)
select c.relname, c.relkind
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('v', 'm')
  and not coalesce(array_to_string(c.reloptions, ',') ~* 'security_invoker=(on|true)', false);

-- b) Tabele din public fără RLS (oricine le poate citi și modifica)
select tablename from pg_tables
where schemaname = 'public' and not rowsecurity;

-- c) Politici RLS deschise tuturor (using/with check = true)
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and (qual = 'true' or with_check = 'true');

-- d) Funcții security definer din public: cine le poate apela
--    și dacă au search_path fixat (fără el pot fi deturnate)
select p.proname,
       has_function_privilege('anon', p.oid, 'execute') as anon_poate,
       has_function_privilege('authenticated', p.oid, 'execute') as logat_poate,
       p.proconfig as setari
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef;
```

Ce e în regulă: (a) gol; (b) gol; (c) doar date cu adevărat publice (ex. lista școlilor); (d) `anon_poate = false` peste tot, iar `setari` conține `search_path`. `get_leaderboard` cu `logat_poate = true` e intenționat.
</details>

## 🟡 GDPR — completări la texte

- [ ] Secțiune despre transferuri în afara UE (GitHub, Supabase Inc., Google — Data Privacy Framework / clauze contractuale standard)
- [ ] Temeiuri legale precise per scop: art. 6(1)(b) contract, art. 6(1)(f) interes legitim
- [ ] Serverul WebSocket / chatul din lobby: numit host-ul real și unde e găzduit
- [x] Furnizorul SMTP (Brevo) adăugat la procesatori (secțiunea 4), plus mențiunea despre urmărirea deschiderilor / click-urilor (secțiunile 2, 3, 6)
- [ ] Cerut la suportul Brevo dezactivarea / anonimizarea urmăririi deschiderilor și click-urilor (emailuri către minori)
- [ ] Minori: acord parental verificabil (confirmare pe emailul părintelui sau cont creat de profesor) în loc de doar bifă
- [ ] Rezumat scurt, pe înțelesul copiilor (GDPR art. 12)
- [ ] DPA Supabase acceptat în dashboard (dublat în „PIN — Legal review” din `COLABME.md`)

Banner de cookies: nu e necesar cât timp nu există analytics și video-ul nu pornește automat.

## Setări Supabase de verificat (în dashboard)

- [ ] Lungimea minimă a parolei = 8 (ca în client; implicit e 6)
- [ ] „Secure password change” pornit
- [ ] „Leaked password protection” (doar pe planul Pro)
- [ ] Limitele de cereri la autentificare (rate limits)
- [ ] Site URL + lista de redirect-uri (să coincidă cu `src/lib/authOrigin.ts`)
- [ ] CAPTCHA la înregistrare (Turnstile sau hCaptcha) — important după ce pornește trimiterea de emailuri

## Tehnic (fără urgență)

- [ ] `useAuth` mutat într-un `AuthProvider` (acum fiecare componentă face propria cerere de profil și propriul listener)

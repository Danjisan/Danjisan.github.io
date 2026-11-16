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
- [ ] (Mai târziu) ecran de admin pentru aprobarea cererilor de profesor — deocamdată SQL, vezi comentariile din migrație

### 2. Emailuri: nu există SMTP propriu
Serverul de email inclus în Supabase trimite doar către membrii echipei, cu limită de câteva mesaje pe oră. Fără SMTP propriu, ori confirmarea e oprită (oricine creează cont pe emailul altcuiva), ori emailurile nu ajung.
- [x] Ales furnizor SMTP din UE: Brevo
- [x] Domeniul `colabme.eu` autentificat în Brevo (brevo-code + DKIM la GoDaddy; DMARC exista deja)
- [x] Expeditor `no-reply@colabme.eu`; SMTP configurat în Supabase → Authentication → SMTP Settings (cheia SMTP fără expirare, dar Brevo o dezactivează după 90 de zile fără trimiteri)
- [ ] DPA Brevo descărcat și păstrat (e inclus în termenii lor)
- [ ] Click tracking oprit în Brevo pentru emailurile tranzacționale
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
- [ ] Cont neconfirmat: mesaj separat la login (acum apare „Email sau parolă incorecte”) + buton „Retrimite emailul de confirmare”
- [ ] După înregistrare: „Ți-am trimis un email de confirmare…” în loc de „Cont creat cu succes! Poți să te loghezi acum.”
- [ ] Erorile Supabase traduse în română la înregistrare (acum apar în engleză, ex. „User already registered”, care mai și confirmă că emailul are cont)
- [ ] „Nu știu dacă am cont”: mesaj care trimite spre „Am uitat parola” (fără să dezvăluim dacă emailul există)

### 5. YouTube pe pagina principală
`youtube-nocookie` pornit automat salvează date în browser și trimite IP-ul la Google fără acord (ePrivacy / Legea 506/2004).
- [ ] Playerul de pe pagina principală se încarcă doar după click, ca pe celelalte pagini
- [ ] (Opțional) thumbnail-uri găzduite local în loc de `i.ytimg.com`
- [ ] Actualizat textul din `/cookies` secțiunea 3

### 6. Ștergerea contului
- [ ] Verificat că funcția `delete_own_account` există în baza de date live (nu e în migrațiile din `colabme-server`)
- [ ] Pusă într-o migrație, ca să nu depindă de dashboard

## 🟡 GDPR — completări la texte

- [ ] Secțiune despre transferuri în afara UE (GitHub, Supabase Inc., Google — Data Privacy Framework / clauze contractuale standard)
- [ ] Temeiuri legale precise per scop: art. 6(1)(b) contract, art. 6(1)(f) interes legitim
- [ ] Serverul WebSocket / chatul din lobby: numit host-ul real și unde e găzduit
- [ ] Furnizorul SMTP adăugat la procesatori (secțiunea 4), după punctul 2
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

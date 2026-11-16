# Emailuri de autentificare — configurare Supabase

Linkurile din emailuri duc spre pagina `/auth/confirm` a site-ului
(`src/pages/AuthConfirmPage.tsx`). Pagina verifică tokenul abia când omul apasă
butonul, deci:
- linkul merge și deschis pe alt dispozitiv (cerere pe laptop, mail citit pe telefon);
- filtrele de email ale școlilor, care deschid automat linkurile, nu mai consumă tokenul.

`{{ .RedirectTo }}` e adresa trimisă de site (`getAuthConfirmRedirectTo()` din
`src/lib/authOrigin.ts`): `https://colabme.eu/auth/confirm` pe site-ul live,
`http://localhost:5173/auth/confirm` local.

## Ordinea de lucru

1. Deploy cu pagina `/auth/confirm` (codul trebuie să fie live înainte de pașii următori).
2. **Authentication → URL Configuration**
   - Site URL: `https://colabme.eu`
   - Redirect URLs — adaugă:
     - `https://colabme.eu/auth/confirm`
     - `https://www.colabme.eu/auth/confirm`
     - `http://localhost:5173/auth/confirm`
   - ⚠️ Dacă adresa nu e în listă, Supabase pune Site URL în loc, iar linkul
     ajunge pe pagina principală în loc de `/auth/confirm` și nu funcționează.
3. **Authentication → Emails → Templates**: copiază șabloanele de mai jos
   (subiect + conținut) și salvează.
4. În Brevo: oprește urmărirea click-urilor (click tracking) pentru emailurile
   tranzacționale, ca Brevo să nu rescrie linkurile.
5. Test „Am uitat parola”: cerere pe laptop, link deschis pe telefon.
6. Abia apoi: **Authentication → Sign In / Providers → Email → Confirm email** pornit.

Între pașii 1 și 3, linkurile de resetare trimise cu șablonul vechi ajung pe
`/auth/confirm` fără `token_hash` și afișează „Link invalid” — se cere un link nou.

---

## Confirm signup

**Subject:** `Confirmă contul tău ColabMe`

```html
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
  <h2 style="color: #111827;">Bine ai venit în ColabMe!</h2>
  <p>Ai creat un cont cu adresa <strong>{{ .Email }}</strong>. Ca să-l activezi, confirmă adresa de email:</p>
  <p style="margin: 28px 0;">
    <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup"
       style="background: #4f46e5; color: #ffffff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
      Confirmă emailul
    </a>
  </p>
  <p>Pe pagina care se deschide mai apasă o dată butonul „Confirmă emailul”.</p>
  <p style="font-size: 13px; color: #6b7280;">
    Dacă butonul nu merge, copiază în browser adresa:<br>
    {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup
  </p>
  <p style="font-size: 13px; color: #6b7280;">
    Nu ai creat tu acest cont? Ignoră mesajul — fără confirmare contul nu se activează.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="font-size: 12px; color: #9ca3af;">ColabMe · colabme.eu · Acest mesaj e trimis automat, te rugăm să nu răspunzi.</p>
</div>
```

## Reset password

**Subject:** `Resetează parola ColabMe`

```html
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
  <h2 style="color: #111827;">Resetare parolă</h2>
  <p>Cineva a cerut resetarea parolei pentru contul ColabMe asociat cu <strong>{{ .Email }}</strong>.</p>
  <p style="margin: 28px 0;">
    <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery"
       style="background: #4f46e5; color: #ffffff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
      Alege o parolă nouă
    </a>
  </p>
  <p>Linkul e valabil o oră și poate fi folosit o singură dată.</p>
  <p style="font-size: 13px; color: #6b7280;">
    Dacă butonul nu merge, copiază în browser adresa:<br>
    {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery
  </p>
  <p style="font-size: 13px; color: #6b7280;">
    Nu ai cerut tu resetarea? Ignoră mesajul — parola rămâne neschimbată.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="font-size: 12px; color: #9ca3af;">ColabMe · colabme.eu · Acest mesaj e trimis automat, te rugăm să nu răspunzi.</p>
</div>
```

## Celelalte șabloane

Magic Link, Change Email Address, Invite user și Reauthentication nu sunt
folosite de site acum. Dacă le pornim, primesc același tip de link
(`/auth/confirm?token_hash=…&type=…`) și tipul trebuie acceptat în
`parseConfirmLink` din `src/lib/authRecovery.ts`.

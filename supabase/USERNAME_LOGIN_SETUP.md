# Username login setup (not yet connected to the live page)

This change prepares a secure username-to-Supabase-Auth mapping. It does not change the published website.

## 1. Apply database migration
Run `supabase/migrations/202610280001_username_login.sql` in the Supabase SQL Editor.

## 2. Deploy the Edge Function
Deploy `supabase/functions/username-login/index.ts` as function `username-login`.

Set these Edge Function secrets in Supabase:
- `SUPABASE_URL`: project URL
- `SUPABASE_ANON_KEY`: public anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY`: the project's service-role/secret key (server-side only; never put it in GitHub Pages or frontend code).

## 3. Add the username mapping
Only after verifying the exact existing Auth account, run in SQL Editor:
```sql
insert into public.username_login (username, auth_email)
values ('rajabi730', 'THE_EXISTING_AUTH_USER_EMAIL');
```
Use the exact email shown for the intended user in Supabase Auth. Do not guess it. The mapping table is not readable by browser clients.

## 4. Frontend integration prepared on the feature branch
The `index.html` on this feature branch now prompts for username/password, calls `username-login` through the Supabase client, and stores the returned session with `auth.setSession`. The live `main` branch is unchanged. The username login will not work until the function is deployed, secrets are set, and the account mapping is verified. The existing sign-up/reset functions remain in source but are no longer shown in the login panel.

Important: this removes the email field from the login experience, but the underlying Supabase Auth account still has an email identity. Existing account password and any email-confirmation status remain unchanged.

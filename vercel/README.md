# Neuro Nutri Clinic — Vercel deployment

A ready-to-deploy version of the clinic site for Vercel.

- **Frontend:** React + Vite, built as static SPA
- **Backend:** Vercel Serverless Functions under `/api/*`
- **Database:** Postgres (Neon, Vercel Postgres, or Supabase)
- **Email:** Resend
- **Auth:** Email + password with HttpOnly session cookies

---

## One-time setup (about 20 minutes)

You'll need free accounts on three services:

1. **Neon** — free Postgres → https://neon.tech
2. **Resend** — free transactional email → https://resend.com
3. **Vercel** — free hosting → https://vercel.com

### Step 1 — Create the database (Neon)

1. Sign up at https://neon.tech and create a new project (any name, any region).
2. In the dashboard, copy the **Pooled connection string** (it ends in `-pooler...neon.tech/...?sslmode=require`). Save it for later — this is your `DATABASE_URL`.
3. Open the SQL Editor and paste the contents of `schema.sql` from this folder. Run it. You should see "users", "sessions", "enrollments" tables created.

### Step 2 — Set up email (Resend)

1. Sign up at https://resend.com.
2. Add and verify the domain you'll send from (e.g. `neuronutriclinic.com`). Resend will give you DNS records to add to your domain registrar. _If you don't have a domain yet, you can use Resend's `onboarding@resend.dev` sender for testing, but real launches need a verified domain._
3. Go to **API Keys** → create a key with **Send** permission. Save it — this is your `RESEND_API_KEY`.
4. Decide your sender address (e.g. `noreply@neuronutriclinic.com`). This is your `RESEND_FROM`.

### Step 3 — Push this folder to GitHub

1. Create a new empty repository on GitHub.
2. From this `vercel/` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 4 — Deploy on Vercel

1. Go to https://vercel.com → **Add New → Project**.
2. Import the GitHub repo from step 3.
3. Vercel will auto-detect Vite. Leave the build settings as defaults.
4. Under **Environment Variables**, add all of these:

   | Key                        | Value                                                                 |
   | -------------------------- | --------------------------------------------------------------------- |
   | `DATABASE_URL`             | Neon pooled connection string from Step 1                             |
   | `RESEND_API_KEY`           | Resend key from Step 2                                                |
   | `RESEND_FROM`              | e.g. `noreply@neuronutriclinic.com`                                   |
   | `NOTIFY_EMAIL`             | `shirinakhavi@yahoo.com` (where new enrollment notifications go)      |
   | `ADMIN_BOOTSTRAP_PASSWORD` | (optional) Password to log into the admin dashboard. Min 8 chars.     |

5. Click **Deploy**. First build takes 2–3 minutes.

After deploy, Vercel gives you a `*.vercel.app` URL. Click it to verify the site loads.

### Step 5 — Connect your custom domain (optional)

1. In the Vercel project → **Settings → Domains** → add `neuronutriclinic.com` (or whatever you own).
2. Follow Vercel's DNS instructions at your registrar.

---

## How admin login works

If you set `ADMIN_BOOTSTRAP_PASSWORD` in Step 4, the **first `/api/auth/login` request after each cold start** will create (or update) an admin user with email = `NOTIFY_EMAIL` and the password you set. The bootstrap is idempotent — running it again won't change an existing password. You can then log in at `/login` on the site and see the admin dashboard at `/admin`.

If you forget the password later: change `ADMIN_BOOTSTRAP_PASSWORD` in Vercel env vars, then in the Neon SQL editor run:

```sql
UPDATE users SET password_hash = NULL WHERE email = 'shirinakhavi@yahoo.com';
```

Next login attempt re-bootstraps the password from the new env var.

---

## Local development

```bash
npm install
cp .env.example .env  # fill in values
npx vercel dev        # runs frontend + serverless functions together at http://localhost:3000
```

(Requires `npm i -g vercel` once.)

For just the frontend without API:

```bash
npm run dev
```

---

## What's in this folder

```
vercel/
├── api/                 Serverless functions (one file = one endpoint)
│   ├── _lib/            Shared helpers (db, auth, email, schemas)
│   ├── auth/            signup, login, logout, me
│   ├── enroll.ts        Public enrollment submission
│   ├── my/              Patient-only endpoints (require session)
│   └── admin/           Admin-only endpoints
├── src/                 React frontend (Vite-built SPA)
├── public/              Static assets served at root
├── schema.sql           Run once on your Neon database
├── vercel.json          Vercel config (SPA rewrites)
├── .env.example         Template for env vars
└── package.json         Dependencies
```

---

## Security notes

- Sessions are HttpOnly, Secure, SameSite=Lax cookies; 30-day TTL.
- Passwords hashed with bcrypt (cost 10).
- Signup **never** grants admin — only the env-var bootstrap can.
- Anonymous enrollments are protected by one-time claim tokens so an attacker who knows a victim's email cannot link their enrollment to a new account.
- Production responses include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. HSTS is set automatically by Vercel's edge.

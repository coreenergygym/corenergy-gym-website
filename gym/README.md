# CoreNergy The Gym — Website + Admin Portal (v1)

Real, working foundation: public site wired to your actual gym photos, appointment/registration
forms that write to a real database, manual UPI/QR payment verification, and a secured admin
portal. Built with React + TypeScript + Tailwind + Supabase, deployable on Netlify.

## What's included

- **Public site**: hero, about, services, memberships, gallery (your real photos), contact,
  book-a-trial, membership registration + manual payment submission.
- **Database**: full schema (`supabase/schema.sql`) for every entity in the brief — settings,
  memberships, services, schedule, gallery, registrations, members, appointments, payments,
  receipts, admin logs — all with Row Level Security.
- **Admin portal**, fully wired to the database:
  - Locked first-time setup (locked server-side) + secure login (Supabase Auth) + protected routes
  - Dashboard with live stats
  - Registrations (search/filter/status/WhatsApp/convert-to-member)
  - Members (search/filter/status/WhatsApp)
  - Appointments (filter/status/WhatsApp)
  - Payments (verify/reject — verifying auto-generates a receipt)
  - Receipts (list + professional printable/PDF-via-print view)
  - Memberships (create/edit/delete plans)
  - Services (create/edit/delete)
  - Schedule (create/edit/delete class slots)
  - Gallery (real photo upload to Supabase Storage, captions, featured photo, enable/disable, delete)
  - Gym Settings (contact info, WhatsApp number, UPI ID, payment QR URL, about text)
- **WhatsApp**: plain `wa.me` click-to-chat links with pre-filled messages — no WhatsApp Business
  API, exactly as specified.
- **Payments**: customer submits a transaction reference; it's always saved as `PENDING`.
  Only an admin can mark it `VERIFIED` or `REJECTED` — a receipt is auto-created on verification.

## What's still worth adding later

- Payment proof screenshot upload on the customer registration form (the `payment-proofs`
  Storage bucket and `proof_url` column already exist for this)
- Basic rate limiting on the public insert endpoints (Supabase doesn't do this per-table out of
  the box — usually handled with a Cloudflare/Netlify edge function or Supabase Edge Function)
- Admin activity logging into `admin_logs` (table exists, nothing writes to it yet)
- A dedicated "convert registration to member" flow that also creates the member's first payment
  record automatically

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Go to **Storage** and create two buckets: `gallery` (public) and `payment-proofs` (private) —
   or run the two commented `insert into storage.buckets` lines at the bottom of the schema file.
4. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the two Supabase values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never put your Supabase **service_role** key anywhere in this project — the anon key is the only
one the frontend should ever see, and Row Level Security is what keeps data safe with it.

## 3. Run locally

```bash
npm install
npm run dev
```

## 4. Create the first admin account

Visit `/admin/setup` **once**. Create your admin name, email, and password. After that succeeds,
the setup page locks itself permanently (enforced in the database, not just the UI) — from then
on, use `/admin/login`.

## 5. Add your real business data

Log into `/admin`:
- **Gym Settings** → phone, WhatsApp number, email, address, hours, UPI ID, payment QR image URL.
- Add rows to **memberships**, **services**, **schedule_slots**, **gallery_photos** directly in
  the Supabase Table Editor for now (admin screens for these are the next phase).

## 6. Deploy to Netlify

1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Build command: `npm run build`, publish directory: `dist` (already set in `netlify.toml`).
4. In **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

## Security notes

- Only the anon key ships to the browser; all writes are gated by Postgres Row Level Security
  policies in `schema.sql`.
- Customers can only ever *insert* registrations/appointments/payments — they can never read
  other customers' data or set a payment to `VERIFIED` themselves.
- The `/admin/setup` route is locked server-side via the `complete_initial_setup` function, which
  refuses to run a second time.

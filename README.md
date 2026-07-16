# 🐄 Laxmi Dairy — Online Store

Only 8 files, no nested folders except one flat `api` folder — easy to
upload to GitHub in one drag.

```
laxmi-dairy/
  index.html          <- the storefront (home, cart, checkout, tracking)
  admin.html           <- admin dashboard (login, orders, print label)
  package.json          <- one dependency
  .env.example
  api/
    orders.js           <- create order (POST) + list orders for admin (GET)
    order-status.js      <- admin updates an order's status
    track.js              <- public order tracking
    admin-login.js        <- admin password check
```

## Deploy (step by step)

### 1. Upload to GitHub
- Go to [github.com](https://github.com) → New repository → name it `laxmi-dairy` → Create.
- On the empty repo page, click **"uploading an existing file"**.
- Drag ALL 8 files/folders from this project (including the `api` folder) into the browser window at once. GitHub keeps the `api` folder structure automatically.
- Click **Commit changes**.

### 2. Deploy to Vercel
- Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import `laxmi-dairy`.
- Framework Preset: leave as **Other** (Vercel detects the `api` folder automatically).
- Click **Deploy**. It may fail the first time — that's expected, continue to step 3.

### 3. Add the database + admin password
- In your Vercel project, go to **Storage → Create Database → Postgres** → connect it. This auto-fills the database settings.
- Go to **Settings → Environment Variables**, add:
  - Name: `ADMIN_KEY`, Value: any password you choose (this logs you into `/admin.html`).
- Go to **Deployments** → click **Redeploy**.

Your site is now live at a link like `https://laxmi-dairy.vercel.app`.
Visit `https://laxmi-dairy.vercel.app/admin.html` and log in with your `ADMIN_KEY`.

## Editing things later
- **Products/prices**: edit the `PRODUCTS` list near the top of `index.html`'s `<script>`, AND the matching list in `api/orders.js` (prices are re-checked there for security) — keep both in sync.
- **Payment number**: search for `9392530367` in `index.html` and replace it.
- **Dairy address**: search for "Ranjini Village" in `index.html` and `admin.html`.

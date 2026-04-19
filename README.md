# Studio Pilates

A boutique pilates studio site with live class schedule, instructor bios, and Stripe-powered bookings — built with Astro, Supabase, Stripe, and Resend.

## What was built

- Homepage with hero, class highlights, studio values, and instructor preview
- Classes hub + 6 class detail pages (reformer, mat, tower, prenatal, private, beginner-foundations)
- Live schedule pulled from Supabase, filterable by class type and instructor
- Instructors hub + 4 bio pages
- Booking flow: /book -> Stripe Checkout -> /book/success, plus /book/cancel
- Webhook /api/stripe/webhook confirms booking, increments session spots, sends Resend email
- Pricing, Testimonials, About, FAQ, Contact pages
- Journal /blog + /blog/[slug] rendering dynamically from Supabase content table
- SEO: @astrojs/sitemap, robots.txt, canonical URLs, JSON-LD schema

## Stack

- Astro 5 (SSR on Vercel)
- Tailwind v4
- Supabase (DB)
- Stripe (checkout)
- Resend (email)

## Supabase schema

- instructors, classes, class_sessions, bookings, content

## Environment variables

See .env.example.

## Local dev

```
npm install --legacy-peer-deps
npm run dev
```

## TODO (user)

- Connect custom domain in Vercel
- Swap placeholder photos
- Verify Resend domain

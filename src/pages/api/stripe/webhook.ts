import type { APIRoute } from 'astro';
import { getSupabase } from '../../../lib/supabase';
import { stripe, formatGBP } from '../../../lib/stripe';
import { sendEmail, bookingConfirmationEmail } from '../../../lib/email';

export const prerender = false;
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET ?? '';

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature') ?? '';
  const rawBody = await request.text();
  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (err: any) {
    return new Response(`webhook error: ${err.message}`, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const checkout = event.data.object as any;
    const supabase = getSupabase();
    const classSessionId = checkout.metadata?.class_session_id;
    const customerName = checkout.metadata?.customer_name ?? 'there';
    const customerEmail = checkout.customer_email ?? checkout.customer_details?.email;
    const className = checkout.metadata?.class_name ?? 'Your pilates class';
    const instructorName = checkout.metadata?.instructor_name ?? 'our team';
    const startsAtIso = checkout.metadata?.starts_at;
    const startsFormatted = startsAtIso ? new Date(startsAtIso).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'your booked time';
    const { data: existing } = await supabase.from('bookings').select('id').eq('stripe_session_id', checkout.id).maybeSingle();
    if (existing) {
      await supabase.from('bookings').update({ status: 'confirmed', amount_paid_pence: checkout.amount_total ?? 0 }).eq('id', existing.id);
    } else if (classSessionId) {
      await supabase.from('bookings').insert({ session_id: classSessionId, customer_email: customerEmail, customer_name: customerName, amount_paid_pence: checkout.amount_total ?? 0, currency: (checkout.currency ?? 'gbp').toUpperCase(), stripe_session_id: checkout.id, status: 'confirmed' });
    }
    if (classSessionId) {
      const { data: sess } = await supabase.from('class_sessions').select('spots_booked').eq('id', classSessionId).maybeSingle();
      if (sess) await supabase.from('class_sessions').update({ spots_booked: (sess.spots_booked ?? 0) + 1 }).eq('id', classSessionId);
    }
    if (customerEmail) {
      await sendEmail({ to: customerEmail, subject: `Booked: ${className} at Studio Pilates`, html: bookingConfirmationEmail({ customerName, className, instructor: instructorName, startsAt: startsFormatted, amount: formatGBP(checkout.amount_total ?? 0) }) });
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

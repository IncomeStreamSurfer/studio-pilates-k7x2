import type { APIRoute } from 'astro';
import { getSupabase } from '../../lib/supabase';
import { stripe } from '../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { session_id, name, email } = body;
    if (!session_id || !name || !email) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    const supabase = getSupabase();
    const { data: session } = await supabase.from('class_sessions').select('*, class:classes(*), instructor:instructors(*)').eq('id', session_id).maybeSingle();
    if (!session || !session.class) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
    if (session.spots_booked >= session.capacity) return new Response(JSON.stringify({ error: 'Fully booked' }), { status: 409 });
    const origin = new URL(request.url).origin;
    const startsFormatted = new Date(session.starts_at).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ quantity: 1, price_data: { currency: (session.class.currency || 'GBP').toLowerCase(), unit_amount: session.class.price_pence, product_data: { name: `${session.class.name} at Studio Pilates`, description: `${startsFormatted} with ${session.instructor?.name ?? 'our team'}`, images: session.class.image_url ? [session.class.image_url] : undefined } } }],
      customer_email: email,
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/cancel`,
      metadata: { class_session_id: session_id, customer_name: name, customer_email: email, class_name: session.class.name, starts_at: session.starts_at, instructor_name: session.instructor?.name ?? '' },
    });
    await supabase.from('bookings').insert({ session_id, customer_email: email, customer_name: name, amount_paid_pence: session.class.price_pence, currency: session.class.currency, stripe_session_id: checkout.id, status: 'pending' });
    return new Response(JSON.stringify({ url: checkout.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[checkout]', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Server error' }), { status: 500 });
  }
};

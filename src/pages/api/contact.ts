import type { APIRoute } from 'astro';
import { sendEmail } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    await sendEmail({
      to: 'hello@studio-pilates.com',
      subject: `[Contact form] — ${name}`,
      html: `<h2>Message from the site</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${(message as string).replace(/\n/g, '<br/>')}</p>`,
      replyTo: email,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

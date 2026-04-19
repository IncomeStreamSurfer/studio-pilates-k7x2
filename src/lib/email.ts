const RESEND_API_KEY = import.meta.env.RESEND_API_KEY ?? '';

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY missing — skipping send');
    return { ok: false, error: 'missing_resend_key' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: opts.from ?? 'Studio Pilates <onboarding@resend.dev>',
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text };
    }
    const data: any = await res.json();
    return { ok: true, id: data.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export function bookingConfirmationEmail(params: {
  customerName: string;
  className: string;
  instructor: string;
  startsAt: string;
  amount: string;
}): string {
  const { customerName, className, instructor, startsAt, amount } = params;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF6F1; color: #1B1A16;">
      <div style="text-align:center; margin-bottom: 32px;">
        <div style="display:inline-flex; width:48px; height:48px; border-radius:999px; background:#1B1A16; color:#FAF6F1; font-family:Georgia, serif; font-style:italic; font-size:22px; align-items:center; justify-content:center;">sp</div>
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; margin: 16px 0 4px; font-weight: 400;">You're booked in.</h1>
        <p style="color:#6B6758; margin: 0;">See you on the mat, ${customerName}.</p>
      </div>
      <div style="background:#ffffff; border:1px solid #E6DCC8; border-radius:16px; padding:24px;">
        <p style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#C4634A; margin:0 0 8px; font-weight:600;">Your class</p>
        <h2 style="font-family: Georgia, serif; font-size: 24px; margin: 0 0 4px; font-weight:400;">${className}</h2>
        <p style="color:#3A3831; margin: 0 0 16px;">with ${instructor}</p>
        <div style="border-top:1px solid #E6DCC8; padding-top:16px; color:#3A3831; font-size:14px; line-height:1.7;">
          <div><strong style="color:#1B1A16;">When:</strong> ${startsAt}</div>
          <div><strong style="color:#1B1A16;">Paid:</strong> ${amount}</div>
          <div><strong style="color:#1B1A16;">Where:</strong> 42 Arbour Lane, London SE1 3QX</div>
        </div>
      </div>
      <div style="margin-top:24px; font-size:14px; color:#6B6758; line-height:1.7;">
        <p style="margin:0 0 12px;"><strong style="color:#1B1A16;">What to bring:</strong> grippy socks, a water bottle, and yourself. We provide everything else.</p>
        <p style="margin:0 0 12px;"><strong style="color:#1B1A16;">Arriving:</strong> please come 10 minutes early for your first class so we can show you around.</p>
        <p style="margin:0;"><strong style="color:#1B1A16;">Cancellation:</strong> cancel up to 12 hours before start for a full refund.</p>
      </div>
      <div style="margin-top:32px; text-align:center; color:#8E897A; font-size:12px;">
        Studio Pilates · 42 Arbour Lane, London SE1 3QX
      </div>
    </div>
  `;
}

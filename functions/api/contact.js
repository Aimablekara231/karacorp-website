const MAX_FIELD_LENGTH = 2400;
const ALLOWED_ORIGINS = new Set([
  'https://karacorp.org',
  'https://www.karacorp.org',
]);

function jsonResponse(payload, status = 200, origin = '') {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'POST, OPTIONS';
    headers['access-control-allow-headers'] = 'content-type';
    headers.vary = 'Origin';
  }

  return new Response(JSON.stringify(payload), { status, headers });
}

function sanitize(value) {
  return String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyTurnstile(token, env, request) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: 'missing-turnstile-token' };

  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const result = await response.json();
  return { ok: Boolean(result.success), result };
}

async function notifyWebhook(payload, env) {
  if (!env.NOTIFICATION_WEBHOOK_URL) return;

  await fetch(env.NOTIFICATION_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function onRequestOptions({ request }) {
  return jsonResponse({ ok: true }, 200, request.headers.get('Origin') || '');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('form')) {
      return jsonResponse({ ok: false, message: 'Unsupported submission format.' }, 415, origin);
    }

    const data = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());

    if (sanitize(data.website)) {
      return jsonResponse({ ok: true, message: 'Thank you. Your enquiry has been received.' }, 200, origin);
    }

    const submission = {
      formType: sanitize(data.form_type || data.topic || 'Website enquiry'),
      fullName: sanitize(data.full_name),
      email: sanitize(data.email),
      phone: sanitize(data.phone),
      organization: sanitize(data.organization),
      category: sanitize(data.partnership_category || data.topic),
      message: sanitize(data.message),
      source: sanitize(data.source || request.headers.get('referer') || 'karacorp.org'),
      submittedAt: new Date().toISOString(),
    };

    if (!submission.fullName || !isEmail(submission.email) || !submission.message) {
      return jsonResponse({ ok: false, message: 'Please provide your name, a valid email, and a message.' }, 400, origin);
    }

    const turnstile = await verifyTurnstile(sanitize(data['cf-turnstile-response']), env, request);
    if (!turnstile.ok) {
      return jsonResponse({ ok: false, message: 'Verification failed. Please try again.' }, 403, origin);
    }

    context.waitUntil(notifyWebhook(submission, env));

    return jsonResponse({
      ok: true,
      message: 'Thank you. Your enquiry has been received by KaraCorp.',
    }, 200, origin);
  } catch (error) {
    console.error(JSON.stringify({ message: 'contact-submission-error', error: String(error) }));
    return jsonResponse({ ok: false, message: 'We could not submit the form. Please email info@karacorp.org.' }, 500, origin);
  }
}

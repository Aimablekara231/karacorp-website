# Cloudflare Pages Functions

`functions/api/contact.js` provides a deploy-time form endpoint at `/api/contact`.

Environment variables:

- `NOTIFICATION_WEBHOOK_URL`: optional HTTPS webhook for forwarding submissions to an email, CRM, or automation service.
- `TURNSTILE_SECRET_KEY`: optional Cloudflare Turnstile secret. If present, submissions must include `cf-turnstile-response`.

The HTML forms still keep a `mailto:` fallback for local preview and email-client fallback.

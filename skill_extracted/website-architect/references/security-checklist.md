# Security Checklist Reference

Use this during Stage 4 to generate a project-specific security section in the implementation plan.

---

## Universal Security Rules (Always Include)

### Authentication & Sessions
- [ ] Use a proven auth library (Clerk, Supabase Auth, NextAuth) — never build your own from scratch
- [ ] Passwords must be hashed with bcrypt, Argon2, or scrypt — NEVER stored in plain text
- [ ] JWT tokens must have short expiry (15–60 minutes for access tokens)
- [ ] Refresh tokens must be stored securely (httpOnly cookies, not localStorage)
- [ ] Implement account lockout after repeated failed login attempts
- [ ] Enable Multi-Factor Authentication (MFA) option for sensitive accounts

### Input Validation & Injection Prevention
- [ ] Validate ALL user inputs on the server side — never trust client-side validation alone
- [ ] Use parameterized queries or an ORM — never concatenate SQL strings
- [ ] Sanitize HTML output to prevent Cross-Site Scripting (XSS) attacks
- [ ] Validate file uploads: check file type, size, and scan for malware

### API Security
- [ ] Rate limiting on all API endpoints (especially login, signup, password reset)
- [ ] CORS configured to only allow your own domain(s)
- [ ] API keys and secrets stored in environment variables — never committed to Git
- [ ] HTTP security headers set: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options
- [ ] HTTPS enforced everywhere — no HTTP traffic allowed

### Data Protection
- [ ] Sensitive data (PII, payment info) encrypted at rest in the database
- [ ] Database not exposed to the public internet — only accessible from backend
- [ ] Regular automated backups with tested restore process
- [ ] Data retention policy defined — delete data you no longer need
- [ ] HTTPS/TLS 1.2+ for all data in transit

### Dependency & Code Security
- [ ] Run `npm audit` / `pip check` / `bundle audit` before launch and regularly
- [ ] Keep all dependencies up to date — set up Dependabot or Renovate
- [ ] No secrets or API keys in Git history — use `.gitignore` and environment variables
- [ ] Review third-party packages before adding them

### Infrastructure
- [ ] Principle of least privilege — each service only has permissions it needs
- [ ] Firewall configured — only necessary ports open (80, 443)
- [ ] Error messages in production never expose stack traces or internal details
- [ ] Logging set up for suspicious activity (failed logins, unusual traffic)
- [ ] DDoS protection (Cloudflare free tier is sufficient for most small apps)

---

## Project-Type Specific Checks

### E-commerce / Payments ⚠️ HIGH RISK
- [ ] Never store raw credit card data — use Stripe, Paddle, or LemonSqueezy
- [ ] PCI-DSS compliance handled by payment processor — verify this
- [ ] Order IDs and prices always validated on the server (never trust client-side cart totals)
- [ ] Webhook signatures verified (e.g. Stripe webhook secret)
- [ ] Fraud detection enabled on payment provider

### User-Generated Content (Social, Forum, Marketplace) ⚠️ HIGH RISK
- [ ] Content moderation system (manual or automated) in place before launch
- [ ] Rate limiting on post/comment creation
- [ ] File uploads scanned and served from a separate domain/CDN (not your main domain)
- [ ] User reporting mechanism built in
- [ ] DMCA takedown process defined

### SaaS / Multi-Tenant Apps ⚠️ HIGH RISK
- [ ] Tenant isolation verified — users can NEVER access another organization's data
- [ ] Row-level security (RLS) enabled in database (Supabase makes this easy)
- [ ] Audit logs for sensitive actions (data export, user deletion, billing changes)
- [ ] Subscription status checked on every request to protected resources

### Apps Handling Health / Financial Data ⚠️ CRITICAL
- [ ] HIPAA compliance reviewed if handling health data (US)
- [ ] GDPR compliance reviewed if serving EU users
- [ ] Data processing agreement with all third-party services
- [ ] Penetration test before launch

### Authentication-Heavy Apps
- [ ] Password reset links are single-use and expire within 1 hour
- [ ] Email verification required before account activation
- [ ] Social login tokens never stored permanently
- [ ] Session invalidation on password change

---

## Compliance Quick Reference

| Regulation | When It Applies | Key Requirements |
|---|---|---|
| GDPR | Serving users in the EU | Cookie consent, right to deletion, data portability |
| CCPA | Serving users in California | Right to know, opt-out of data sale |
| PCI-DSS | Handling payment cards | Use Stripe/Paddle, never store raw card data |
| HIPAA | Health data in the US | Encryption, audit logs, BAA with vendors |
| COPPA | Users under 13 in the US | Parental consent required |

---

## Security Launch Checklist (Final Check Before Going Live)

- [ ] All environment variables set in production (not `.env` file)
- [ ] Debug mode / development logs turned OFF
- [ ] Admin accounts use strong passwords + MFA enabled
- [ ] SSL certificate active and auto-renewing
- [ ] Backup system tested (actually restored a backup)
- [ ] Error monitoring set up (Sentry free tier)
- [ ] Rate limiting active on auth endpoints
- [ ] `npm audit` run, no critical vulnerabilities
- [ ] CORS policy reviewed and locked down
- [ ] Robots.txt configured to block admin/api routes from search engines

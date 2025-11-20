# Security Guidelines for vibecode-next-firebase-starter

This document provides actionable, security-by-design recommendations tailored to the `vibecode-next-firebase-starter` project. It addresses authentication, data protection, API security, and infrastructure hardening to ensure a robust, production-ready foundation for VibeCode.

---

## 1. Security by Design

- Embed security at every stage: design, implementation, testing, and deployment.
- Establish a threat model for AI proxy, user flows, and data storage.
- Conduct periodic code reviews and security audits as features evolve.

---

## 2. Authentication & Access Control

### 2.1 Clerk Integration
- **Secure Defaults:** Enforce secure cookie flags (`HttpOnly`, `Secure`, `SameSite=Strict`).
- **Session Management:**
  - Set idle and absolute timeouts.
  - Rotate session tokens on privilege changes.
  - Invalidate sessions on logout or password change.
- **RBAC:** Define roles (e.g., user, admin) in Clerk and restrict API routes (`/api/ai`) via middleware.
- **MFA Support:** Encourage or mandate two-factor authentication for administrative users.

### 2.2 Route Protection
- Use Next.js middleware to guard generator pages:
  ```ts
  // middleware.ts
  import { clerkMiddleware } from '@clerk/nextjs/server';
  export default clerkMiddleware({
    publicRoutes: ['/public'],
    protectedRoutes: ['/idea-generator', '/prd-generator'],
  });
  ```
- Fallback: redirect unauthenticated users to the sign-in page.

---

## 3. Input Handling & Validation

### 3.1 API Route (`/api/ai/route.ts`)
- **Validate with Zod**: Ensure `prompt` is a nonempty string and `agent` is an allow-listed value.
- **Limit Payload Size**: Reject requests exceeding a reasonable JSON body limit (e.g., 5 KB).
- **Reject Unexpected Fields**: Strip or reject unknown properties.

### 3.2 Injection Prevention
- Do not interpolate user input into database queries or shell commands.
- Use parameterized calls or official SDKs for Firestore.
- Sanitize any data rendered into HTML (e.g., PRD Download previews).

---

## 4. Data Protection & Privacy

### 4.1 Environment & Secrets
- Store API keys in a secure vault (e.g., Vercel Secrets, HashiCorp Vault) rather than plain `.env` files in version control.
- Rotate keys periodically and on any suspected leak.

### 4.2 Encryption
- Enforce TLS 1.2+ for all endpoints (Next.js auto-configures on Vercel).
- Enable Firestore in-transit and at-rest encryption (default).

### 4.3 Sensitive Data Handling
- Never log full AI responses or PII. Mask or hash identifiers in logs.
- If saving conversation history, store only metadata and redact sensitive content.

---

## 5. API & Service Security

### 5.1 Rate Limiting & Throttling
- Apply per-IP and per-user rate limits on `/api/ai` to mitigate abuse and DoS.
- Use middleware (e.g., `express-rate-limit` or a cloud provider’s rate-limit service).

### 5.2 CORS Configuration
- Allow only trusted origins (e.g., your production domain).
- Deny wildcard (`*`) origins on any state-changing endpoint.

### 5.3 Versioning
- Prefix API routes (e.g., `/api/v1/ai`) to enable safe upgrades and deprecations.

---

## 6. Web Application Security Hygiene

### 6.1 Security Headers (Next.js `next.config.js`)
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload`
- **Content-Security-Policy**: Restrict scripts, frames, and styles to trusted sources.
- **X-Frame-Options**: `DENY` to prevent clickjacking.
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `no-referrer-when-downgrade`

### 6.2 CSRF Protection
- Generate and validate anti-CSRF tokens on state-modifying POST requests.
- Leverage Next.js built-in CSRF middleware or set custom header checks.

### 6.3 Secure Cookies
- Set `SameSite=Strict` for session cookies.
- Avoid storing tokens in `localStorage` or `sessionStorage`.

---

## 7. Infrastructure & Configuration Management

- **Harden Hosting**: Use Vercel’s managed Next.js environment or a similarly secured platform.
- **Principle of Least Privilege**: Grant Firestore service accounts minimal read/write scope.
- **SSH & Admin Access**: Restrict administrative consoles to allow-listed IPs.
- **Disable Debugging**: Ensure `NODE_ENV=production` in live environments; remove stack traces in responses.

---

## 8. Dependency Management

- Maintain a lockfile (`package-lock.json`) and audit dependencies regularly.
- Integrate SCA tools (e.g., GitHub Dependabot, Snyk) into CI to detect vulnerabilities.
- Remove unused packages to minimize the attack surface.

---

## 9. Testing & Continuous Validation

- Write unit tests for `/api/ai` logic, including edge cases and error paths.
- Use integration tests to simulate AI proxy flows with mocked provider responses.
- Automate security checks in CI (linting, type checks, dependency audits).

---

## 10. Next Steps & Monitoring

- Enable runtime logging and set up alerts for unusual error rates or traffic spikes.
- Schedule periodic security reviews after each major feature rollout.
- Plan a disaster-recovery procedure for compromised secrets or data breaches.

---

By following these guidelines, the `vibecode-next-firebase-starter` will uphold strong security standards, safeguard user data, and provide a reliable foundation for the VibeCode application.
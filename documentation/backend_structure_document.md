# Backend Structure Document for VibeCode

## 1. Backend Architecture

Our backend is built on Next.js’s App Router, using its API Routes as a Node.js environment. We follow these key patterns and choices:

- **API Proxy Pattern**: A single `/api/ai` route acts as a gateway to multiple AI providers (Gemini, Claude, Groq). This keeps API keys hidden from the client and centralizes error handling and rate limiting.
- **Serverless Functions**: Each API Route runs as a serverless function (for example, on Vercel), giving you automatic horizontal scaling and no server maintenance.
- **Modular Design**:
  - `app/api/ai/route.ts` handles AI requests.
  - Separate service modules (e.g. `lib/ai-providers/gemini.ts`) encapsulate each provider’s logic.
  - Custom hooks (e.g. `hooks/useAIStream`) keep page components clean.
- **Scalability & Performance**:
  - Stateless functions that scale on demand.
  - Built-in CDN caching of static assets and API responses via Vercel’s edge network.
  - Optional integration with Redis or in-memory caches for hot data.

## 2. Database Management

We use **Firebase Firestore** (NoSQL) for storing user-specific data:

- **Why Firestore?**
  - Fully managed, serverless database.
  - Real-time listeners and offline support.
  - Seamless integration with our existing Firebase setup.

- **Data Access & Security**
  - Firebase SDK configured in `lib/firebase.ts`.
  - Firestore security rules govern read/write based on user UID.
  - Environment variables (`.env.local`) hold the Firebase project credentials.

- **Data Practices**
  - Use batched writes for multi‐document updates.
  - Index frequently queried fields (e.g. `createdAt`, `agent`).
  - Archive or delete old conversations periodically to control storage costs.

## 3. Database Schema (Firestore)

All data lives in top-level collections. Documents are simple objects with predictable fields.

Collection: **users**
- Document ID: (firebase auth UID)
- Fields:
  - `email`: string
  - `name`: string
  - `createdAt`: timestamp
  - `lastSeen`: timestamp

Collection: **conversations**
- Document ID: auto-generated
- Fields:
  - `userId`: reference to `users`
  - `agent`: string (e.g. “Claude Sonnet 4.5”)  
  - `prompt`: string  
  - `messages`: array of objects *or* a subcollection
    - Each message object:
      - `sender`: “user” or “ai”
      - `text`: string
      - `timestamp`: timestamp
  - `createdAt`: timestamp

Collection: **prds**
- Document ID: auto-generated
- Fields:
  - `userId`: reference to `users`
  - `title`: string
  - `content`: string (could be Markdown or plain text)
  - `agent`: string
  - `createdAt`: timestamp

## 4. API Design and Endpoints

We expose a small, focused set of RESTful endpoints under `/api/`:

- **POST /api/ai**
  - Purpose: Receive a prompt and selected agent from the frontend, then proxy to the chosen AI provider.
  - Input Body: `{ agent: string, prompt: string }`
  - Output: streaming or JSON response containing the AI’s message.
  - Features: input validation with Zod, error handling middleware.

- **GET /api/conversations?userId=UID**
  - Purpose: Fetch a user’s past conversations (for reload history feature).
  - Query Params: `userId` (string)
  - Output: list of conversation documents.

- **POST /api/conversations**
  - Purpose: Save a new conversation to Firestore.
  - Input Body: `{ userId, agent, prompt, messages }`

- **GET /api/prds?userId=UID**
  - Purpose: List all saved PRDs for a user.

- **POST /api/prds**
  - Purpose: Save a generated PRD document.
  - Input Body: `{ userId, title, content, agent }`

## 5. Hosting Solutions

We recommend deploying to **Vercel** or a similar serverless provider:

- **Vercel**
  - Native support for Next.js and API Routes.
  - Global edge network for ultra-low latency.
  - Automatic scaling — no capacity planning.
  - Encrypted environment variable management.
  - Built-in Analytics & Logging.

- **Firebase** (for Firestore & potential Cloud Functions)
  - No-ops database management.
  - Easy rule-based security.
  - Optional Cloud Functions for custom backend logic.

## 6. Infrastructure Components

- **Edge CDN**: Vercel’s global CDN caches static assets (JS, CSS, images) and can cache API responses at the edge.
- **Load Balancing**: Automatic within Vercel — routes API traffic across multiple function instances.
- **Caching**:
  - HTTP caching headers on static assets.
  - Optional Redis for hot data or rate-limiting state.
- **CI/CD Pipeline**:
  - GitHub Actions or Vercel’s Git integration — automatic builds on push.
- **Environment Management**:
  - `.env.local` for local development.
  - Vercel’s Dashboard for production secrets.

## 7. Security Measures

- **Authentication & Authorization**:
  - **Clerk** handles sign-up, sign-in, and session tokens.
  - Next.js `middleware.ts` protects routes or API endpoints based on user roles.
- **Input Validation**:
  - **Zod** schemas in API Routes to enforce correct request shapes.
- **Encryption**:
  - HTTPS everywhere (Vercel & Firebase enforce TLS).
  - Firestore data is encrypted at rest and in transit by default.
- **Secrets Management**:
  - API keys for AI providers stored in environment variables.
- **Rate Limiting & Abuse Protection**:
  - Basic rate limiting logic in the `/api/ai` route.
  - Potential to add a service belt like Upstash or Redis-based counters.

## 8. Monitoring and Maintenance

- **Logs & Error Tracking**:
  - Vercel’s built-in logs for API Routes.
  - Optional Sentry integration for unhandled exceptions and performance traces.
- **Performance Monitoring**:
  - Vercel Analytics for request latencies.
  - Firebase Performance Monitoring for client-side metrics.
- **Maintenance Practices**:
  - Scheduled dependency updates via Dependabot.
  - Regular audits with `npm audit` and `eslint`.
  - Automated tests for API Routes (Jest + Supertest) and UI components (React Testing Library).

## 9. Conclusion and Overall Backend Summary

This backend setup leverages modern serverless principles, managed services, and best-in-class frameworks to deliver:

- A **scalable** and **maintainable** foundation using Next.js API Routes and Firebase.
- A **secure** environment with Clerk authentication, Zod validation, and secret management.
- A **responsive** developer experience, thanks to TypeScript, modular code, and automated CI/CD.
- An **extensible** architecture that allows adding more AI providers, persisting new data types, and implementing advanced caching or theming features.

Together, these components meet VibeCode’s needs for quick AI interactions, optional user sessions, and a minimal overhead for future growth.
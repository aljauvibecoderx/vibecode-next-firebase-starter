# Tech Stack Document for VibeCode AI-Powered Workflow

This document explains, in everyday language, why we chose each technology in the VibeCode project. It shows how the pieces fit together to deliver a smooth, secure, and maintainable application.

## Frontend Technologies

We chose these tools to build the user-facing part of VibeCode, making the interface fast, accessible, and easy to style.

- **Next.js (App Router)**
  - A React framework that supports both pages and backend routes in one codebase. It makes routing simple and gives us built-in API endpoints.
  - Helps us satisfy the requirement for a Node.js/Express-style backend without spinning up a separate server.
- **TypeScript**
  - Adds type safety to JavaScript, catching errors early and improving maintainability.
- **Tailwind CSS**
  - A utility-first CSS framework. Lets us quickly build a clean, minimalist white theme by composing small utility classes.
- **shadcn/ui (based on Radix UI)**
  - A prebuilt component library for accessible UI pieces like cards, inputs, buttons, and selects.
  - Gives us a solid starting point for our chat interface and ensures good accessibility out of the box.
- **TanStack React Query**
  - Manages data fetching and server state for our AI interactions. 
  - Tracks loading and error states, automatically updates the UI when new data arrives.
- **Zustand or Jotai (optional)**
  - Lightweight state managers. Can be used if we need client-side global state (e.g., current agent selection) beyond React Query’s server state.

## Backend Technologies

These components power the behind-the-scenes logic, data storage, and AI communication.

- **Next.js API Routes** (`/api/ai`)  
  - Acts as a proxy between the frontend and external AI services.
  - Hides secret API keys, centralizes error handling, and can implement rate limiting.
- **Clerk**
  - Handles user sign-up, sign-in, and sessions.  
  - Provides middleware in `middleware.ts` so we can protect routes when authentication is required.
- **Firebase (Firestore)**
  - A cloud database service. Ready to store user-generated ideas, PRDs, or conversation histories.
- **OpenAI SDK Blueprint**
  - A starting point for AI calls. We adapt it to route requests to Gemini, Claude, Groq, or other models.
- **Zod**
  - A schema validation library for TypeScript. Validates inputs in our API route (`/api/ai`) to prevent bad data and improve security.

## Infrastructure and Deployment

How we host, build, and maintain reliability for VibeCode.

- **Version Control: Git & GitHub**
  - Source code management, collaboration, and code review.
- **Hosting: Vercel**
  - Automatic deployments on every push. Built for Next.js projects, providing edge functions and global CDN.
- **CI/CD: GitHub Actions**
  - Runs tests and linters on each pull request, then automatically deploys to Vercel when changes are merged.
- **Environment Variables (`.env` files)**
  - Stores secret keys for AI providers and Firebase securely, keeping them out of the public code.

## Third-Party Integrations

External services that add key functionality without rebuilding from scratch.

- **AI Providers**
  - Gemini, Claude, Groq (and others)—we integrate via our `/api/ai` proxy.
- **Clerk**
  - User authentication and session management.
- **Firebase**
  - Real-time database and hosting for future data persistence needs.
- **jsPDF + html2canvas**
  - (Optional) Libraries to generate downloadable PDFs of PRDs directly in the browser.
- **Markdown Download Utility**
  - (Optional) Simple client-side code to trigger `.md` file downloads of AI-generated content.
- **Analytics & Monitoring** (e.g., Vercel Analytics)
  - (Optional) Track user activity, performance, and errors in production.

## Security and Performance Considerations

Measures we’ve put in place to keep data safe and the app running smoothly.

- **API Proxy Pattern**
  - Keeps AI keys secret, centralizes error handling, and allows rate limiting on `/api/ai`.
- **Input Validation with Zod**
  - Ensures only valid prompts and agent selections reach our backend logic.
- **HTTPS & Secure Headers**
  - Managed by Vercel by default, ensuring encrypted communication.
- **Response Streaming**
  - Streams AI replies in chunks so users see responses immediately, improving perceived performance.
- **Lazy Loading & Code Splitting**
  - Next.js automatically splits code by route, so users only download what they need.
- **Accessibility Best Practices**
  - Using shadcn/ui (Radix) components helps us hit high Lighthouse scores (>90) for accessibility.

## Conclusion and Overall Tech Stack Summary

VibeCode’s technology choices all support the goal: a fast, secure, and user-friendly AI workflow application.

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Query
- Backend: Next.js API Routes, Clerk, Firebase, Zod, AI SDK integrations
- Infrastructure: GitHub, Vercel, GitHub Actions, environment variables
- Integrations: Gemini, Claude, Groq, jsPDF/html2canvas, analytics tools
- Security & Performance: API proxy, input validation, streaming responses, accessibility focus

This combination gives us:

- A robust starter kit to build and extend AI generators (Idea & PRD) 
- Secure handling of user data and AI credentials
- A scalable deployment system with automatic CI/CD
- A clean, responsive, and accessible user interface

With this stack, VibeCode will deliver its core features quickly, remain maintainable as it grows, and provide a smooth experience for every user.
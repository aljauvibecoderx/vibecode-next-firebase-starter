# Project Requirements Document (PRD)

## 1. Project Overview
VibeCode is a web application that accelerates product development by providing two AI-powered chat generators: an **Idea Generator** and a **PRD (Product Requirements Document) Generator**. Built on a modern JavaScript stack, it offers a minimalist, white-themed interface where users can quickly iterate on product ideas or draft formal specification documents. The core problem it solves is reducing the time and friction teams face when brainstorming concepts and writing detailed specs—automatically producing tailored outputs from powerful AI models.

This first version is being built using the **vibecode-next-firebase-starter** repository, which gives us user authentication, a Node.js API proxy for AI calls, and a flexible UI component library out of the box. Our key success criteria are:
- Delivery of two fully functional generators with a responsive chat interface.  
- Secure, optional user login.  
- Seamless integration with multiple AI providers (Gemini, Claude, Groq) via a unified `/api/ai` proxy.  
- High performance (instant response streaming) and accessibility (Lighthouse score >90).

## 2. In-Scope vs. Out-of-Scope

**In-Scope (First Version)**
- Optional user sign-up/sign-in with **Clerk**.  
- Two pages under Next.js App Router:
  - `/idea-generator` (Idea Generator)  
  - `/prd-generator` (PRD Generator)  
- A backend API Route at `/api/ai/route.ts` that:
  - Receives frontend requests with a prompt and selected agent.  
  - Proxies to Gemini, Claude, or Groq using server-side SDKs.  
  - Streams AI responses back to the client.
- Chat UI components built with **shadcn/ui** and **Tailwind CSS**:
  - Message list, input field, send button, agent selector dropdown.  
  - Buttons for “Download PRD,” “Reload,” and “Edit.”
- State and data fetching managed by **TanStack React Query**.
- Download PRD output as a **Markdown (.md)** file.
- Light, minimalist white theme; 100% responsive layout.
- Basic environment configuration using `.env` for API keys.

**Out-of-Scope (Later Phases)**
- Persistent conversation history in **Firebase/Firestore**.  
- PDF export of PRDs.  
- Dark mode or advanced theming.  
- User roles or permissions beyond basic login.  
- Mobile app or native client.  
- Analytics dashboard or usage tracking.  

## 3. User Flow
A new visitor lands on the VibeCode homepage and sees two main options: **Generate an Idea** or **Draft a PRD**. They can choose to continue as a guest or click “Sign In” to authenticate via Clerk (email/password or OAuth). Once on either the Idea Generator or PRD Generator page, the chat interface greets them with a pre-loaded “power prompt” in the input box. On the top right, there’s a selector to pick an AI agent (e.g., “Claude Sonnet 4.5”) and a send button.

The user edits the prompt if desired, then clicks “Send.” Under the hood, a **useMutation** hook from React Query sends a `POST` to `/api/ai` with `{ prompt, agent }`. The API route picks the correct AI SDK, streams the response, and delivers it back to the client. As each token arrives, messages appear instantly in the chat window. After the response finishes, the user can click “Download PRD” (on the PRD page) to save the draft or “Reload” to request a variation. Throughout, the UI remains snappy, accessible, and mobile-friendly.

## 4. Core Features
- **User Authentication**: Optional sign-up/sign-in with Clerk.  
- **Idea Generator Page**: Chat-based idea brainstorming.  
- **PRD Generator Page**: Structured chat for drafting requirements.  
- **AI Proxy API**: Single `/api/ai` endpoint to handle all AI calls.  
- **Agent Selector**: Dropdown to choose between Gemini, Claude, or Groq.  
- **Power Prompt Templates**: Preloaded starter prompts for each generator.  
- **Streaming Responses**: Show AI output token-by-token.  
- **Chat Interface**: Reusable components (`MessageList`, `ChatInput`, etc.).  
- **Download PRD**: Export output as a Markdown file.  
- **State Management**: TanStack React Query for mutations and caching.  
- **Minimalist UI**: Tailwind CSS + shadcn/ui for white-theme design.

## 5. Tech Stack & Tools
- Frontend: **Next.js** (App Router), **React**, **TypeScript**.  
- Styling & UI Components: **Tailwind CSS**, **shadcn/ui** (built on Radix UI).  
- Authentication: **Clerk** (session management, protected routes).  
- Backend: Next.js **API Routes** (`route.ts`) running on Node.js runtime.  
- Data Fetching: **TanStack React Query** (`useMutation`, `useQuery`).  
- AI Integration: `/api/ai` proxies to **Gemini**, **Claude**, **Groq** via each provider’s SDK.  
- Database (future): **Firebase** / **Firestore**.  
- Environment & Secrets: `.env.local` for storing API keys securely.  
- IDE & Extensions: VSCode (TypeScript support, Tailwind IntelliSense).

## 6. Non-Functional Requirements
- **Performance**: Initial page load <2s; AI streaming latency <500ms.  
- **Accessibility**: Lighthouse score ≥90; semantic HTML; keyboard navigation.  
- **Responsiveness**: Layout adapts seamlessly to mobile, tablet, desktop.  
- **Security**: API keys never exposed client-side; CORS & CSRF protection via Next.js.  
- **Reliability**: Graceful error handling and retry logic on network or AI failures.  
- **Maintainability**: Type safety with TypeScript; modular code structure; clear naming.  

## 7. Constraints & Assumptions
- Requires Next.js v13+ App Router.  
- AI provider SDKs (Gemini, Claude, Groq) must be available and stable.  
- Environment variables set in `.env.local` (e.g., `GEMINI_API_KEY`).  
- Users have modern browsers supporting Streams API for real-time rendering.  
- No persistent user data storage in v1 (Firestore integration deferred).  
- Single-region deployment; latency acceptable for target audience.

## 8. Known Issues & Potential Pitfalls
- **API Rate Limits**: Providers differ in quotas—implement server-side rate limiting and fallback messages.  
- **Streaming Complexity**: Handling partial responses can be tricky; use proven libraries or patterns (e.g., Vercel’s `ai` package).  
- **Error Variability**: APIs may return different error shapes—normalize errors in `/api/ai`.  
- **Agent Mismatch**: If frontend and backend agent lists go out of sync, validations fail—use a shared enum or Zod schema.  
- **Styling Conflicts**: Tailwind + shadcn/ui may overlap—establish a consistent design token strategy.  

---
This PRD outlines the critical requirements and boundaries for delivering VibeCode’s first release. It provides a clear blueprint for the AI to generate subsequent technical documents—such as the Tech Stack Document, Frontend Guidelines, and Backend Structure—without ambiguity.
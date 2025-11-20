# Frontend Guideline Document

This document outlines the frontend setup for the VibeCode AI-powered workflow application. It explains the architecture, design principles, key technologies, and best practices in clear, everyday language so anyone can follow along.

## 1. Frontend Architecture

### Overview
- **Framework**: Next.js (App Router) with React and TypeScript. Next.js gives us file-based routing, server-side rendering, and API routes—all in one framework.
- **Component Library**: shadcn/ui (built on Radix UI) for accessible, headless primitives that we style with Tailwind CSS.
- **Styling**: Tailwind CSS utility classes for quick, responsive layouts.
- **Authentication**: Clerk for easy user sign-up, sign-in, and session management.
- **Backend Integration**: Firebase (Firestore) is preconfigured for future data storage. We also use Next.js API Routes as a secure proxy for calling AI services.
- **State/Data Fetching**: TanStack React Query to manage server state (AI prompts and responses).

### Scalability, Maintainability, Performance
- **Modular Code Structure**: Separates pages, components, API routes, utilities, and hooks into dedicated folders.
- **Type Safety**: TypeScript throughout to catch errors early and make refactoring safer.
- **API Proxy Pattern**: One `/api/ai` route to centralize AI calls, hide API keys, handle rate limiting, and simplify error handling.
- **Automatic Code Splitting**: Next.js only loads code needed for each page, reducing bundle sizes.
- **Reusable Components**: UI primitives and composites live in `components/ui/` and `components/vibe/`, ensuring shared logic and style.

## 2. Design Principles

1. **Usability** – Interfaces are intuitive: clear buttons, inputs, and feedback states (loading, errors).
2. **Accessibility** – shadcn/ui and Tailwind ensure proper ARIA roles, keyboard navigation, and screen-reader support. Aim for Lighthouse score > 90.
3. **Responsiveness** – Layouts adapt to mobile, tablet, and desktop using Tailwind’s responsive utilities.
4. **Consistency** – A single color palette, typography scale, and spacing system are applied everywhere.
5. **Minimalism** – A clean, white-themed UI with only the necessary elements for a focused workflow.

How it’s applied:
- Form fields show clear labels and inline validation.
- Buttons have consistent hover/focus styles.
- The chat interface scrolls smoothly, and new messages appear without layout shifts.

## 3. Styling and Theming

### Styling Approach
- **Methodology**: Utility-first with Tailwind CSS. No global CSS; use utilities and component-level classes.
- **Pre-processor**: None—Tailwind handles everything via its config file.
- **Dark/Light Mode**: CSS variables are set up for theming. We start with a light, minimalist theme and can extend to dark mode later.

### Theming Details
- **Style**: Modern, flat design—no heavy shadows or textures, just subtle layering for hierarchy.
- **Color Palette**:
  - Primary: `#3B82F6` (blue)
  - Secondary: `#6366F1` (indigo)
  - Accent: `#10B981` (emerald)
  - Neutral Light: `#F9FAFB` (off-white)
  - Neutral Dark: `#374151` (gray-700)
  - Danger: `#EF4444` (red)

- **Fonts**: 
  - Primary font: Inter (sans-serif)
  - Fallbacks: system-ui, -apple-system, BlinkMacSystemFont

### Example Variables (tailwind.config.js)
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#10B981',
        neutral: {
          100: '#F9FAFB',
          700: '#374151',
        },
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

## 4. Component Structure

### Organization
- **components/ui/** – Low-level, reusable UI primitives from shadcn/ui (Button, Card, Input, Select).
- **components/vibe/** – High-level composites built for VibeCode: `IdeaGenerator.tsx`, `PRDGenerator.tsx`, `ChatInterface.tsx`.
- **pages/app/** – Next.js App Router pages live under `app/` (e.g., `idea-generator/`, `prd-generator/`).
- **hooks/** – Custom React hooks like `useChat` or `useAIStream` to encapsulate stateful logic.

### Benefits of Component-Based Architecture
- **Reusability**: Build a component once and use it in multiple places.
- **Maintainability**: Isolate fixes and enhancements to single files.
- **Testability**: Smaller, focused components are easier to test.

## 5. State Management

### Approach
- **Server State**: Managed by TanStack React Query.
  - `useMutation` to send prompts and receive AI responses.
  - `useQuery` for any future data fetching (e.g., conversation history).
- **Local UI State**: Managed via React’s `useState` or custom hooks. For global UI state (e.g., selected AI agent), consider Context API or a lightweight store like Zustand.

### How It Works
1. User types a prompt and selects an agent.
2. `useMutation` fires, sending data to `/api/ai`.
3. React Query tracks loading, success, and error states.
4. On success, the response is appended to the component’s message list.

## 6. Routing and Navigation

- **Library**: Next.js App Router (file-based routing).
- **Page Structure**:
  - `app/idea-generator/page.tsx` – The Idea Generator interface.
  - `app/prd-generator/page.tsx` – The PRD Generator interface.
- **API Route**:
  - `app/api/ai/route.ts` – A `POST` handler acting as a proxy to Gemini, Claude, or Groq based on the `agent` field.
- **Navigation**: Use Next.js `Link` component for client-side transitions. Keep the main menu minimal—links to Idea Generator, PRD Generator, and optional login/logout.

## 7. Performance Optimization

- **Lazy Loading**: Dynamically import heavy components if needed (e.g., PDF export module).
- **Code Splitting**: Next.js automatic splitting; each route loads only what it needs.
- **Tailwind Purge**: Removes unused CSS in production builds.
- **Image Optimization**: Use Next.js `<Image>` for any static assets.
- **Caching**: Leverage React Query’s caching to avoid refetching identical prompts.
- **Streaming Responses**: Implement streaming in `/api/ai` and on the client to render tokens as they arrive—delivers instant feedback.

## 8. Testing and Quality Assurance

### Unit and Integration Tests
- **Tooling**: Jest + React Testing Library.
- **What to test**:
  - Component rendering: buttons, inputs, error states.
  - Custom hooks: e.g., `useChat` logic for appending messages.
  - Utility functions: prompt formatting, file download logic.

### API Route Tests
- **Tooling**: Supertest (or Jest with Node mocks).
- **What to test**:
  - Proper routing based on `agent` value.
  - Validation with Zod: ensure malformed requests return errors.
  - Error handling: simulate downstream AI failures.

### End-to-End Tests
- **Tooling**: Cypress or Playwright.
- **Scenarios**:
  - User logs in, navigates to generator, submits a prompt, sees a response.
  - Attempt to send an invalid prompt, verify error message.
  - Download PRD as Markdown or PDF and verify file contents.

### CI/CD
- Run tests on every PR.
- Linting with ESLint and TypeScript checks.
- Tailwind class sorting with Prettier plugin.

## 9. Conclusion and Overall Frontend Summary

Our frontend is built on a modern, full-stack JavaScript foundation—Next.js with TypeScript, Tailwind CSS, and shadcn/ui—combined with Clerk, Firebase, and React Query. This setup:
- Covers essential features out of the box (auth, API proxy, styling).
- Follows best practices for scalability, accessibility, and performance.
- Uses a clear, component-driven structure for maintainability.
- Implements robust testing and optimization strategies.

Together, these guidelines ensure we deliver a fast, reliable, and user-friendly VibeCode experience. By adhering to this document, any developer—even without deep technical knowledge—can understand, extend, and maintain the frontend with confidence.
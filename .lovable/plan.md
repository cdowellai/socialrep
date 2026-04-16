

## Chatbot Embed — Why It Doesn't Work & Fix Plan

### Root Cause

The embed code tells external websites to load `chatbot-widget.js`, but **that file doesn't exist**. There is no `public/chatbot-widget.js` in the project. The current chatbot is a React component deeply tied to the app's internals — it requires `useAuth()`, React, framer-motion, ReactMarkdown, and a logged-in Supabase session. None of that exists on an external website.

Three fundamental blockers:

1. **Missing file** — `public/chatbot-widget.js` was never created
2. **Auth dependency** — `useChatbot` hook requires `user?.id` from `useAuth()`. On an external site there is no logged-in user. The `userId` in the embed is the *business owner's* ID, not a visitor's
3. **React dependency** — The widget uses React hooks, framer-motion, ReactMarkdown — unavailable on external sites

### The Fix

Build a **standalone, zero-dependency embed script** (`public/chatbot-widget.js`) that:
- Reads `data-user-id` from its own `<script>` tag
- Injects a self-contained chat widget using vanilla JS + inline CSS (shadow DOM for style isolation)
- Calls the `/functions/v1/chatbot` edge function directly via `fetch()` with the anon key
- Streams SSE responses and renders them as HTML
- Handles pre-chat form collection, typing indicators, and basic markdown rendering — all without React

Also update the **chatbot edge function** to not require a logged-in session for the visitor path (it already uses `verify_jwt = false` and accepts `visitorId`).

### Changes

| # | File | What |
|---|------|------|
| 1 | `public/chatbot-widget.js` | **Create** — Standalone vanilla JS widget (~400 lines): shadow DOM container, CSS-in-JS styles matching the current dark theme, fetch-based SSE streaming to the chatbot edge function, pre-chat form, typing animation, basic markdown (bold/italic/links/lists) |
| 2 | `supabase/functions/chatbot/index.ts` | **Update** — Allow `userId` to serve as the business owner context without requiring the caller to be that user. The function already does ownership validation on `conversationId` but the initial message path needs to work for anonymous visitors hitting the endpoint with just `userId` + `visitorId` |
| 3 | `src/pages/Chatbot.tsx` | **Update** — Fix the embed code snippet to use the correct Supabase URL for the script source (production URL) instead of `window.location.origin` which only works in the app itself |

### Embed Script Architecture

```text
chatbot-widget.js
├── Reads data-user-id from <script> tag
├── Creates shadow DOM container (style isolation)
├── Renders: FAB button → Chat window → Pre-chat form → Message thread
├── fetch() to ${SUPABASE_URL}/functions/v1/chatbot
│   ├── Headers: Authorization: Bearer ${ANON_KEY}
│   ├── Body: { userId, visitorId, visitorName?, visitorEmail?, messages }
│   └── Streams SSE response, parses data: chunks
├── Simple markdown: **bold**, *italic*, [links](url), - lists
└── All CSS scoped inside shadow DOM
```

### What the visitor experiences

1. Floating chat bubble appears (bottom-right by default)
2. Click → chat window opens with welcome message
3. If name/email collection is enabled, pre-chat form appears first
4. Visitor types → message sent to edge function → streamed AI response appears
5. Works on any website with a single `<script>` tag

No new dependencies. The embed script is pure vanilla JS with no build step needed.


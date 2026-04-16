

The user is on `/` (the landing page Index). The screenshot shows the marketing mockup of the dashboard with the sidebar (Dashboard, Inbox, Streams, Reviews, Leads, Analytics, Chatbot). They want clicks on **Leads, Analytics, and Settings** to trigger a "Want to learn more? Sign up now" prompt.

Need to find which landing component renders this dashboard mockup.

I'll check `HeroSection.tsx` or `WhatIsSection.tsx` / product visualization components for the sidebar mockup. Based on context this is a code-driven React mockup on the landing page.

## Plan: "Sign Up to Explore" Prompt on Mockup Sidebar

### Concept

When a visitor on the landing page clicks **Leads**, **Analytics**, **Settings** (or any other locked sidebar item) in the dashboard mockup, show a small, elegant popover/modal:

> **Want to see this in action?**  
> Create your free account to explore Leads, Analytics, and more.  
> [Start Free Trial] [See Pricing]

### Design (matches midnight/Apple aesthetic)

- Centered modal using existing `Dialog` component (already in codebase)
- Glassmorphic dark card, Plus Jakarta Sans heading
- Icon at top (Sparkles or Lock) in primary purple
- Two buttons: primary "Start Free Trial" → scrolls to `#pricing`, secondary "See Pricing" → also scrolls to pricing
- Framer-motion fade/scale entry with `[0.16, 1, 0.3, 1]` easing
- Dynamic message: passes the feature name clicked ("Leads" / "Analytics" / "Settings") so headline reads "Want to explore **Leads**?"

### Routing logic

The mockup sidebar items are currently visual only (no nav). I'll wire `onClick` handlers on the Leads, Analytics, and Settings items (plus Chatbot/Streams/Reviews for consistency — anything that isn't the already-shown Inbox/Dashboard view) to open the modal with the feature name.

### Conversion alignment

Per the project's conversion funnel rule, both CTAs route to the **Pricing section** (not signup directly), so visitors commit to a tier before account creation. This matches existing landing page behavior.

### Files to change

| File | What |
|------|------|
| `src/components/landing/` (the file rendering the dashboard mockup — likely `HeroSection.tsx` or a product visualization component) | Add click handlers to Leads/Analytics/Settings/etc. sidebar items, manage modal open state |
| New: `src/components/landing/SignUpPromptModal.tsx` | Reusable modal component with dynamic feature name + CTAs scrolling to pricing |

### What stays the same

- No new pages, no new routes
- Inbox + Dashboard mockup items remain non-interactive (they're what's being shown)
- Existing Navbar "Start Free Trial" button behavior unchanged

### Result

Visitors exploring the landing-page dashboard mockup get a gentle, on-brand nudge toward signup the moment they click any "locked" feature — converting curiosity into pricing-page traffic without breaking the cinematic feel of the landing page.


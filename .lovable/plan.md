

## Make the Hero Mockup Sidebar Interactive (Not the Navbar)

The demo links (Dashboard, Streams, Reviews) should be removed from the Navbar and instead the sidebar icons *inside the hero mockup* should become clickable, switching the mockup's content panel between different views.

### What changes

**1. Navbar cleanup** — Remove the `demoLinks` array and all related rendering (desktop divider + links, mobile links). Revert to the original nav with only Features, Integrations, Pricing.

**2. Hero mockup sidebar becomes interactive** — The sidebar icons (Dashboard, Inbox, Streams, Reviews, Leads, Analytics) become clickable. A new `activeView` state controls which "screen" the mockup shows:

- **Inbox** (current default) — The existing conversation list + AI draft panel. No changes needed here.
- **Dashboard** — A mini dashboard mockup showing KPI cards (e.g., "47 conversations", "4.8★ avg rating", "92% response rate", "12m avg response") and a small bar chart or trend line. All static/hardcoded.
- **Streams** — A mini Kanban-style view with 2–3 columns ("Urgent", "Positive Mentions", "Instagram DMs") each showing 2–3 compact interaction cards.
- **Reviews** — A mini reviews panel showing 3–4 review cards with star ratings, reviewer names, and short excerpts. Include an average rating badge.

**3. View switching animation** — Use `AnimatePresence` with the same fade+y-translate pattern already used for conversation switching.

**4. App.tsx cleanup** — Remove the `allowDemo` prop from `ProtectedRoute` and the demo routes, reverting to auth-required dashboard access.

### Files to change

| File | Change |
|------|--------|
| `src/components/landing/Navbar.tsx` | Remove `demoLinks`, remove demo link rendering in desktop and mobile |
| `src/components/landing/HeroSection.tsx` | Add `activeView` state, make sidebar items clickable, create mini Dashboard/Streams/Reviews view components inline |
| `src/App.tsx` | Remove `allowDemo` prop from ProtectedRoute and demo routes |

### Mini-view content (all hardcoded, no backend)

**Dashboard view**: 4 KPI cards in a 2×2 grid + a simple sparkline area. Numbers: "47 Conversations", "4.8★ Rating", "92% Response Rate", "12m Avg Response".

**Streams view**: 3 columns (Urgent · 3, Positive · 8, Instagram · 5) each with 2 compact cards showing name, platform pill, and a one-line message preview.

**Reviews view**: Average rating hero (4.8★), then 3 review cards with star rows, reviewer name, platform, and a truncated review body.

Each view matches the existing dark glassmorphism aesthetic with the same spacing, typography, and color tokens already in use.


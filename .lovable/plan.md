

## Apple CMO/CBO Dashboard Rebuild

### The Problem

The current dashboard is functional but lifeless — especially on empty state. Five KPI cards showing "0" with "— 0%" badges, a flat-line chart, and "No data available" text. This is the first thing a user sees after signing up. It needs to feel like opening a new MacBook — pristine, intentional, promising.

### Design Philosophy

Apple dashboards (Health, Screen Time, Fitness+) share three traits: **generous white space between content blocks**, **progressive disclosure** (show what matters, hide what doesn't), and **contextual empty states that guide action** rather than displaying failure. The current dashboard violates all three.

### What Changes

**1. Intelligent Empty States (the biggest win)**

When data is zero/empty, the dashboard should not show "0" KPI cards with trend badges. Instead:
- KPI cards transform into **onboarding action cards** — each one suggests the next step: "Connect a platform", "Import reviews", "Set up AI responses", "Invite your team", "Create your first stream"
- Each card has a subtle gradient background, an icon, a one-line description, and a CTA button
- Once real data exists for a metric, the card transitions to the current KPI format
- This means the dashboard is *always* useful — never a wall of zeros

**2. Welcome Section — Elevated**

- Time-of-day greeting stays, but becomes larger (text-3xl) with a subtle gradient text treatment on the user's name
- Subline becomes contextual: new users get "Let's get your reputation engine running." Returning users with data get "Here's what's happening across your platforms."
- Remove the "View Analytics" button from the header (it's in the sidebar already)

**3. KPI Cards — Refined**

When data exists:
- Reduce from 5 cards to **4 cards** in a clean 4-column grid (remove "Avg. Response" — it's derivative and clutters)
- Cards: **Active Conversations** | **Avg. Rating** | **Response Rate** | **Sentiment Score**
- Larger value typography (text-4xl), label *above* the number (not below — Apple convention), trend pill smaller and more subtle
- Remove the icon circles — the number IS the icon. Cleaner, more confident
- Add a micro sparkline (tiny 40px wide line) inside each card showing 7-day trend visually

**4. Charts Section — Simplified**

- Activity Trend chart: when empty, show a subtle illustrated empty state with "Activity will appear here once you connect a platform" — not a flat-line chart with axis numbers
- Platform Breakdown: when empty, show platform icons in a muted grid with "Connect your first platform" CTA
- Both charts get slightly more padding and the card titles become smaller/lighter

**5. Recent Interactions — Cleaner**

- When empty: show a single centered illustration-style empty state, not the current icon + two lines of text
- When populated: tighten the row spacing, make the sentiment dot slightly larger, remove the status icon on the right (redundant with the dot)

**6. Quick Actions — Redesigned as a horizontal strip**

- Move from a sidebar card to a **horizontal row of 4 action pills** between the KPIs and charts
- Each pill: icon + label, no description text, subtle hover glow
- This frees the right column for a future "Activity Feed" or keeps the layout 2-column for charts

**7. Animation Polish**

- Stagger timing remains but ease curve tightened to the project standard `[0.16, 1, 0.3, 1]`
- Empty-to-populated card transitions use `layout` animation from framer-motion for smooth morphing

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Restructure layout: 4-col KPI grid, horizontal quick actions strip, contextual empty states, smarter welcome |
| `src/components/dashboard/KPICard.tsx` | Redesign: label above value, remove icon circle, add micro sparkline, support "onboarding" variant |
| `src/components/dashboard/DashboardTrendChart.tsx` | Add graceful empty state with illustration text instead of flat-line chart |
| `src/components/dashboard/PlatformBreakdownChart.tsx` | Add graceful empty state with platform icons grid |

### Empty State Content

| Card | Empty Title | Empty CTA |
|------|-------------|-----------|
| Active Conversations | Connect your first platform | Connect Platform |
| Avg. Rating | Start collecting reviews | Set Up Reviews |
| Response Rate | Enable AI responses | Configure AI |
| Sentiment Score | Analyze your first interactions | Learn More |

### Technical Notes

- Micro sparklines: use a simple SVG polyline (no recharts dependency for this), 40×20px, stroke-only, no axes
- Onboarding card variant uses the same `KPICard` component with a `variant: "onboarding" | "metric"` prop
- All empty states check `interactions.length === 0` or `reviews.length === 0` to determine which variant to show
- No new dependencies needed




## Fix All Dashboard Button Destinations

### The Problem

Multiple CTAs across the dashboard navigate to `/dashboard/settings` generically, which always opens the **Profile** tab. Users clicking "Connect Platform" expect to land on the **Platforms** tab. Similarly, "Configure AI" should land on the **Brand AI** or **Automation** tab. The Activity Trend chart also uses a raw `<a>` tag instead of React Router's `<Link>`.

### All Buttons Audited

| Location | Button/CTA Text | Current Destination | Correct Destination |
|----------|----------------|--------------------|--------------------|
| KPI Card (empty) | "Connect Platform" | `/dashboard/settings` (Profile tab) | `/dashboard/settings?tab=platforms` |
| KPI Card (empty) | "Set Up Reviews" | `/dashboard/reviews` | ✅ Correct |
| KPI Card (empty) | "Configure AI" | `/dashboard/settings` (Profile tab) | `/dashboard/settings?tab=brand` |
| KPI Card (empty) | "Learn More" | `/dashboard/analytics` | ✅ Correct |
| Recent Interactions (empty) | "Connect Platform" | `/dashboard/settings` (Profile tab) | `/dashboard/settings?tab=platforms` |
| Activity Trend (empty) | "Connect Platform" | `/dashboard/settings` (raw `<a>` tag) | `/dashboard/settings?tab=platforms` (use `<Link>`) |
| Platform Breakdown (empty) | "Connect your first platform" | `/dashboard/settings` (Profile tab) | `/dashboard/settings?tab=platforms` |
| Quick Actions strip | All 6 links | Various `/dashboard/*` routes | ✅ All correct |
| KPI Cards (with data) | onClick navigations | inbox/reviews/analytics | ✅ All correct |

### Changes

**1. `src/pages/Settings.tsx`** — Read `?tab=` from URL and use it as default tab value
- Parse `searchParams.get("tab")` via `useSearchParams()`
- Pass it as `defaultValue` to `<Tabs>` (fallback to `"profile"`)

**2. `src/pages/Dashboard.tsx`** — Fix 3 navigation targets
- "Connect Platform" KPI: `/dashboard/settings?tab=platforms`
- "Configure AI" KPI: `/dashboard/settings?tab=brand`
- Recent Interactions empty CTA: `/dashboard/settings?tab=platforms`

**3. `src/components/dashboard/DashboardTrendChart.tsx`** — Fix 1 link
- Replace raw `<a href=...>` with React Router `<Link to="/dashboard/settings?tab=platforms">`

**4. `src/components/dashboard/PlatformBreakdownChart.tsx`** — Fix 1 navigation target
- Change `navigate("/dashboard/settings")` to `navigate("/dashboard/settings?tab=platforms")`

No new dependencies. No database changes.


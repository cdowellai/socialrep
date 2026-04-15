

## Dashboard Audit — Issues Found

After reviewing all four dashboard files, the layout, DashboardLayout, and checking for stale references, here are the issues:

### 1. Dead file: `src/lib/demoData.ts` (711 lines)
This file exports `DEMO_INTERACTIONS`, `DEMO_REVIEWS`, `DEMO_STREAMS`, and `filterDemoInteractionsForStream` — none of which are imported anywhere in the codebase anymore. It's 711 lines of dead weight that should be deleted.

### 2. Unused imports in `src/pages/Dashboard.tsx`
- `Users`, `BookOpen` from lucide-react — never used in the JSX
- `Avatar`, `AvatarFallback`, `AvatarImage` are used but `Badge` is also used, so those are fine

### 3. Trend direction is hardcoded to `isPositive: true`
All four KPI cards pass `isPositive: true` regardless of actual trend direction. If conversations spike (more pending = bad), the trend should show as negative. The `isPositive` prop should be contextual:
- **Active Conversations**: `isPositive: false` (fewer pending = better)
- **Avg. Rating**: `isPositive: true`
- **Response Rate**: `isPositive: true`
- **Sentiment Score**: `isPositive: true`

### 4. Quick Actions strip lacks "Streams" and "Leads"
The horizontal action pills include Inbox, Reviews, Content, Settings — but omit two core features (Streams and Leads) that are in the sidebar. Adding them makes the dashboard a true command center.

### 5. Recent Interactions empty state is bland
The current empty state is a gray icon + two lines of text. Per the Apple design philosophy already established, this should match the onboarding card aesthetic — subtle gradient background, a more inviting CTA that links to Settings.

### 6. Charts empty states lack a connecting CTA button
The Activity Trend and Platform Breakdown empty states show text but only the Platform Breakdown has a clickable "Connect your first platform →" link. The Activity Trend should also have one for consistency.

### 7. No mobile navigation in top bar
The top bar shows the SocialRep logo on mobile but has no hamburger menu or way to access sidebar navigation. This is an existing gap but worth noting.

---

### Plan

| # | Change | File |
|---|--------|------|
| 1 | Delete dead demo data file | `src/lib/demoData.ts` |
| 2 | Remove unused `Users`, `BookOpen` imports | `src/pages/Dashboard.tsx` |
| 3 | Fix `isPositive` on Active Conversations to `false` | `src/pages/Dashboard.tsx` |
| 4 | Add Streams and Leads to Quick Actions strip | `src/pages/Dashboard.tsx` |
| 5 | Upgrade Recent Interactions empty state with gradient card + CTA button | `src/pages/Dashboard.tsx` |
| 6 | Add "Connect Platform →" CTA to Activity Trend empty state | `src/components/dashboard/DashboardTrendChart.tsx` |

All changes are cosmetic/cleanup — no new dependencies, no database changes.


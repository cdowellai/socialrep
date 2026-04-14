

## Deep Audit: Remaining Issues and Fixes

### Issue 1: Mobile Hero CTA Layout is Broken
On mobile (390px), the "Get Started" button and "See how it works →" text link sit side-by-side but the button text wraps to two lines ("Get\nStarted"), creating an awkward stacked look inside a horizontal flex container. The CTA area needs to stack vertically on mobile.

**File:** `HeroSection.tsx` — Add `flex-col sm:flex-row` to the CTA button container (line 75), and ensure the button doesn't wrap text with `whitespace-nowrap`.

---

### Issue 2: Hero Mockup Shows Only Conversation List on Mobile (No Value)
On mobile, the detail panel and sidebar are hidden (`hidden md:flex`). Users only see the conversation list — which shows no AI capability. The most important product moment (the AI-drafted response) is completely invisible on mobile. This is the biggest conversion killer on the page.

**Fix:** Add a mobile-only simplified AI draft card below the conversation list that's visible on small screens, showing one conversation + AI response. Or show the detail panel on mobile instead of the conversation list.

**File:** `HeroSection.tsx`

---

### Issue 3: The "Brew & Co." Chatbot Demo Uses a Fictional Brand Name
The chatbot widget still says "Brew & Co." — a fictional coffee shop. This is fine for demo purposes, but it would feel more premium and universal if it used a generic/neutral brand name or the user's own brand placeholder like "Your Brand" or just the product category.

**Fix:** This is minor. Keep as-is or change to something slightly more generic like "Luna Coffee" to feel less template-y. Low priority.

---

### Issue 4: Integrations Icons Are Generic
Google Business, Trustpilot, Yelp, BBB, and TikTok all use the same `Star` or `MessageCircle` lucide icon. They don't look like the actual platform logos. Apple would use real brand marks. Since we can't use trademarked logos, at minimum use more distinctive icon choices — or use the first letter of each platform as a styled monogram.

**Fix:** Replace generic `Star` icons with more distinctive representations for each platform. Use colored letter monograms (G, T, Y, B) inside the icon containers.

**File:** `IntegrationsSection.tsx`

---

### Issue 5: Pain Points Stats Are Unattributed
The stats "62%", "5hrs", and "4×" have no source attribution. These are specific claims that should cite a source — even a small "(Source: Sprout Social)" footnote. Without attribution, they feel made up, which contradicts the "no false social proof" brand rule.

**Fix:** Either add small source citations below each stat, or soften the language to avoid specific claims (e.g., "Most social messages go unanswered" instead of "62%").

**File:** `PainPointsSection.tsx`

---

### Issue 6: FAQ Copy Mentions Specific Platform Support That May Be Inaccurate
The FAQ says "Full two-way integration with Facebook, Instagram, Google Business, Yelp, and Trustpilot. Monitoring for TikTok, YouTube, LinkedIn, and BBB with full integration rolling out." — this is a product claim that needs to be accurate. If any of these aren't actually integrated yet, this is misleading.

**Fix:** Verify accuracy of platform claims or soften to "We're expanding to new platforms regularly."

**File:** `FAQSection.tsx`

---

### Issue 7: "Contact us" Link for Enterprise Pricing Goes Nowhere
"Need something custom? Contact us for Enterprise pricing." has no link — it's just text. There should be a mailto link or a link to a contact form.

**Fix:** Wrap "Contact us" in a mailto link to `sales@socialrep.ai` or similar.

**File:** `PricingSection.tsx`

---

### Issue 8: Navbar Pill Effect Covers Content Behind It
The frosted-glass pill nav has no top padding on the `<nav>` element when not scrolled (`py-0`). When scrolled, it shifts to `py-2`. The page content starts at `pt-32` which works, but the floating pill at the top may visually overlap section headers when scrolling to anchors since there's no `scroll-margin-top` or `scroll-padding-top` set.

**Fix:** Add `scroll-margin-top: 80px` (or `scroll-pt-20`) to anchored sections so smooth-scrolling doesn't hide headings behind the fixed nav.

**File:** `index.css` — Add `scroll-margin-top` to section elements, or set `scroll-padding-top` on `html`.

---

### Issue 9: Footer "Support" Column Has Only One Link
The Support column has only "Contact" — it looks sparse and unbalanced compared to the other columns. Apple's footer has at least 3-4 items per column.

**Fix:** Add a "FAQ" link (scrolls to FAQ section) and optionally "Status" or "Documentation" to fill out the column.

**File:** `Footer.tsx`

---

### Issue 10: No `aria-label` or Accessibility on Key Interactive Elements
The hero mockup buttons ("Approve & Send", "Edit", "Regenerate") and the entire mockup are decorative but rendered as real `<button>` elements. Screen readers will try to interact with them. They should have `aria-hidden="true"` or `role="presentation"` on the mockup container.

**Fix:** Add `aria-hidden="true"` to the product mockup container div.

**File:** `HeroSection.tsx`

---

### Issue 11: Missing `<meta>` Description / OG Tags
The `index.html` likely has a generic title/description. For an Apple-level page, the `<title>`, `<meta name="description">`, and Open Graph tags need to be crafted.

**File:** `index.html`

---

### Summary of All Changes

| File | Changes |
|------|---------|
| `HeroSection.tsx` | Fix mobile CTA wrapping; add mobile-visible AI draft; add `aria-hidden` to mockup |
| `PainPointsSection.tsx` | Add source citations to stats or soften claims |
| `IntegrationsSection.tsx` | Replace generic Star icons with distinctive monograms |
| `PricingSection.tsx` | Make "Contact us" a clickable mailto link |
| `FAQSection.tsx` | Verify/soften platform claims |
| `Footer.tsx` | Add FAQ link to Support column |
| `index.css` | Add `scroll-padding-top` to html for anchor offset |
| `index.html` | Add proper meta description and OG tags |

### Priority Order
1. **Mobile hero CTA layout** — broken UX, highest impact
2. **Mobile mockup showing no AI value** — major conversion gap
3. **Scroll-padding for nav overlap** — functional bug
4. **Enterprise pricing link** — dead end
5. **Integration icons** — polish
6. **Everything else** — refinement


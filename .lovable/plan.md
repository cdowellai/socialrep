

The user wants the chatbot to be more sales-oriented (drive purchases, appointments, leads). The question: does `gemini-3-flash-preview` still work for that?

**My honest take:** Yes, stay on Gemini 3 Flash. The model isn't the bottleneck for sales conversion — the **system prompt** is. A sales-trained Flash model will outperform a generic Pro model every time. Sales chat needs speed (fast replies = higher engagement) more than deep reasoning.

The real upgrade is rewriting the system prompt in `supabase/functions/chatbot/index.ts` to be sales-focused, plus adding lead capture hooks.

## Sales-Oriented Chatbot Upgrade

### Why stay on Gemini 3 Flash

Sales chat success depends on: speed of first reply, friendly tone, asking the right qualifying questions, and clean handoff to a human/booking. None of these need a heavyweight reasoning model. Flash gives you sub-second streaming — critical because every extra second of "typing..." drops conversion. Pro models would actually hurt by being slower.

The model is fine. The **prompt and flow** are what need work.

### What to change

**1. Rewrite system prompt — `supabase/functions/chatbot/index.ts`**

Replace the current generic "helpful support assistant" prompt with a sales-trained one that:
- Acts as a friendly sales/concierge rep, not a passive FAQ bot
- Always ends responses with a soft next step (question, CTA, or offer)
- Qualifies visitors naturally (budget, timeline, use case) without interrogating
- Pushes toward one of three conversion goals:
  - **Purchase** — direct them to pricing/checkout
  - **Book a meeting** — share a booking link
  - **Capture lead** — get name + email + what they need
- Knows when to hand off to human (high-intent signals, complex deals)

**2. Add conversion CTAs to chatbot settings**

Extend `chatbot_settings` table with optional fields the user can configure in the Settings tab:
- `booking_url` — Calendly/Cal.com link the bot can share
- `pricing_url` — link to pricing page
- `sales_goal` — dropdown: "purchase" / "book_meeting" / "capture_lead" / "all"

These get injected into the system prompt so the bot knows what to push toward.

**3. Auto-create leads from chats**

When the chatbot collects name + email (via existing pre-chat form OR organically mid-conversation), automatically create a record in the `leads` table with status "new" and the chat transcript as notes. This feeds your existing Leads pipeline.

**4. Update settings UI — `src/components/chatbot/ChatbotSettingsCard.tsx`**

Add a new "Sales Goals" section with the three new fields above.

### Files to change

| File | What |
|------|------|
| `supabase/functions/chatbot/index.ts` | Rewrite system prompt to sales mode; inject booking/pricing URLs; auto-create lead when email captured |
| `src/components/chatbot/ChatbotSettingsCard.tsx` | Add "Sales Goals" section (booking URL, pricing URL, sales goal dropdown) |
| `src/hooks/useChatbotSettings.ts` | Add new fields to settings interface |
| Database migration | Add `booking_url`, `pricing_url`, `sales_goal` columns to `chatbot_settings` |

### What stays the same

- Model: `google/gemini-3-flash-preview` ✓
- Streaming, handoff, knowledge base, embed widget — all unchanged
- Existing brand voice and welcome message logic — preserved

### Result

Same fast widget, but now it actively guides visitors: "Want to see pricing?" / "I can book you a 15-min call with our team — what works?" / "Mind if I grab your email so we can follow up?" Lead records appear automatically in your Leads pipeline.


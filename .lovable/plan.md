

The user wants the chatbot's response timing to feel more human by scaling delay with response length (longer responses = longer "typing" time, like a real person).

Quick check on current state: `chatbot_settings` already has `auto_reply_delay_ms` (a flat delay). The chatbot edge function streams responses immediately. I need to look at how the widget/chatbot currently handles delay to design this properly.

Looking at the code I've seen:
- `useChatbotSettings.ts` has `auto_reply_delay_ms: 1000` (flat)
- The standalone widget streams via SSE immediately
- The React `ChatbotWidget` shows a `TypingIndicator` while loading

The natural human-like model: **typing speed in characters per second**. Average human types ~40 WPM ≈ 5 chars/sec. So delay = `response.length / charsPerSecond * 1000`, capped to a max so very long responses don't take forever.

## Human-Like Response Delay (Length-Based)

### Concept

Replace the flat `auto_reply_delay_ms` with a **typing-speed simulation**. Before showing each AI response, compute a delay based on response length so short replies feel snappy and long replies feel like someone actually typed them.

Formula: `delay = min(maxDelayMs, baseDelayMs + (responseLength / charsPerSecond) * 1000)`

### What changes

**1. Database — extend `chatbot_settings`**

Add three new columns (keep `auto_reply_delay_ms` for backward compat, repurpose as base/minimum):
- `humanize_typing` (boolean, default `true`) — master toggle
- `typing_chars_per_second` (int, default `25`) — simulated typing speed (15 = slow/thoughtful, 25 = natural, 50 = fast)
- `max_typing_delay_ms` (int, default `8000`) — cap so 2000-char responses don't stall 30s

**2. Settings UI — `ChatbotSettingsCard.tsx`**

Add a "Response Timing" section with:
- Toggle: "Humanize response timing"
- Slider: "Typing speed" (Slow / Natural / Fast — maps to 15/25/50 cps)
- Slider: "Max delay cap" (2s – 15s)
- Live preview: "A 200-character reply will take ~Xs to appear"

**3. Edge function — `supabase/functions/chatbot/index.ts`**

Two delay options for streaming responses:
- **Option A (recommended)**: Delay *before* streaming starts — buffer the first ~50 chars, compute estimated total length from those tokens, then begin streaming. Simpler, feels natural.
- **Option B**: Throttle SSE chunks so total stream time ≈ computed delay. More complex but most realistic.

I'll go with **Option A** — buffer first chunk, send a `typing` event for computed duration, then stream. Keeps the "..." typing indicator visible naturally.

Actually simpler: just delay sending the first SSE token by `computedDelay`. Front-end already shows typing indicator while waiting. Done.

**4. Widget + React component**

No code changes needed in the widget — it already shows typing indicator while waiting for first SSE token. The delay happens server-side, indicator stays up naturally.

### Files to change

| File | What |
|------|------|
| Migration | Add `humanize_typing`, `typing_chars_per_second`, `max_typing_delay_ms` to `chatbot_settings` |
| `supabase/functions/chatbot/index.ts` | Compute typing delay from first response chunk, sleep before streaming |
| `src/hooks/useChatbotSettings.ts` | Add new fields to settings interface + defaults |
| `src/components/chatbot/ChatbotSettingsCard.tsx` | Add "Response Timing" section with toggle + sliders + preview |
| `src/pages/Chatbot.tsx` | Wire new fields through to settings card |

### What stays the same

- Model: `google/gemini-3-flash-preview`
- Streaming, handoff, lead capture, sales prompt — unchanged
- Embed widget JS — no changes (server controls timing)


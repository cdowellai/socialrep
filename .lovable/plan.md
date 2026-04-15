

## Interactive Hero Mockup — Live Product Demo

Transform the static hero mockup into a functional mini-demo that lets visitors experience SocialRep before signing up. This is a powerful product-led growth tactic — Apple does this with their product configurators.

### What becomes interactive

1. **Conversation switching** — Click any conversation in the left panel. The detail panel updates with that person's message and a unique AI-generated draft. Each conversation has its own context (customer info, location, platform badge, message content, AI response).

2. **AI draft "typing" animation** — When switching conversations, the AI draft area shows a brief typing/shimmer animation before the response appears, simulating real-time AI generation.

3. **Approve & Send** — Clicking shows a satisfying "Sent ✓" animation: the button morphs to a green checkmark, the conversation moves to resolved, and a subtle success pulse radiates outward.

4. **Edit mode** — Clicking "Edit" makes the AI draft text editable (contentEditable or textarea swap). An "Update" button replaces "Edit."

5. **Regenerate** — Clicking triggers the typing animation again and swaps in an alternate AI draft for that conversation.

6. **Reply input** — The "Write a reply..." bar becomes a real input. Typing and hitting enter (or a send button) shows the message appear in the thread.

### Data model (all client-side, no backend)

Each conversation object expands to include:
- `customerContext` (e.g., "New customer · Vancouver, BC" / "Repeat buyer · Toronto, ON")
- `aiDraft` (primary AI response)
- `aiDraftAlt` (alternate response for Regenerate)
- `sentiment` / `status` for visual indicators
- `resolved` boolean for post-send state

### Technical approach

- All state managed with `useState` in `HeroSection.tsx` — no new files needed
- CSS transitions + framer-motion for the typing shimmer and sent animation
- `selectedIndex` state drives which conversation is active
- `conversationStates` map tracks per-conversation state (draft text, editing, sent)
- Mobile view cycles through conversations or shows the first with full interactivity

### Files to change

| File | Change |
|------|--------|
| `src/components/landing/HeroSection.tsx` | Expand conversation data, add state management, wire up click handlers, add animations |

### Animations

- **Typing shimmer**: A gradient pulse across the draft text area (0.8s) using CSS keyframes
- **Sent confirmation**: Button background transitions to emerald, text changes to "Sent ✓", then fades back after 2s
- **Conversation switch**: Detail panel content fades out (150ms) → fades in (200ms) with slight y-translate


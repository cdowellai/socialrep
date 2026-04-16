

## Match Chatbot Embed Widget to React Design

### The Problem

The standalone embed widget (`public/chatbot-widget.js`) renders a minimal layout: colored header bar, single welcome bubble, and input. The React version (`ChatbotWidget.tsx`) has a much richer design with a **home view** featuring a time-based greeting, team avatar stack, "Our team is online" card, and a "Sarah from Support" welcome card — all in a clean light theme with subtle borders instead of a colored header bar. The embed widget needs to match this.

### Key visual differences to fix

| Element | Current widget | Target (screenshot) |
|---------|---------------|---------------------|
| Header | Solid colored background bar | Clean white with title, green dot, subtitle text |
| Home view | None — jumps straight to chat | Greeting ("Good morning 👋"), team presence card, Sarah welcome card |
| Avatar stack | None | S/A/J colored circles with overlapping layout |
| Input | Basic text input + colored send button | Pill-shaped input with subtle border, paper plane icon |
| Footer | None | "Powered by SocialRep" |
| Window style | Colored header, flat white body | All-white with rounded cards, subtle borders |

### Changes — single file

**`public/chatbot-widget.js`**

1. **Add home/chat view state** — Track `currentView` ("home" vs "chat"). Show home view by default, switch to chat when user sends first message

2. **Redesign header** — Remove solid colored background. Use white background with border-bottom, title in dark text, green pulsing dot + "We typically reply in a few minutes" subtitle. Add back arrow in chat view

3. **Build home view** — Time-based greeting ("Good morning/afternoon/evening 👋"), subtitle "Ask us anything, or pick a topic below", team presence card with 3 overlapping colored avatar circles (S=violet, A=emerald, J=orange) + "Our team is online / Average reply time: ~2 min", Sarah welcome card with blue avatar + welcome message

4. **Add footer** — "Powered by SocialRep" text at bottom of window, subtle gray

5. **Update input bar styling** — Pill-shaped input with rounded border, send icon as paper plane (no colored background on button, just icon)

6. **Update CSS** — New classes for home view cards, avatar stack with negative margins, greeting typography, footer, refined input bar

No backend changes. No new files.




## Fix Chatbot Widget Blinking

### Root Cause

The `render()` function does `root.innerHTML = ""` and rebuilds the entire DOM tree from scratch. During SSE streaming, `render()` is called **on every single token** received from the AI. This means the entire chat window — header, messages, input field — is destroyed and recreated dozens of times per second. This causes:

1. **Visual blinking** — the window flashes as it's torn down and rebuilt
2. **Input focus loss** — the text input is destroyed and recreated each token
3. **Scroll position reset** — body scroll jumps on each rebuild

### The Fix

Stop doing full DOM rebuilds during streaming. Instead, use **targeted DOM updates**:

- During streaming, only update the assistant bubble's `innerHTML` with new content
- Keep a reference to the body element and scroll it, don't recreate it
- Only do a full `render()` at key state transitions (open/close, send message, stream complete)

### Changes — `public/chatbot-widget.js`

1. **Add DOM element references** — Store references to the body container and the current assistant bubble so they can be updated in-place

2. **Split render into full vs. partial** — Add an `updateStreamingBubble()` function that only touches the assistant message bubble's innerHTML, without rebuilding the window

3. **Throttle streaming updates** — Use `requestAnimationFrame` to batch multiple SSE chunks into a single DOM update per frame, preventing excessive repaints

4. **Update `streamResponse()`** — Instead of calling `render()` on every delta, call the new lightweight `updateStreamingBubble()` and only call full `render()` when the stream ends

5. **Preserve scroll** — Auto-scroll the existing body reference instead of relying on `setTimeout` after a full rebuild

### Single file change
| File | What |
|------|------|
| `public/chatbot-widget.js` | Refactor render loop: add element refs, partial update function, `requestAnimationFrame` batching |

No backend changes needed.


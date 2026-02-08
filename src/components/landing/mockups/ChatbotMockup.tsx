import { Check, Send } from "lucide-react";

export function ChatbotMockup() {
  const colors = [
    { color: "bg-primary", active: true },
    { color: "bg-emerald-500", active: false },
    { color: "bg-orange-500", active: false },
    { color: "bg-pink-500", active: false },
    { color: "bg-slate-700", active: false },
  ];

  return (
    <div className="bg-muted/30 rounded-2xl border border-border p-4 md:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Config Panel */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Widget Title</p>
            <p className="text-sm font-medium">Chat with Brew & Co.</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Welcome Message</p>
            <p className="text-sm">Hi there! 👋 How can we help?</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Brand Color</p>
            <div className="flex gap-2">
              {colors.map((c, i) => (
                <button
                  key={i}
                  className={`w-6 h-6 rounded-full ${c.color} flex items-center justify-center ${
                    c.active ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                >
                  {c.active && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Knowledge Base</p>
            <p className="text-sm text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              24 FAQs loaded
            </p>
          </div>
        </div>

        {/* Chat Widget Preview */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gradient-primary p-4 text-white">
            <p className="font-medium">Brew & Co.</p>
            <p className="text-xs text-white/80">Usually replies instantly</p>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 h-48">
            {/* Bot message */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs shrink-0">
                B
              </div>
              <div className="bg-muted rounded-lg rounded-tl-none p-2.5 max-w-[80%]">
                <p className="text-sm">Hi there! 👋 How can we help you today?</p>
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-primary text-white rounded-lg rounded-tr-none p-2.5 max-w-[80%]">
                <p className="text-sm">Do you have gluten-free options?</p>
              </div>
            </div>

            {/* Bot response */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs shrink-0">
                B
              </div>
              <div className="bg-muted rounded-lg rounded-tl-none p-2.5 max-w-[80%]">
                <p className="text-sm">Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu?</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none"
                disabled
              />
              <Send className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Sparkles } from "lucide-react";

const inboxItems = [
  {
    name: "@sarah_designs",
    avatar: "S",
    avatarColor: "bg-pink-500",
    message: "Love this product! Do you ship to Miami? ✨",
    tag: "Positive",
    tagColor: "bg-emerald-100 text-emerald-700",
    selected: true,
  },
  {
    name: "Mike Thompson",
    avatar: "M",
    avatarColor: "bg-orange-500",
    message: "Still waiting on my order...",
    tag: "Urgent",
    tagColor: "bg-red-100 text-red-700",
    selected: false,
  },
  {
    name: "Alex Chen",
    avatar: "A",
    avatarColor: "bg-blue-500",
    message: "Outstanding service!",
    tag: "★★★★★",
    tagColor: "bg-amber-100 text-amber-700",
    selected: false,
  },
  {
    name: "Jen Rivera",
    avatar: "J",
    avatarColor: "bg-purple-500",
    message: "Can I get a refund?",
    tag: "AI Draft",
    tagColor: "bg-primary/10 text-primary",
    selected: false,
  },
];

export function UnifiedInboxMockup() {
  return (
    <div className="bg-muted/30 rounded-2xl border border-border p-4 md:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Inbox List */}
        <div className="space-y-2">
          {inboxItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 bg-white rounded-lg p-3 border ${
                item.selected ? "border-primary shadow-sm" : "border-border/50"
              }`}
            >
              <div className={`w-9 h-9 rounded-full ${item.avatarColor} flex items-center justify-center text-sm font-medium text-white shrink-0`}>
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.message}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Detail View */}
        <div className="bg-white rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">@sarah_designs</span>
            <span className="text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-700">Instagram</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Love this product! Do you ship to Miami? ✨
          </p>
          <div className="border border-dashed border-primary/30 bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Draft
            </div>
            <p className="text-sm">
              Thanks so much, Sarah! 💜 Yes, we ship to Miami — usually 3-5 days. Want me to DM you a shipping estimate?
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg font-medium">
              Send Response
            </button>
            <button className="px-4 border border-border text-sm py-2 rounded-lg">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

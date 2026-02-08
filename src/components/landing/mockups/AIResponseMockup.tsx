import { Star, Sparkles } from "lucide-react";

export function AIResponseMockup() {
  return (
    <div className="bg-muted/30 rounded-2xl border border-border p-4 md:p-6 space-y-4">
      {/* Review 1 - Positive */}
      <div className="bg-white rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">David K.</span>
            <span className="text-xs text-muted-foreground">Google</span>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Best coffee shop in the neighborhood. The oat milk latte is incredible and the staff always remembers my name.
        </p>
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-3">
          <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Response — matches your brand voice
          </div>
          <p className="text-sm">
            David, that just made our morning! The oat milk latte is a team favorite too. We'll keep your usual ready 😊 — Team Brew & Co.
          </p>
        </div>
      </div>

      {/* Review 2 - Negative */}
      <div className="bg-white rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Lisa M.</span>
            <span className="text-xs text-muted-foreground">Yelp</span>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 2 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Waited 25 minutes for a simple order. Staff seemed overwhelmed and my drink was wrong.
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Generate Response
          </button>
          <button className="px-4 border border-border text-sm py-2 rounded-lg">
            View Full Review
          </button>
        </div>
      </div>
    </div>
  );
}

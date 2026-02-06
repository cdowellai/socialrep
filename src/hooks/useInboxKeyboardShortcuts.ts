import { useEffect, useCallback, useState } from "react";

interface UseInboxKeyboardShortcutsOptions {
  interactions: { id: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onResolve: () => void;
  onFocusReply: () => void;
  onOpenAssign: () => void;
  enabled?: boolean;
}

export function useInboxKeyboardShortcuts({
  interactions,
  selectedId,
  onSelect,
  onResolve,
  onFocusReply,
  onOpenAssign,
  enabled = true,
}: UseInboxKeyboardShortcutsOptions) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape to blur
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      const currentIndex = interactions.findIndex((i) => i.id === selectedId);

      switch (e.key.toLowerCase()) {
        case "j": // Move down
          e.preventDefault();
          if (currentIndex < interactions.length - 1) {
            onSelect(interactions[currentIndex + 1].id);
          }
          break;

        case "k": // Move up
          e.preventDefault();
          if (currentIndex > 0) {
            onSelect(interactions[currentIndex - 1].id);
          }
          break;

        case "r": // Focus reply
          e.preventDefault();
          onFocusReply();
          break;

        case "e": // Mark resolved
          e.preventDefault();
          onResolve();
          break;

        case "a": // Assign to (Shift+A)
          if (e.shiftKey) {
            e.preventDefault();
            onOpenAssign();
          }
          break;

        case "?": // Show help
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;

        case "escape":
          e.preventDefault();
          setShowHelp(false);
          break;
      }
    },
    [enabled, interactions, selectedId, onSelect, onResolve, onFocusReply, onOpenAssign]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
  };
}

export const KEYBOARD_SHORTCUTS = [
  { key: "J", description: "Next message" },
  { key: "K", description: "Previous message" },
  { key: "R", description: "Focus reply input" },
  { key: "E", description: "Mark as resolved" },
  { key: "⇧ A", description: "Assign to team member" },
  { key: "?", description: "Toggle keyboard shortcuts" },
  { key: "Esc", description: "Close dialogs / blur input" },
];

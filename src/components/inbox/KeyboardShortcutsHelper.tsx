import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "@/hooks/useInboxKeyboardShortcuts";

interface KeyboardShortcutsHelperProps {
  showDialog: boolean;
  onDialogChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelper({
  showDialog,
  onDialogChange,
}: KeyboardShortcutsHelperProps) {
  return (
    <>
      {/* Trigger Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
            <div className="grid gap-1.5">
              {KEYBOARD_SHORTCUTS.slice(0, 5).map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{shortcut.description}</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => onDialogChange(true)}
            >
              See all shortcuts →
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Full Dialog */}
      <Dialog open={showDialog} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm">{shortcut.description}</span>
                <kbd className="px-3 py-1 rounded bg-muted text-sm font-mono font-medium">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">?</kbd> anytime to toggle this dialog
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

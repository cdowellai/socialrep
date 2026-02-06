import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Plus, Loader2, FileText } from "lucide-react";
import { useResponseTemplates, type ResponseTemplate } from "@/hooks/useResponseTemplates";
import { cn } from "@/lib/utils";

interface CannedResponsesDropdownProps {
  onSelect: (template: string) => void;
  disabled?: boolean;
}

export function CannedResponsesDropdown({
  onSelect,
  disabled,
}: CannedResponsesDropdownProps) {
  const { templates, loading, createTemplate } = useResponseTemplates();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSelect = (template: ResponseTemplate) => {
    onSelect(template.template);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newTemplate.trim()) return;

    setCreating(true);
    try {
      await createTemplate(newName.trim(), newTemplate.trim(), newCategory.trim() || undefined);
      setShowCreateDialog(false);
      setNewName("");
      setNewTemplate("");
      setNewCategory("");
    } finally {
      setCreating(false);
    }
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, ResponseTemplate[]>);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <Zap className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="py-4 px-2 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-2">
                No templates yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Template
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-80">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {categoryTemplates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="flex flex-col items-start gap-1 py-2"
                    >
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {template.template}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </DropdownMenuItem>
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Response Template</DialogTitle>
            <DialogDescription>
              Save a canned response for quick reuse. Use {"{{variable}}"} for dynamic placeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Thank You Response"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Customer Support"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template Content</Label>
              <Textarea
                id="template"
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                placeholder="Thank you for reaching out, {{name}}! We appreciate your feedback..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || !newTemplate.trim() || creating}
            >
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  HelpCircle,
  FileText,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { useChatbotKnowledgeBase, type KnowledgeBaseEntry } from "@/hooks/useChatbotKnowledgeBase";
import { cn } from "@/lib/utils";

export function KnowledgeBaseTab() {
  const {
    entries,
    loading,
    addFAQContent,
    addQAPair,
    addDocumentContent,
    deleteEntry,
  } = useChatbotKnowledgeBase();

  const [faqTitle, setFaqTitle] = useState("");
  const [faqContent, setFaqContent] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAddFAQ = async () => {
    if (!faqTitle.trim() || !faqContent.trim()) return;
    setSaving(true);
    await addFAQContent(faqTitle.trim(), faqContent.trim());
    setFaqTitle("");
    setFaqContent("");
    setSaving(false);
  };

  const handleAddQAPair = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    await addQAPair(question.trim(), answer.trim());
    setQuestion("");
    setAnswer("");
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".txt", ".pdf", ".docx"];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
      alert("Please upload a TXT, PDF, or DOCX file");
      return;
    }

    setUploading(true);

    try {
      // For text files, read directly
      if (file.type === "text/plain" || extension === ".txt") {
        const text = await file.text();
        await addDocumentContent(file.name, text);
      } else {
        // For PDF/DOCX, we'll extract text client-side (simplified)
        // In production, you'd want to use a proper parsing service
        const reader = new FileReader();
        reader.onload = async () => {
          // For now, store basic info - actual PDF parsing would need a library
          await addDocumentContent(
            file.name,
            `[Content from ${file.name}] - PDF/DOCX parsing requires additional processing. For best results, copy and paste the text content directly into the FAQ section.`
          );
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const faqEntries = entries.filter((e) => e.entry_type === "faq");
  const qaPairs = entries.filter((e) => e.entry_type === "qa_pair");
  const documents = entries.filter((e) => e.entry_type === "document");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Add content that your chatbot will use to answer customer questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="faq" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq" className="gap-2">
                <FileText className="h-4 w-4" />
                FAQ Content
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Q&A Pairs
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <Upload className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Shipping Information"
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Paste your FAQ content, product information, company details, or any other content you want the chatbot to know about..."
                    value={faqContent}
                    onChange={(e) => setFaqContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleAddFAQ}
                  disabled={!faqTitle.trim() || !faqContent.trim() || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add FAQ Content
                </Button>
              </div>

              {faqEntries.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Added FAQ Content</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {faqEntries.map((entry) => (
                        <EntryItem key={entry.id} entry={entry} onDelete={deleteEntry} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    placeholder="e.g., What are your business hours?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer</Label>
                  <Textarea
                    placeholder="The answer that the chatbot should provide..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleAddQAPair}
                  disabled={!question.trim() || !answer.trim() || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Q&A Pair
                </Button>
              </div>

              {qaPairs.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Added Q&A Pairs</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {qaPairs.map((entry) => (
                        <QAItem key={entry.id} entry={entry} onDelete={deleteEntry} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "cursor-pointer flex flex-col items-center gap-2",
                    uploading && "opacity-50 pointer-events-none"
                  )}
                >
                  {uploading ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Click to upload a document"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    TXT, PDF, or DOCX files supported
                  </span>
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Uploaded Documents</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {documents.map((entry) => (
                        <EntryItem
                          key={entry.id}
                          entry={entry}
                          onDelete={deleteEntry}
                          showFilename
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Knowledge Base Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Badge variant="secondary">{faqEntries.length} FAQ entries</Badge>
            <Badge variant="secondary">{qaPairs.length} Q&A pairs</Badge>
            <Badge variant="secondary">{documents.length} documents</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EntryItem({
  entry,
  onDelete,
  showFilename,
}: {
  entry: KnowledgeBaseEntry;
  onDelete: (id: string) => void;
  showFilename?: boolean;
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {showFilename ? entry.source_filename : entry.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {entry.content?.slice(0, 150)}
          {(entry.content?.length || 0) > 150 && "..."}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 ml-2">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this knowledge base entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(entry.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function QAItem({
  entry,
  onDelete,
}: {
  entry: KnowledgeBaseEntry;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Q: {entry.question}</p>
          <p className="text-xs text-muted-foreground mt-1">A: {entry.answer}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 ml-2">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Q&A Pair</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this Q&A pair? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(entry.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

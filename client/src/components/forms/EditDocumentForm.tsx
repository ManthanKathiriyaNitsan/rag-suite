import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentAPI, DocumentMetadata } from "@/lib/api";

interface EditDocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  initialMetadata?: DocumentMetadata;
  onSubmit?: (metadata: DocumentMetadata) => void;
}

export function EditDocumentForm({ open, onOpenChange, documentId, initialMetadata, onSubmit }: EditDocumentFormProps) {
  const [title, setTitle] = React.useState(initialMetadata?.title || "");
  const [description, setDescription] = React.useState(initialMetadata?.description || "");
  const [language, setLanguage] = React.useState(initialMetadata?.language || "en");
  const [source, setSource] = React.useState(initialMetadata?.source || "");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setTitle(initialMetadata?.title || "");
    setDescription(initialMetadata?.description || "");
    setLanguage(initialMetadata?.language || "en");
    setSource(initialMetadata?.source || "");
  }, [initialMetadata, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metadata: DocumentMetadata = {
      title: title || undefined,
      description: description || undefined,
      language: language || undefined,
      source: source || undefined,
    };

    try {
      setIsSaving(true);
      await documentAPI.updateDocument(documentId, metadata);
      if (onSubmit) onSubmit(metadata);
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Update document failed:", error);
      // Optionally display toast here if we pass a toast hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update document details. Changes reflect in the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="doc-title">Title (Optional)</Label>
            <Input
              id="doc-title"
              placeholder="Document title or leave empty to use filename"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="doc-description">Description (Optional)</Label>
            <Textarea
              id="doc-description"
              placeholder="Brief description of the document contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="doc-language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="doc-source">Source Collection</Label>
              <Input
                id="doc-source"
                placeholder="e.g., manual-uploads"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
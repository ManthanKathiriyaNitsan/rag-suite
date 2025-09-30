import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileText, X } from "lucide-react";

interface UploadDocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function UploadDocumentForm({ open, onOpenChange, onSubmit }: UploadDocumentFormProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [source, setSource] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      files,
      title,
      description,
      language,
      source,
    });
    onOpenChange(false);
    // Reset form
    setFiles(null);
    setTitle("");
    setDescription("");
    setLanguage("en");
    setSource("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl  max-h-[100vh]  overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents to be indexed and made available for search and chat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <div className="mt-2">
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.html"
                onChange={handleFileChange}
                data-testid="input-file-upload"
                className="file:mr-4 file:py-2 h-18 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, MD, HTML (max 10MB each)
              </p>
            </div>
            {files && (
              <div className="mt-2 space-y-1">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="doc-title">Title (Optional)</Label>
            <Input
              id="doc-title"
              placeholder="Document title or leave empty to use filename"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-doc-title"
            />
          </div>

          <div>
            <Label htmlFor="doc-description">Description (Optional)</Label>
            <Textarea
              id="doc-description"
              placeholder="Brief description of the document contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-doc-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="doc-language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-doc-language">
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
                data-testid="input-doc-source"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" className="my-2" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!files} data-testid="button-upload-documents">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
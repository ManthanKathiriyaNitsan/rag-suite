import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Upload, FileText, X, Loader2 } from "lucide-react";
// 📄 Import API and types
import { documentAPI, DocumentMetadata } from "@/services/api/api";

import { UploadDocumentFormProps } from "@/types/forms";

const UploadDocumentForm = React.memo(function UploadDocumentForm({ open, onOpenChange, onSubmit }: UploadDocumentFormProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  
  // 📄 Simple state for upload
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [source, setSource] = useState("");

  // 📄 Memoized handleSubmit using real API
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files || files.length === 0) {
      return;
    }

    // Create metadata object
    const metadata: DocumentMetadata = {
      title: title || undefined,
      description: description || undefined,
      language: language,
      source: source || undefined,
    };

    try {
      setIsUploading(true);
      
      // Upload each file to API
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await documentAPI.uploadDocument(file, metadata);
      }
      
      // Call optional onSubmit callback (for refresh, not duplicate upload)
      if (onSubmit) {
        onSubmit({ files, metadata });
      }
      
      onOpenChange(false);
      
      // Reset form
      setFiles(null);
      setTitle("");
      setDescription("");
      setLanguage("en");
      setSource("");
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Show specific error message from API
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response?.data?.detail) {
        // Handle validation errors from FastAPI
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => 
            `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg || err.message || 'Invalid value'}`
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  }, [files, title, description, language, source, onSubmit]);

  // 📁 Memoized file change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  }, []);

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
            <Button 
              type="submit" 
              disabled={!files || isUploading} 
              data-testid="button-upload-documents"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default UploadDocumentForm;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Globe, X, Plus } from "lucide-react";

interface CreateIntegrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateIntegrationForm({ open, onOpenChange, onSubmit }: CreateIntegrationFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [owner, setOwner] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const publicId = `${slug}-${Math.random().toString(36).substr(2, 6)}`;
    
    onSubmit({
      name,
      slug,
      description,
      status,
      owner,
      tags,
      publicId,
    });
    
    onOpenChange(false);
    
    // Reset form
    setName("");
    setSlug("");
    setDescription("");
    setStatus("active");
    setOwner("");
    setTags([]);
    setNewTag("");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(newName));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl  ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Create New Integration
          </DialogTitle>
          <DialogDescription>
            Set up a new AI chat and search integration for your website or application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="integration-name">Integration Name</Label>
              <Input
                id="integration-name"
                placeholder="e.g., Documentation Widget"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                data-testid="input-integration-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="integration-slug">Slug</Label>
              <Input
                id="integration-slug"
                placeholder="auto-generated from name"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                data-testid="input-integration-slug"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for API endpoints and URLs
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="integration-description">Description</Label>
            <Textarea
              id="integration-description"
              placeholder="Brief description of what this integration does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-integration-description"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="integration-status">Initial Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-integration-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="integration-owner">Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger data-testid="select-integration-owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john@company.com">John Doe</SelectItem>
                  <SelectItem value="jane@company.com">Jane Smith</SelectItem>
                  <SelectItem value="bob@company.com">Bob Wilson</SelectItem>
                  <SelectItem value="alice@company.com">Alice Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2 mb-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                data-testid="input-new-tag"
              />
              <Button type="button" onClick={addTag} data-testid="button-add-tag">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeTag(tag)}
                    data-testid={`button-remove-tag-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use tags to organize and categorize your integrations
            </p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• A unique public ID will be generated for this integration</li>
              <li>• You'll be able to configure RAG settings, themes, and domains</li>
              <li>• API keys can be created for different environments</li>
              <li>• Embed code will be generated for your website</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-create-integration">
              <Globe className="h-4 w-4 mr-2" />
              Create Integration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
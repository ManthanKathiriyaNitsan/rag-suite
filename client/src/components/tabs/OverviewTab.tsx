import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { OverviewTabProps } from "@/types/components";
import { User } from "@/types/api";


export default function OverviewTab({ data, users = [], onChange }: OverviewTabProps) {
  const [name, setName] = useState(data.name || "");
  const [slug, setSlug] = useState(data.slug || "");
  const [description, setDescription] = useState(data.description || "");
  const [status, setStatus] = useState(data.status || "active");
  const [ownerId, setOwnerId] = useState(data.ownerId || "");
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [newTag, setNewTag] = useState("");
  const [ownerOpen, setOwnerOpen] = useState(false);

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
    // Auto-generate slug if it hasn't been manually modified
    if (!slug || slug === generateSlug(name)) {
      const newSlug = generateSlug(newName);
      setSlug(newSlug);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Update parent component when data changes
  useEffect(() => {
    onChange({
      name,
      slug,
      description,
      status,
      ownerId,
      tags,
    });
  }, [name, slug, description, status, ownerId, tags, onChange]);

  const selectedOwner = users.find((user: User) => user.id === ownerId);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name and Slug */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Documentation Widget"
                data-testid="input-integration-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="docs-widget"
                data-testid="input-integration-slug"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and API calls. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this integration does..."
              rows={3}
              data-testid="textarea-integration-description"
            />
          </div>

          {/* Status and Owner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-integration-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={ownerOpen}
                    className="w-full justify-between"
                    data-testid="button-select-owner"
                  >
                    {selectedOwner ? (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{selectedOwner.name}</span>
                      </div>
                    ) : (
                      "Select owner..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user: User) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              setOwnerId(user.id);
                              setOwnerOpen(false);
                            }}
                            data-testid={`option-owner-${user.id}`}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                ownerId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 w-4 h-4"
                      onClick={() => removeTag(tag)}
                      data-testid={`button-remove-tag-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag..."
                  className="max-w-xs flex-1 sm:flex-none"
                  data-testid="input-new-tag"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                  data-testid="button-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tags help organize and categorize your integrations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

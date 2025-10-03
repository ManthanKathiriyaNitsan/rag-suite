import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, X } from "lucide-react";
import { CrawlSite, CrawlSiteData } from "@/lib/api";

interface AddSourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CrawlSiteData) => void;
  editData?: CrawlSite;
}

export function AddSourceForm({ open, onOpenChange, onSubmit, editData }: AddSourceFormProps) {
  const [url, setUrl] = useState(editData?.url || "");
  const [name, setName] = useState(editData?.name || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [crawlDepth, setCrawlDepth] = useState<number>(editData?.crawlDepth || 2);
  // UI cadence values: "hourly" | "daily" | "weekly" (mapped to API on submit)
  const [cadenceUI, setCadenceUI] = useState<string>("daily");
  // Use a simple boolean toggle for headless, map to API headlessMode on submit
  const [headless, setHeadless] = useState<boolean>(false);
  const [includePatterns, setIncludePatterns] = useState<string[]>(editData?.includePatterns || []);
  const [excludePatterns, setExcludePatterns] = useState<string[]>(editData?.excludePatterns || []);
  const [newAllowPattern, setNewAllowPattern] = useState("");
  const [newDenyPattern, setNewDenyPattern] = useState("");

  // Keep form in sync when switching between add and edit
  useEffect(() => {
    setUrl(editData?.url || "");
    setName(editData?.name || "");
    setDescription(editData?.description || "");
    setCrawlDepth(editData?.crawlDepth || 2);
    // Defaults for fields not present in site object
    setCadenceUI("daily");
    setHeadless(false);
    setIncludePatterns(editData?.includePatterns || []);
    setExcludePatterns(editData?.excludePatterns || []);
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Map UI fields to CrawlSiteData expected by API layer
    const mappedCadence: CrawlSiteData["cadence"] =
      cadenceUI === "daily" ? "DAILY" : cadenceUI === "weekly" ? "WEEKLY" : "ONCE";

    const payload: CrawlSiteData = {
      name,
      url,
      description,
      crawlDepth,
      cadence: mappedCadence,
      headlessMode: headless ? "ON" : "OFF",
      includePatterns,
      excludePatterns,
    };

    onSubmit(payload);
    onOpenChange(false);
  };

  const addAllowPattern = () => {
    if (newAllowPattern.trim()) {
      setIncludePatterns([...includePatterns, newAllowPattern.trim()]);
      setNewAllowPattern("");
    }
  };

  const addDenyPattern = () => {
    if (newDenyPattern.trim()) {
      setExcludePatterns([...excludePatterns, newDenyPattern.trim()]);
      setNewDenyPattern("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[100vh]  overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Crawl Source" : "Add New Crawl Source"}</DialogTitle>
          <DialogDescription>
            Configure a new website or documentation source for crawling and indexing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="source-name">Source Name</Label>
              <Input
                id="source-name"
                placeholder="e.g., Documentation Site"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-source-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="source-url">Website URL</Label>
              <Input
                id="source-url"
                type="url"
                placeholder="https://docs.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-source-url"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this source..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="crawl-depth">Crawl Depth</Label>
              <Select value={crawlDepth.toString()} onValueChange={(value) => setCrawlDepth(parseInt(value))}>
                <SelectTrigger data-testid="select-crawl-depth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 level (homepage only)</SelectItem>
                  <SelectItem value="2">2 levels</SelectItem>
                  <SelectItem value="3">3 levels</SelectItem>
                  <SelectItem value="4">4 levels</SelectItem>
                  <SelectItem value="5">5 levels (deep crawl)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cadence">Crawl Frequency</Label>
              <Select value={cadenceUI} onValueChange={setCadenceUI}>
                <SelectTrigger data-testid="select-cadence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="once">Once</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="headless-mode">Headless Browser Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable for JavaScript-heavy sites that require rendering
              </p>
            </div>
            <Switch
              id="headless-mode"
              checked={headless}
              onCheckedChange={setHeadless}
              data-testid="switch-headless-mode"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Allow Patterns</Label>
              <p className="text-sm text-muted-foreground mb-2">
                URL patterns to include (use * for wildcards)
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="/docs/* or /api/*"
                  value={newAllowPattern}
                  onChange={(e) => setNewAllowPattern(e.target.value)}
                  data-testid="input-allow-pattern"
                />
                <Button type="button" onClick={addAllowPattern} data-testid="button-add-allow">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {includePatterns.map((pattern, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {pattern}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setIncludePatterns(includePatterns.filter((_, i) => i !== index))}
                      data-testid={`button-remove-allow-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Deny Patterns</Label>
              <p className="text-sm text-muted-foreground mb-2">
                URL patterns to exclude
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="/admin/* or /private/*"
                  value={newDenyPattern}
                  onChange={(e) => setNewDenyPattern(e.target.value)}
                  data-testid="input-deny-pattern"
                />
                <Button type="button" onClick={addDenyPattern} data-testid="button-add-deny">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {excludePatterns.map((pattern, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {pattern}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setExcludePatterns(excludePatterns.filter((_, i) => i !== index))}
                      data-testid={`button-remove-deny-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" className="my-2" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-source">
              {editData ? "Update Source" : "Create Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
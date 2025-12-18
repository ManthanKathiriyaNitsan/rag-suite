import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Key,
  Code,
  Smartphone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

import { embedAPI, type EmbedKey } from "@/services/api/api";
import { Loader2 } from "lucide-react";

interface EmbedKeysTabProps {
  data: {
    publicId: string;
    keys: EmbedKey[];
  };
  onChange: (data: any) => void;
}

export default function EmbedKeysTab({ data, onChange }: EmbedKeysTabProps) {
  const [keys, setKeys] = useState<EmbedKey[]>([]);
  const [publicId, setPublicId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const { toast } = useToast();

  // Fetch initial data from API
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await embedAPI.get();
        if (response) {
          setPublicId(response.public_id);
          // Map backend keys to frontend format if needed
          // The API response keys match EmbedKey interface
          setKeys(response.keys || []);
        }
      } catch (error) {
        console.error('Failed to fetch embed config:', error);
        toast({
          title: "Error",
          description: "Failed to load embed configuration",
          variant: "destructive",
        });

        // Fallback to props data (legacy/offline mode)
        if (data) {
          setPublicId(data.publicId || "");
          setKeys(data.keys || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [toast]); // Run once on mount

  // Update parent state when data changes (for compatibility)
  useEffect(() => {
    onChange({
      publicId,
      keys,
    });
  }, [publicId, keys, onChange]);

  // Helper to save current state to API
  const saveConfiguration = async (newPublicId: string, newKeys: EmbedKey[]) => {
    try {
      // API expects keys as Partial<EmbedKey>, we can pass full objects
      const payload = {
        publicId: newPublicId,
        keys: newKeys
      };

      const response = await embedAPI.update(payload);

      // Update state with server response (it might include new IDs or timestamps)
      if (response) {
        setPublicId(response.public_id);
        setKeys(response.keys);
      }
      return true;
    } catch (error) {
      console.error('Failed to update embed config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration changes",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create key form state
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"staging" | "production">("staging");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000");
  const [newKeyExpiry, setNewKeyExpiry] = useState("");

  const handleCreateKey = async () => {
    // Generate new key locally (optimistic)
    const newKey: EmbedKey = {
      id: `key-${Date.now()}`,
      label: newKeyLabel,
      keyPrefix: `rag_pk_${newKeyEnv}_${Math.random().toString(36).substr(2, 6)}`,
      environment: newKeyEnv,
      rateLimit: parseInt(newKeyRateLimit),
      expiresAt: newKeyExpiry ? new Date(newKeyExpiry).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 year if empty
      isActive: true,
      lastUsedAt: new Date().toISOString(), // Use ISO string
      createdAt: new Date().toISOString(),
    };

    const fullKey = `${newKey.keyPrefix}${Math.random().toString(36).substr(2, 24)}`;

    // Add to list
    const updatedKeys = [...keys, newKey];

    // Save to API
    const success = await saveConfiguration(publicId, updatedKeys);

    if (success) {
      setGeneratedKey(fullKey);
      setShowGeneratedKey(true);

      // Reset form
      setNewKeyLabel("");
      setNewKeyEnv("staging");
      setNewKeyRateLimit("1000");
      setNewKeyExpiry("");
      setCreateKeyOpen(false); // Close dialog

      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Make sure to copy it now.",
      });
    }
  };

  const handleCopyKey = (keyToCopy: string) => {
    navigator.clipboard.writeText(keyToCopy);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleCopyPublicId = () => {
    navigator.clipboard.writeText(publicId);
    toast({
      title: "Copied!",
      description: "Public ID copied to clipboard",
    });
  };

  const handleRegeneratePublicId = async () => {
    const newPublicId = `docs-widget-${Math.random().toString(36).substr(2, 6)}`;
    const success = await saveConfiguration(newPublicId, keys);

    if (success) {
      toast({
        title: "Public ID Regenerated",
        description: "A new public ID has been generated",
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await embedAPI.deleteKey(keyId);

      setKeys(prev => prev.filter(key => key.id !== keyId));

      toast({
        title: "Key Deleted",
        description: "The API key has been permanently deleted",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Failed to delete key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const getEmbedScript = () => {
    return `<!-- RAG Suite Chat Widget -->
<script>
  window.ragSuiteConfig = {
    publicId: "${publicId}",
    baseUrl: "https://api.ragsuite.com"
  };
</script>
<script src="https://cdn.ragsuite.com/widget.js" async></script>`;
  };

  const getReactCode = () => {
    return `import { RagSuiteWidget } from '@ragsuite/react';

function App() {
  return (
    <div>
      <RagSuiteWidget
        publicId="${publicId}"
        baseUrl="https://api.ragsuite.com"
        // Optional configuration
        defaultOpen={false}
        showLauncher={true}
      />
    </div>
  );
}`;
  };

  const getWebViewCode = () => {
    return `// iOS WebView Integration
import WebKit

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let webView = WKWebView()
        let url = URL(string: "https://widget.ragsuite.com?id=${publicId}")!
        webView.load(URLRequest(url: url))
        
        view.addSubview(webView)
        // Add constraints...
    }
}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-0 sm:px-0" style={{ maxWidth: '85vw' }}>
      {/* Public ID Section */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Integration ID
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="public-id">Public ID</Label>
              <div className="flex flex-col gap-2 min-w-0">
                <Input
                  id="public-id"
                  value={publicId}
                  readOnly
                  className="font-mono w-full min-w-0 text-xs sm:text-sm"
                  data-testid="input-public-id"
                />
                <div className="flex gap-2 flex-col sm:flex-row w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPublicId}
                    data-testid="button-copy-public-id"
                    className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRegeneratePublicId}
                    data-testid="button-regenerate-public-id"
                    className="flex-1 sm:flex-none h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Regenerate</span>
                    <span className="sm:hidden">Regen</span>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This ID is used in embed code and API calls. Regenerating will require updating all implementations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 lg:items-center items-start lg:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-key">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md  w-[calc(100vw-1rem)] sm:w-auto">
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for your integration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-label">Label *</Label>
                    <Input
                      id="key-label"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      placeholder="e.g., Production Frontend"
                      data-testid="input-key-label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-env">Environment</Label>
                    <Select value={newKeyEnv} onValueChange={(value: "staging" | "production") => setNewKeyEnv(value)}>
                      <SelectTrigger data-testid="select-key-environment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-rate-limit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="key-rate-limit"
                      type="number"
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(e.target.value)}
                      data-testid="input-key-rate-limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-expiry">Expiry Date (optional)</Label>
                    <Input
                      id="key-expiry"
                      type="date"
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(e.target.value)}
                      data-testid="input-key-expiry"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="sm:min-w-[140px]"
                    onClick={() => setCreateKeyOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="sm:min-w-[140px]"
                    onClick={handleCreateKey}
                    disabled={!newKeyLabel.trim()}
                    data-testid="button-confirm-create-key"
                  >
                    Create Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full min-w-0 mx-2 sm:mx-0" style={{ maxWidth: 'calc(100% - 1rem)' }}>
            <Table className="min-w-[700px] sm:min-w-[800px] w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Label</TableHead>
                  <TableHead className="w-[25%]">Prefix</TableHead>
                  <TableHead className="w-[15%]">Environment</TableHead>
                  <TableHead className="w-[15%]">Rate Limit</TableHead>
                  <TableHead className="w-[12%]">Created</TableHead>
                  <TableHead className="w-[12%]">Last Used</TableHead>
                  <TableHead className="w-[7%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} data-testid={`row-key-${key.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{key.label}</span>
                        {!key.isActive && (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            Revoked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm break-all font-mono">{key.keyPrefix}...</code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          key.environment === "production" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {key.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.rateLimit.toLocaleString()}/hr
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                        Math.floor(
                          (new Date(key.createdAt).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                        ),
                        "day"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt
                        ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                          Math.floor(
                            (new Date(key.lastUsedAt).getTime() - Date.now()) / (1000 * 60 * 60)
                          ),
                          "hour"
                        )
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-key-actions-${key.id}`}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => console.log("Rotate key:", key.id)}
                            data-testid={`action-rotate-${key.id}`}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rotate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-destructive focus:text-destructive"
                            data-testid={`action-delete-${key.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

      </Card>

      {/* Generated Key Modal */}
      <Dialog open={showGeneratedKey} onOpenChange={setShowGeneratedKey}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] overflow-x-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Copy your API key now. For security reasons, we cannot show it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-2 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm flex-1 break-words whitespace-pre-wrap">
                  {generatedKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyKey(generatedKey)}
                  data-testid="button-copy-generated-key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="sm:min-w-[140px]"
              onClick={() => setShowGeneratedKey(false)}
              data-testid="button-close-generated-key"
            >
              I've copied the key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Section */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Embed Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="script">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1">
              <TabsTrigger value="script" data-testid="tab-script" className="flex items-center justify-center">
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Script Tag</span>
                <span className="sm:hidden">Script</span>
              </TabsTrigger>
              <TabsTrigger value="react" data-testid="tab-react" className="flex items-center justify-center">
                <Code className="h-4 w-4 mr-2" />
                React
              </TabsTrigger>
              <TabsTrigger value="webview" data-testid="tab-webview" className="flex items-center justify-center">
                <Smartphone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">WebView</span>
                <span className="sm:hidden">Mobile</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="script" className="mt-4">
              <div className="relative min-w-0">
                <pre className="bg-muted p-2 sm:p-4 rounded-lg text-xs sm:text-sm overflow-x-auto max-h-[300px] sm:max-h-[400px] overflow-y-auto min-w-0">
                  <code className="whitespace-pre-wrap break-words">{getEmbedScript()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyKey(getEmbedScript())}
                  data-testid="button-copy-script"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="react" className="mt-4">
              <div className="relative min-w-0">
                <pre className="bg-muted p-2 sm:p-4 rounded-lg text-xs sm:text-sm overflow-x-auto max-h-[300px] sm:max-h-[400px] overflow-y-auto min-w-0">
                  <code className="whitespace-pre-wrap break-words">{getReactCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyKey(getReactCode())}
                  data-testid="button-copy-react"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="webview" className="mt-4">
              <div className="relative min-w-0">
                <pre className="bg-muted p-2 sm:p-4 rounded-lg text-xs sm:text-sm overflow-x-auto max-h-[300px] sm:max-h-[400px] overflow-y-auto min-w-0">
                  <code className="whitespace-pre-wrap break-words">{getWebViewCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyKey(getWebViewCode())}
                  data-testid="button-copy-webview"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

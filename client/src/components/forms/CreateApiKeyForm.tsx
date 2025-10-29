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
import { Key, Copy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateApiKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

function CreateApiKeyForm({ open, onOpenChange, onSubmit }: CreateApiKeyFormProps) {
  const [step, setStep] = useState<"form" | "created">("form");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rateLimit, setRateLimit] = useState(100);
  const [environment, setEnvironment] = useState("production");
  const [expiry, setExpiry] = useState("never");
  const [generatedKey, setGeneratedKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a mock API key
    const newKey = `rgs_${environment === "production" ? "live" : "test"}_${Math.random().toString(36).substr(2, 24)}`;
    setGeneratedKey(newKey);
    setStep("created");
    
    onSubmit({
      name,
      description,
      rateLimit,
      environment,
      expiry,
      key: newKey,
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    console.log("API key copied to clipboard");
  };

  const handleClose = () => {
    setStep("form");
    setName("");
    setDescription("");
    setRateLimit(100);
    setEnvironment("production");
    setExpiry("never");
    setGeneratedKey("");
    onOpenChange(false);
  };

  if (step === "created") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md  ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Your new API key has been generated. Copy it now - you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Store this key securely. For security reasons, you won't be able to view it again.
              </AlertDescription>
            </Alert>

            <div>
              <Label>API Key</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-generated-key"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyKey}
                  data-testid="button-copy-key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Environment:</strong> {environment}</p>
              <p><strong>Rate Limit:</strong> {rateLimit} requests/hour</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} data-testid="button-close-key-dialog">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access to RAGSuite.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              placeholder="e.g., Production API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-key-name"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              A descriptive name to help you identify this key
            </p>
          </div>

          <div>
            <Label htmlFor="key-description">Description (Optional)</Label>
            <Textarea
              id="key-description"
              placeholder="What will this key be used for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-key-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger data-testid="select-environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
              <Input
                id="rate-limit"
                type="number"
                min="1"
                max="10000"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                data-testid="input-rate-limit"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expiry">Expiration</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger data-testid="select-expiry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="my-2" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-create-key">
              <Key className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateApiKeyForm;

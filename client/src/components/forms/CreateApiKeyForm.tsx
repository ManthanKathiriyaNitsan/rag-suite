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
import { Key } from "lucide-react";

interface CreateApiKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

function CreateApiKeyForm({ open, onOpenChange, onSubmit }: CreateApiKeyFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rateLimit, setRateLimit] = useState(100);
  const [environment, setEnvironment] = useState("production");
  const [expiry, setExpiry] = useState("never");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a mock API key
    const newKey = `rgs_${environment === "production" ? "live" : "test"}_${Math.random().toString(36).substr(2, 24)}`;
    
    onSubmit({
      name,
      description,
      rateLimit,
      environment,
      expiry,
      key: newKey,
    });

    // Reset form
    setName("");
    setDescription("");
    setRateLimit(100);
    setEnvironment("production");
    setExpiry("never");

    onOpenChange(false);
  };

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
            <Button 
              type="button" 
              variant="outline" 
              className="sm:min-w-[140px]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="sm:min-w-[140px]"
              data-testid="button-create-key"
            >
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
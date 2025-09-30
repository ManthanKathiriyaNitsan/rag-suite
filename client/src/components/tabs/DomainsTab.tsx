import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Plus, 
  Trash2, 
  Globe, 
  Copy, 
  AlertTriangle,
  ExternalLink,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationDomain {
  id: string;
  origin: string;
  cspHelper: string;
  addedAt: Date;
}

interface DomainsTabProps {
  data: {
    domains: IntegrationDomain[];
  };
  onChange: (data: any) => void;
}

const DOMAIN_EXAMPLES = [
  "https://example.com",
  "https://app.example.com", 
  "https://docs.example.com",
  "http://localhost:3000",
  "https://*.example.com", // Wildcard subdomain
];

export default function DomainsTab({ data, onChange }: DomainsTabProps) {
  const [domains, setDomains] = useState<IntegrationDomain[]>(data.domains || []);
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const { toast } = useToast();

  // Update parent state when domains change
  useEffect(() => {
    onChange({ domains });
  }, [domains, onChange]);

  const validateDomain = (domain: string): string | null => {
    if (!domain.trim()) {
      return "Domain is required";
    }

    // Check if it's a valid URL or wildcard domain
    const domainPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)*|\*\.[\w-]+(\.[\w-]+)*)(:\d+)?(\/.*)?$/;
    if (!domainPattern.test(domain)) {
      return "Please enter a valid domain (e.g., https://example.com)";
    }

    // Check for duplicates
    if (domains.some(d => d.origin === domain)) {
      return "This domain is already in the allowlist";
    }

    return null;
  };

  const handleAddDomain = () => {
    const error = validateDomain(newDomain);
    if (error) {
      setDomainError(error);
      return;
    }

    // Normalize domain format
    let normalizedDomain = newDomain.trim();
    if (!normalizedDomain.startsWith("http://") && !normalizedDomain.startsWith("https://")) {
      normalizedDomain = "https://" + normalizedDomain;
    }

    const newDomainObj: IntegrationDomain = {
      id: `domain-${Date.now()}`,
      origin: normalizedDomain,
      cspHelper: normalizedDomain,
      addedAt: new Date(),
    };

    const updatedDomains = [...domains, newDomainObj];
    setDomains(updatedDomains);
    onChange({ domains: updatedDomains });
    
    setNewDomain("");
    setDomainError("");
    setAddDomainOpen(false);
    
    toast({
      title: "Domain Added",
      description: `${normalizedDomain} has been added to the allowlist`,
    });
  };

  const handleRemoveDomain = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    const updatedDomains = domains.filter(d => d.id !== domainId);
    setDomains(updatedDomains);
    onChange({ domains: updatedDomains });
    
    toast({
      title: "Domain Removed",
      description: `${domain?.origin} has been removed from the allowlist`,
    });
  };

  const handleCopyCSP = (cspHelper: string) => {
    navigator.clipboard.writeText(cspHelper);
    toast({
      title: "Copied!",
      description: "CSP directive copied to clipboard",
    });
  };

  const handleExampleClick = (example: string) => {
    setNewDomain(example);
    setDomainError("");
  };

  return (
    <div className="space-y-6">
      {/* Domain Allowlist Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Allowlist
            </CardTitle>
            <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-domain">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Domain to Allowlist</DialogTitle>
                  <DialogDescription>
                    Add a domain where your widget will be allowed to load
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain-input">Domain or Origin *</Label>
                    <Input
                      id="domain-input"
                      value={newDomain}
                      onChange={(e) => {
                        setNewDomain(e.target.value);
                        setDomainError("");
                      }}
                      placeholder="https://example.com"
                      data-testid="input-domain"
                    />
                    {domainError && (
                      <p className="text-sm text-red-600">{domainError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Examples</Label>
                    <div className="flex flex-wrap gap-2">
                      {DOMAIN_EXAMPLES.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExampleClick(example)}
                          data-testid={`button-example-${index}`}
                          className="text-xs"
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Only domains in this allowlist will be able to load your widget. 
                      Use wildcards (*.example.com) for subdomains.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddDomainOpen(false);
                      setNewDomain("");
                      setDomainError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDomain}
                    disabled={!newDomain.trim()}
                    data-testid="button-confirm-add-domain"
                  >
                    Add Domain
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Warning:</strong> No domains configured. Your widget will not load on any website. 
                Add at least one domain to enable your integration.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>CSP Helper</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id} data-testid={`row-domain-${domain.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {domain.origin}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => window.open(domain.origin, '_blank')}
                          data-testid={`button-visit-${domain.id}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">
                          {domain.cspHelper}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCSP(domain.cspHelper)}
                          data-testid={`button-copy-csp-${domain.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                        Math.floor((domain.addedAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                        "day"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDomain(domain.id)}
                        data-testid={`button-remove-${domain.id}`}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & CSP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Content Security Policy (CSP)</h4>
            <p className="text-sm text-muted-foreground">
              If your website uses CSP headers, add these directives to allow the widget to function:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                {`script-src 'self' https://cdn.ragsuite.com;\n`}
                {`connect-src 'self' https://api.ragsuite.com;\n`}
                {`frame-src 'self' https://widget.ragsuite.com;`}
              </code>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Wildcard Domains</h4>
            <p className="text-sm text-muted-foreground">
              Use <code>*.example.com</code> to allow all subdomains of example.com. 
              This includes app.example.com, docs.example.com, etc.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Local Development</h4>
            <p className="text-sm text-muted-foreground">
              Add <code>http://localhost:3000</code> or your local development URL 
              to test the widget during development.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
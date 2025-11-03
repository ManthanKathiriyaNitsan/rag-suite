import React, { useState, useMemo, useCallback, Suspense, lazy } from "react";
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/contexts/I18nContext";
import { GlassCard } from "@/components/ui/GlassCard";

// 🚀 Lazy load heavy form components
const CreateApiKeyForm = lazy(() => import("@/components/forms/CreateApiKeyForm"));

const ApiKeys = React.memo(function ApiKeys() {
  // 📝 Memoized API keys data
  const apiKeys = useMemo(() => [
    {
      id: "key-001",
      name: "Production API Key",
      key: "rgs_live_1234567890abcdef",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      requests: 15420,
      rateLimit: 1000,
    },
    {
      id: "key-002",
      name: "Development API Key",
      key: "rgs_test_abcdef1234567890",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 5 * 60 * 1000),
      requests: 2847,
      rateLimit: 100,
    },
  ], []);

  const { locale, t } = useI18n();
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
  const { toast } = useToast();

  const handleCreateApiKey = useCallback((data: { name: string; rateLimit: number }) => {
    // Handle API key creation logic here
    toast({
      title: "API Key Created",
      description: `New API key "${data.name}" has been created successfully.`,
    });
    setShowCreateKeyForm(false);
  }, [toast]);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key has been copied to clipboard.",
    });
  }, [toast]);

  const handleRevokeApiKey = useCallback((id: string) => {
    // Handle API key revocation logic here
    toast({
      title: "API Key Revoked",
      description: "The API key has been revoked successfully.",
      variant: "destructive",
    });
  }, [toast]);

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '93vw' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-6 w-6 sm:h-7 sm:w-7" />
              {t('api-keys.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your API keys and access tokens
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowCreateKeyForm(true)}
              data-testid="button-create-api-key"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('api-keys.create')}
            </Button>
          </div>
        </div>

        {/* API Keys Content */}
        <GlassCard>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="space-y-3 p-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4 space-y-3" data-testid={`row-api-key-${key.id}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{key.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeApiKey(key.id)}
                        data-testid={`button-revoke-key-${key.id}`}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">API Key</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs bg-card px-2 py-1 rounded flex-1 break-all">
                            {showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                            data-testid={`button-toggle-key-${key.id}`}
                            className="h-6 w-6 p-0"
                          >
                            {showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey(key.key)}
                            data-testid={`button-copy-key-${key.id}`}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-muted-foreground">Created</label>
                          <p className="mt-1">{key.createdAt.toLocaleDateString(locale)}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Last Used</label>
                          <p className="mt-1">
                            {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                              Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),
                              "minute"
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Requests</label>
                          <p className="mt-1">{key.requests.toLocaleString(locale)}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Rate Limit</label>
                          <p className="mt-1">{key.rateLimit}/hour</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('api-keys.name')}</TableHead>
                      <TableHead>{t('api-keys.key')}</TableHead>
                      <TableHead>{t('api-keys.created')}</TableHead>
                      <TableHead>{t('api-keys.lastUsed')}</TableHead>
                      <TableHead>{t('api-keys.requests')}</TableHead>
                      <TableHead>{t('api-keys.rateLimit')}</TableHead>
                      <TableHead className="text-center">{t('api-keys.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-card px-2 py-1 rounded flex-1 break-all">
                              {showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                                data-testid={`button-toggle-key-${key.id}`}
                                className="h-6 w-6 p-0"
                              >
                                {showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(key.key)}
                                data-testid={`button-copy-key-${key.id}`}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {key.createdAt.toLocaleDateString(locale)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                            Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),
                            "minute"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{key.requests.toLocaleString(locale)}</TableCell>
                        <TableCell className="text-sm">{key.rateLimit}/hour</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeApiKey(key.id)}
                            data-testid={`button-revoke-key-${key.id}`}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Create API Key Form */}
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
          <CreateApiKeyForm
            open={showCreateKeyForm}
            onOpenChange={setShowCreateKeyForm}
            onSubmit={handleCreateApiKey}
          />
        </Suspense>
      </div>
    </div>
  );
});

export default ApiKeys;


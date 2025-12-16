import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";

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

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogHeader,

  DialogTitle,

  DialogFooter,

} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { AlertCircle } from "lucide-react";

import { useI18n } from "@/contexts/I18nContext";

import { GlassCard } from "@/components/ui/GlassCard";

import { apiKeysAPI, type ApiKey } from "@/services/api/api";



// 🚀 Lazy load heavy form components

const CreateApiKeyForm = lazy(() => import("@/components/forms/CreateApiKeyForm"));



const ApiKeys = React.memo(function ApiKeys() {

  const [apiKeys, setApiKeys] = useState<Array<{

    id: string;

    name: string;

    key: string;

    keyPreview?: string;

    createdAt: Date;

    lastUsed: Date | null;

    requests: number;

    rateLimit: number;

    environment?: string;

  }>>([]);

  const [loading, setLoading] = useState(false);



  const { locale, t } = useI18n();

  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);

  const [createdApiKey, setCreatedApiKey] = useState<{

    name: string;

    key: string;

    environment: string;

    rateLimit: number;

  } | null>(null);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { toast } = useToast();



  const handleCreateApiKey = useCallback(async (formData: any) => {

    console.log('🔑 ApiKeys component - handleCreateApiKey called with:', formData);

    

    // Check if formData is already an ApiKey (from form) or if we need to call the API

    if (formData && formData.id && formData.key) {

      // It's already a created ApiKey object, just add it to state

      console.log('🔑 ApiKeys component - Received created API key, adding to state');

      // Safely parse createdAt date

      let createdAt: Date;

      try {

        createdAt = formData.createdAt ? new Date(formData.createdAt) : new Date();

        if (isNaN(createdAt.getTime())) {

          createdAt = new Date();

        }

      } catch {

        createdAt = new Date();

      }

      

      // Safely parse lastUsed date

      let lastUsed: Date | null = null;

      if (formData.lastUsedAt) {

        try {

          const parsed = new Date(formData.lastUsedAt);

          if (!isNaN(parsed.getTime())) {

            lastUsed = parsed;

          }

        } catch {

          // Keep as null if parsing fails

        }

      }

      

      setApiKeys((prev) => [

        ...prev,

        {

          id: formData.id,

          name: formData.name ?? '',

          key: formData.key ?? '',

          keyPreview: formData.keyPreview ?? '',

          createdAt,

          lastUsed,

          requests: typeof formData.requestCount === 'number' ? formData.requestCount : 0,

          rateLimit: typeof formData.rateLimit === 'number' ? formData.rateLimit : 0,

          environment: formData.environment ?? 'Development',

        },

      ]);

      setCreatedApiKey({

        name: formData.name ?? '',

        key: formData.key ?? '',

        environment: formData.environment ?? 'Development',

        rateLimit: typeof formData.rateLimit === 'number' ? formData.rateLimit : 100,

      });

      setShowSuccessDialog(true);

      setShowCreateKeyForm(false);

    } else {

      // It's form data, we need to call the API

      console.log('🔑 ApiKeys component - Received form data, calling API');

      console.log('🔑 ApiKeys component - Form data:', formData);

      

      try {

        // Transform form data to API payload format

        // Ensure values match backend enum requirements exactly

        let environment = formData.environment || 'Development';

        // Normalize environment

        if (environment) {

          const envLower = environment.toLowerCase();

          if (envLower === 'production' || envLower === 'prod') {

            environment = 'Production';

          } else if (envLower === 'staging' || envLower === 'stage') {

            environment = 'Staging';

          } else if (envLower === 'development' || envLower === 'dev') {

            environment = 'Development';

          }

        }

        

        let expiration = formData.expiration || "Never expires";

        // Normalize expiration

        if (expiration) {

          const expLower = expiration.toLowerCase();

          if (expLower.includes('never') || expLower === 'never expires') {

            expiration = "Never expires";

          } else if (expLower.includes('30') || expLower === '30 days') {

            expiration = "30 days";

          } else if (expLower.includes('90') || expLower === '90 days') {

            expiration = "90 days";

          } else if (expLower.includes('1') && (expLower.includes('year') || expLower.includes('365'))) {

            expiration = "1 year";

          }

        }

        

        const payload = {

          name: (formData.name || '').trim(),

          description: formData.description ? formData.description.trim() : undefined,

          environment: environment,

          rate_limit: typeof formData.rate_limit === 'number' ? formData.rate_limit : (typeof formData.rateLimit === 'number' ? formData.rateLimit : 100),

          expiration: expiration,

        };

        

        console.log('🔑 ApiKeys component - Normalized payload:', payload);

        

        console.log('🔑 ApiKeys component - Calling apiKeysAPI.create with payload:', payload);

        const created = await apiKeysAPI.create(payload);

        console.log('✅ ApiKeys component - API key created successfully:', created);

        

        // Safely parse createdAt date

        let createdAt: Date;

        try {

          createdAt = created.createdAt ? new Date(created.createdAt) : new Date();

          if (isNaN(createdAt.getTime())) {

            createdAt = new Date();

          }

        } catch {

          createdAt = new Date();

        }

        

        // Safely parse lastUsed date

        let lastUsed: Date | null = null;

        if (created.lastUsedAt) {

          try {

            const parsed = new Date(created.lastUsedAt);

            if (!isNaN(parsed.getTime())) {

              lastUsed = parsed;

            }

          } catch {

            // Keep as null if parsing fails

          }

        }

        

        setApiKeys((prev) => [

          ...prev,

          {

            id: created.id,

            name: created.name ?? '',

            key: created.key ?? '',

            keyPreview: created.keyPreview ?? '',

            createdAt,

            lastUsed,

            requests: typeof created.requestCount === 'number' ? created.requestCount : 0,

            rateLimit: typeof created.rateLimit === 'number' ? created.rateLimit : 0,

            environment: created.environment ?? 'Development',

          },

        ]);

        setCreatedApiKey({

          name: created.name ?? '',

          key: created.key ?? '',

          environment: created.environment ?? 'Development',

          rateLimit: typeof created.rateLimit === 'number' ? created.rateLimit : 100,

        });

        setShowSuccessDialog(true);

        setShowCreateKeyForm(false);

      } catch (error: any) {

        console.error('❌ ApiKeys component - Failed to create API key:', error);

        

        // Log detailed validation errors

        if (error.response?.data?.detail) {

          const detail = error.response.data.detail;

          console.error('❌ ApiKeys component - Validation errors:', detail);

          

          // Handle Pydantic validation errors (array format)

          if (Array.isArray(detail)) {

            const errorMessages = detail.map((err: any) => {

              const loc = err.loc ? err.loc.join('.') : 'unknown';

              return `${loc}: ${err.msg || err.message || 'Invalid value'}`;

            }).join(', ');

            

            toast({

              title: "Validation Error",

              description: `Please check the form: ${errorMessages}`,

              variant: "destructive",

            });

          } else if (typeof detail === 'string') {

            // Single error message

            toast({

              title: "Failed to Create API Key",

              description: detail,

              variant: "destructive",

            });

          } else if (typeof detail === 'object') {

            // Object with field errors

            const errorMessages = Object.entries(detail)

              .map(([field, message]) => `${field}: ${message}`)

              .join(', ');

            

            toast({

              title: "Validation Error",

              description: errorMessages,

              variant: "destructive",

            });

          } else {

            toast({

              title: "Failed to Create API Key",

              description: error.message || "An error occurred while creating the API key.",

              variant: "destructive",

            });

          }

        } else {

          toast({

            title: "Failed to Create API Key",

            description: error.message || "An error occurred while creating the API key.",

            variant: "destructive",

          });

        }

      }

    }

  }, [toast]);



  const handleCopyKey = useCallback((key: string, keyId: string, isRevealed: boolean) => {

    // Only copy if key exists and is revealed

    if (!key || key.length === 0) {

      toast({

        title: "Cannot copy",

        description: "Please reveal the key first.",

        variant: "destructive",

      });

      return;

    }

    if (!isRevealed) {

      toast({

        title: "Cannot copy",

        description: "Please reveal the key first.",

        variant: "destructive",

      });

      return;

    }

    navigator.clipboard.writeText(key);

    toast({

      title: "Copied",

      description: "API key has been copied to clipboard.",

    });

  }, [toast]);



  const handleCloseSuccessDialog = useCallback(() => {

    setShowSuccessDialog(false);

    setCreatedApiKey(null);

  }, []);



  const handleCopyCreatedKey = useCallback(() => {

    if (createdApiKey) {

      navigator.clipboard.writeText(createdApiKey.key);

      toast({

        title: "Copied",

        description: "API key has been copied to clipboard.",

      });

    }

  }, [createdApiKey, toast]);



  const handleToggleKey = useCallback(async (id: string) => {

    const current = apiKeys.find(k => k.id === id);

    if (!current) return;

    // If key is already fetched, toggle visibility

    if (current.key && current.key.length > 0) {

      setShowApiKey(prev => {

        // If currently showing this key, hide it

        if (prev === id) {

          return null;

        }

        // Otherwise, show it

        return id;

      });

      return;

    }

    // If key is not fetched, fetch it first

    try {

      const fetched = await apiKeysAPI.get(id);

      // Backend returns key_preview which contains the full key

      const fullKey = fetched.keyPreview ?? fetched.key ?? '';

      setApiKeys(prev => prev.map(k => k.id === id ? {

        ...k,

        key: fullKey,

        keyPreview: fetched.keyPreview,

        requests: fetched.requestCount,

        rateLimit: fetched.rateLimit,

        environment: fetched.environment,

      } : k));

      setShowApiKey(id);

    } catch (_err) {

      toast({

        title: "Cannot reveal key",

        description: "This API key cannot be viewed again.",

        variant: "destructive",

      });

    }

  }, [apiKeys, toast]);



  const handleRevokeApiKey = useCallback(async (id: string) => {

    await apiKeysAPI.delete(id);

    setApiKeys((prev) => prev.filter((k) => k.id !== id));

    toast({

      title: "API Key Revoked",

      description: "The API key has been revoked successfully.",

      variant: "destructive",

    });

  }, [toast]);



  useEffect(() => {

    let isMounted = true;

    console.log('🔑 ApiKeys component - useEffect triggered, fetching API keys list');

    setLoading(true);

    

    apiKeysAPI.list()

      .then((list) => {

        console.log('✅ ApiKeys component - List received:', list);

        if (!isMounted) {

          console.log('⚠️ ApiKeys component - Component unmounted, ignoring response');

          return;

        }

        const mapped = list.map((item) => {

          // Safely parse createdAt date

          let createdAt: Date;

          try {

            createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

            // Validate the date is not invalid

            if (isNaN(createdAt.getTime())) {

              createdAt = new Date();

            }

          } catch {

            createdAt = new Date();

          }

          

          // Safely parse lastUsed date

          let lastUsed: Date | null = null;

          if (item.lastUsedAt) {

            try {

              const parsed = new Date(item.lastUsedAt);

              if (!isNaN(parsed.getTime())) {

                lastUsed = parsed;

              }

            } catch {

              // Keep as null if parsing fails

            }

          }

          

          // Truncate key_preview to 20 characters + "..."

          const preview = item.keyPreview ?? '';

          const truncatedPreview = preview.length > 20 ? preview.slice(0, 20) + '...' : preview;

          

          return {

            id: item.id,

            name: item.name ?? '',

            key: '', // NEVER set key from list response - always empty

            keyPreview: truncatedPreview,

            createdAt,

            lastUsed,

            requests: typeof item.requestCount === 'number' ? item.requestCount : 0,

            rateLimit: typeof item.rateLimit === 'number' ? item.rateLimit : 0,

            environment: item.environment ?? 'Development',

          };

        });

        console.log('✅ ApiKeys component - Mapped API keys:', mapped);

        setApiKeys(mapped);

      })

      .catch((error) => {

        console.error('❌ ApiKeys component - Failed to fetch API keys list:', error);

        console.error('❌ ApiKeys component - Error details:', {

          message: error.message,

          response: error.response?.data,

          status: error.response?.status,

        });

        toast({

          title: "Failed to Load API Keys",

          description: error.response?.data?.detail || error.message || "An error occurred while loading API keys.",

          variant: "destructive",

        });

      })

      .finally(() => {

        console.log('🔑 ApiKeys component - Loading complete');

        setLoading(false);

      });

    return () => {

      console.log('🔑 ApiKeys component - Cleanup: component unmounting');

      isMounted = false;

    };

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

            {loading ? (

              <div className="p-6 flex items-center justify-center">

                <Loader2 className="h-6 w-6 animate-spin" />

              </div>

            ) : apiKeys.length === 0 ? (

              <div className="text-center py-12">

                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">

                  <Key className="h-6 w-6 text-muted-foreground" />

                </div>

                <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>

                <p className="text-muted-foreground mb-4">Create your first API key to start using the API.</p>

                <Button onClick={() => setShowCreateKeyForm(true)} data-testid="button-empty-create-key">

                  <Plus className="h-4 w-4 mr-2" />

                  Create API Key

                </Button>

              </div>

            ) : (

              <>

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

                                {key.key && key.key.length > 0

                                  ? (showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`)

                                  : (key.keyPreview || 'Hidden')}

                              </span>

                              <Button

                                variant="ghost"

                                size="sm"

                                onClick={() => handleToggleKey(key.id)}

                                data-testid={`button-toggle-key-${key.id}`}

                                className="h-6 w-6 p-0"

                              >

                                {key.key && key.key.length > 0

                                  ? (showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />)

                                  : <Eye className="h-3 w-3 opacity-40" />}

                              </Button>

                              <Button

                                variant="ghost"

                                size="sm"

                                onClick={() => handleCopyKey(key.key, key.id, showApiKey === key.id)}

                                data-testid={`button-copy-key-${key.id}`}

                                className="h-6 w-6 p-0"

                                disabled={!key.key || key.key.length === 0 || showApiKey !== key.id}

                              >

                                <Copy className={`h-3 w-3 ${showApiKey === key.id ? '' : 'opacity-40'}`} />

                              </Button>

                            </div>

                          </div>

                          

                          <div className="grid grid-cols-2 gap-3 text-xs">

                            <div>

                              <label className="text-muted-foreground">Created</label>

                              <p className="mt-1">

                                {key.createdAt && !isNaN(key.createdAt.getTime()) 

                                  ? key.createdAt.toLocaleDateString(locale) 

                                  : "–"}

                              </p>

                            </div>

                            <div>

                              <label className="text-muted-foreground">Last Used</label>

                              <p className="mt-1">

                                {key.lastUsed && !isNaN(key.lastUsed.getTime()) 

                                  ? new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(

                                      Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),

                                      "minute"

                                    )

                                  : "–"}

                              </p>

                            </div>

                            <div>

                              <label className="text-muted-foreground">Requests</label>

                              <p className="mt-1">

                                {typeof key.requests === 'number' 

                                  ? key.requests.toLocaleString(locale) 

                                  : "0"}

                              </p>

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

                                  {key.key && key.key.length > 0

                                    ? (showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`)

                                    : (key.keyPreview || 'Hidden')}

                                </span>

                                <div className="flex gap-1">

                                  <Button

                                    variant="ghost"

                                    size="sm"

                                    onClick={() => handleToggleKey(key.id)}

                                    data-testid={`button-toggle-key-${key.id}`}

                                    className="h-6 w-6 p-0"

                                  >

                                    {key.key && key.key.length > 0

                                      ? (showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />)

                                      : <Eye className="h-3 w-3 " />}

                                  </Button>

                                  <Button

                                    variant="ghost"

                                    size="sm"

                                    onClick={() => handleCopyKey(key.key, key.id, showApiKey === key.id)}

                                    data-testid={`button-copy-key-${key.id}`}

                                    className="h-6 w-6 p-0"

                                    disabled={!key.key || key.key.length === 0 || showApiKey !== key.id}

                                  >

                                    <Copy className={`h-3 w-3 ${showApiKey === key.id ? '' : 'opacity-40'}`} />

                                  </Button>

                                </div>

                              </div>

                            </TableCell>

                            <TableCell className="text-sm text-muted-foreground">

                              {key.createdAt && !isNaN(key.createdAt.getTime()) 

                                ? key.createdAt.toLocaleDateString(locale) 

                                : "–"}

                            </TableCell>

                            <TableCell className="text-sm text-muted-foreground">

                              {key.lastUsed && !isNaN(key.lastUsed.getTime()) 

                                ? new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(

                                    Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),

                                    "minute"

                                  )

                                : "–"}

                            </TableCell>

                            <TableCell className="text-sm">

                              {typeof key.requests === 'number' 

                                ? key.requests.toLocaleString(locale) 

                                : "0"}

                            </TableCell>

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

              </>

            )}

          </CardContent>

        </GlassCard>



        {/* Success Dialog */}

        <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>

          <DialogContent className="max-w-md">

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



              {createdApiKey && (

                <>

                  <div>

                    <Label>API Key</Label>

                    <div className="mt-1 flex items-center gap-2">

                      <Input

                        value={createdApiKey.key}

                        readOnly

                        className="font-mono text-sm"

                      />

                      <Button

                        variant="outline"

                        size="sm"

                        onClick={handleCopyCreatedKey}

                      >

                        <Copy className="h-4 w-4" />

                      </Button>

                    </div>

                  </div>



                  <div className="text-sm text-muted-foreground">

                    <p><strong>Name:</strong> {createdApiKey.name}</p>

                    <p><strong>Environment:</strong> {createdApiKey.environment}</p>

                    <p><strong>Rate Limit:</strong> {createdApiKey.rateLimit} requests/hour</p>

                  </div>

                </>

              )}

            </div>



            <DialogFooter>

              <Button 

                onClick={handleCloseSuccessDialog} 

                className="sm:min-w-[140px]"

              >

                Done

              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>



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
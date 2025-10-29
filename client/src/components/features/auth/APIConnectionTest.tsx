import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { testAPIConnection } from '@/services/api/api';

export function APIConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAPIConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Test if the API server is reachable
          </div>
        </div>

        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={testResult.success ? 'default' : 'destructive'}>
                {testResult.success ? 'Connected' : 'Failed'}
              </Badge>
            </div>
            <AlertDescription className="mt-2">
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Troubleshooting Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Check if your API server is running on port 8000</li>
            <li>Verify the IP address (192.168.0.117) is correct</li>
            <li>Ensure the server is accessible from your machine</li>
            <li>Check firewall settings</li>
            <li>Try accessing the API directly in your browser</li>
          </ol>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Quick Tests:</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('http://192.168.0.117:8000/api/v1/health', '_blank')}
              >
                Test Health Endpoint
              </Button>
              <span className="text-muted-foreground">Open in browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('http://192.168.0.117:8000/api/v1/documents', '_blank')}
              >
                Test Documents Endpoint
              </Button>
              <span className="text-muted-foreground">Open in browser</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

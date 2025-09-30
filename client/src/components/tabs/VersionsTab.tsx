import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Plus, 
  GitBranch, 
  Tag,
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Eye,
  RotateCcw,
  Play,
  Pause,
  Upload,
  Download,
  FileText,
  User,
  Calendar,
  Code,
  Settings,
  Shield,
  Activity,
  Zap,
  Globe,
  ChevronRight,
  ChevronDown,
  Diff,
  Archive,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: "added" | "modified" | "removed";
}

interface Version {
  id: string;
  version: string;
  status: "draft" | "published" | "archived";
  publishedAt: Date | null;
  createdAt: Date;
  createdBy: string;
  releaseNotes: string;
  tags: string[];
  changes: VersionChange[];
  config: any; // Full configuration snapshot
  
  // Publishing metadata
  approvedBy?: string;
  approvedAt?: Date;
  rollbackReason?: string;
  isRollback?: boolean;
  rollbackFromVersion?: string;
}

interface ApprovalWorkflow {
  enabled: boolean;
  requiredApprovers: number;
  approvers: string[];
  autoPublishOnApproval: boolean;
}

interface VersionsData {
  versions: Version[];
  currentVersion: string;
  draftVersion: string | null;
  approvalWorkflow: ApprovalWorkflow;
  retentionDays: number;
  autoVersioning: boolean;
}

interface VersionsTabProps {
  data: VersionsData;
  onChange: (data: VersionsData) => void;
}

export default function VersionsTab({ data, onChange }: VersionsTabProps) {
  const [versions, setVersions] = useState<VersionsData>(data);
  const [activeTab, setActiveTab] = useState("history");
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null); // For diff
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<string>("");
  const [newVersionData, setNewVersionData] = useState({
    releaseNotes: "",
    tags: [] as string[],
    newTag: ""
  });
  const { toast } = useToast();

  // Sync local state when parent data changes (for edit mode)
  useEffect(() => {
    setVersions(data);
  }, [data]);

  // Update parent state when versions change
  useEffect(() => {
    onChange(versions);
  }, [versions, onChange]);

  const updateVersions = (updates: Partial<VersionsData>) => {
    setVersions(prev => ({ ...prev, ...updates }));
  };

  const createVersion = () => {
    const newVersion: Version = {
      id: `version-${Date.now()}`,
      version: `v1.${versions.versions.length + 1}.0`,
      status: "draft",
      publishedAt: null,
      createdAt: new Date(),
      createdBy: "current-user", // Should come from auth context
      releaseNotes: newVersionData.releaseNotes,
      tags: newVersionData.tags,
      changes: [], // Should be populated based on current changes
      config: {}, // Should contain current configuration snapshot
    };

    setVersions(prev => ({
      ...prev,
      versions: [newVersion, ...prev.versions],
      draftVersion: newVersion.id
    }));

    setNewVersionData({
      releaseNotes: "",
      tags: [],
      newTag: ""
    });
    setShowCreateDialog(false);

    toast({
      title: "Version created",
      description: `${newVersion.version} has been created as a draft`,
    });
  };

  const publishVersion = (versionId: string) => {
    const version = versions.versions.find(v => v.id === versionId);
    if (!version) return;

    if (versions.approvalWorkflow.enabled && !version.approvedBy) {
      toast({
        title: "Approval required",
        description: "This version needs approval before publishing",
        variant: "destructive",
      });
      return;
    }

    setVersions(prev => ({
      ...prev,
      versions: prev.versions.map(v =>
        v.id === versionId ? {
          ...v,
          status: "published" as const,
          publishedAt: new Date()
        } : 
        v.status === "published" ? { ...v, status: "archived" as const } : v
      ),
      currentVersion: versionId,
      draftVersion: prev.draftVersion === versionId ? null : prev.draftVersion
    }));

    toast({
      title: "Version published",
      description: `${version.version} is now live`,
    });
  };

  const rollbackToVersion = () => {
    const version = versions.versions.find(v => v.id === rollbackVersion);
    if (!version) return;

    const rollbackVersionObj: Version = {
      id: `rollback-${Date.now()}`,
      version: `v1.${versions.versions.length + 1}.0`,
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      createdBy: "current-user",
      releaseNotes: `Rollback to ${version.version}`,
      tags: ["rollback"],
      changes: [],
      config: version.config,
      isRollback: true,
      rollbackFromVersion: version.id,
      rollbackReason: "Emergency rollback"
    };

    setVersions(prev => ({
      ...prev,
      versions: [rollbackVersionObj, ...prev.versions.map(v => 
        v.status === "published" ? { ...v, status: "archived" as const } : v
      )],
      currentVersion: rollbackVersionObj.id
    }));

    setShowRollbackDialog(false);
    setRollbackVersion("");

    toast({
      title: "Rollback completed",
      description: `Successfully rolled back to ${version.version}`,
    });
  };

  const approveVersion = (versionId: string) => {
    setVersions(prev => ({
      ...prev,
      versions: prev.versions.map(v =>
        v.id === versionId ? {
          ...v,
          approvedBy: "current-user",
          approvedAt: new Date()
        } : v
      )
    }));

    const version = versions.versions.find(v => v.id === versionId);
    
    // Auto-publish if enabled
    if (versions.approvalWorkflow.autoPublishOnApproval) {
      setTimeout(() => publishVersion(versionId), 1000);
    }

    toast({
      title: "Version approved",
      description: `${version?.version} has been approved`,
    });
  };

  const toggleVersionExpansion = (versionId: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  const selectVersionForDiff = (versionId: string) => {
    if (!selectedVersions) {
      setSelectedVersions([versionId, ""]);
    } else if (selectedVersions[1] === "") {
      setSelectedVersions([selectedVersions[0], versionId]);
    } else {
      setSelectedVersions([versionId, ""]);
    }
  };

  const getVersionStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-500";
      case "draft":
        return "text-yellow-500";
      case "archived":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const addTag = () => {
    if (newVersionData.newTag.trim() && !newVersionData.tags.includes(newVersionData.newTag.trim())) {
      setNewVersionData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ""
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewVersionData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const formatChangeValue = (value: any) => {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getCurrentVersion = () => {
    return versions.versions.find(v => v.id === versions.currentVersion);
  };

  const getDraftVersion = () => {
    return versions.draftVersion ? versions.versions.find(v => v.id === versions.draftVersion) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row  gap-3 lg:gap-0 lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Version History & Diff</h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-version">
                <Plus className="h-4 w-4 mr-2" />
                Create Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="release-notes">Release Notes</Label>
                  <Textarea
                    id="release-notes"
                    placeholder="Describe what changed in this version..."
                    value={newVersionData.releaseNotes}
                    onChange={(e) => setNewVersionData(prev => ({ ...prev, releaseNotes: e.target.value }))}
                    className="h-24"
                    data-testid="textarea-release-notes"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newVersionData.newTag}
                      onChange={(e) => setNewVersionData(prev => ({ ...prev, newTag: e.target.value }))}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      data-testid="input-new-tag"
                    />
                    <Button onClick={addTag} variant="outline" data-testid="button-add-tag">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newVersionData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createVersion} data-testid="button-save-version">
                    Create Version
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-rollback">
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rollback to Previous Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rollback-version">Select Version</Label>
                  <Select value={rollbackVersion} onValueChange={setRollbackVersion}>
                    <SelectTrigger id="rollback-version" data-testid="select-rollback-version">
                      <SelectValue placeholder="Choose version to rollback to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.versions
                        .filter(v => v.status === "archived" || (v.status === "published" && v.id !== versions.currentVersion))
                        .map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.version} - {version.createdAt.toLocaleDateString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Rolling back will create a new version with the selected configuration and immediately publish it.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={rollbackToVersion}
                    disabled={!rollbackVersion}
                    variant="destructive"
                    data-testid="button-confirm-rollback"
                  >
                    Rollback
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Version Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Live Version</Label>
              <div className="flex items-center gap-2">
                {getVersionStatusIcon("published")}
                <span className="font-medium">{getCurrentVersion()?.version || "None"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getCurrentVersion()?.publishedAt?.toLocaleString() || "Never published"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Draft Version</Label>
              <div className="flex items-center gap-2">
                {getDraftVersion() ? getVersionStatusIcon("draft") : <Clock className="h-4 w-4 text-gray-400" />}
                <span className="font-medium">{getDraftVersion()?.version || "None"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getDraftVersion() ? "Ready for publishing" : "No draft available"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Versions</Label>
              <p className="text-2xl font-bold" data-testid="total-versions-count">
                {versions.versions.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {versions.versions.filter(v => v.status === "published").length} published, {" "}
                {versions.versions.filter(v => v.status === "draft").length} draft
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="diff" data-testid="tab-diff">
            <Diff className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-version-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {versions.versions.map((version, index) => (
              <Card 
                key={version.id} 
                className={`transition-all hover-elevate ${
                  version.id === versions.currentVersion ? "ring-2 ring-green-500" : ""
                } ${
                  selectedVersions?.includes(version.id) ? "ring-2 ring-blue-500" : ""
                }`}
                data-testid={`version-card-${version.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 lg:gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVersionExpansion(version.id)}
                        data-testid={`button-expand-${version.id}`}
                      >
                        {expandedVersions[version.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        {getVersionStatusIcon(version.status)}
                        <div>
                          <CardTitle className="text-lg">{version.version}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {version.createdAt.toLocaleDateString()} by {version.createdBy}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={version.status === "published" ? "default" : 
                                version.status === "draft" ? "secondary" : "outline"}
                        className={getVersionStatusColor(version.status)}
                      >
                        {version.status}
                      </Badge>
                      {version.id === versions.currentVersion && (
                        <Badge variant="outline" className="text-green-600">
                          Current
                        </Badge>
                      )}
                      {version.isRollback && (
                        <Badge variant="outline" className="text-orange-600">
                          Rollback
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Release Notes */}
                  {version.releaseNotes && (
                    <div>
                      <Label className="text-sm font-medium">Release Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">{version.releaseNotes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {version.tags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {version.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedVersions[version.id] && (
                    <div className="space-y-4 pt-4 border-t">
                      {/* Changes */}
                      {version.changes.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Changes ({version.changes.length})</Label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {version.changes.map((change, changeIndex) => (
                              <div 
                                key={changeIndex} 
                                className="text-sm p-2 bg-muted rounded border-l-4 border-blue-500"
                                data-testid={`change-${version.id}-${changeIndex}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {change.type}
                                  </Badge>
                                  <span className="font-medium">{change.field}</span>
                                </div>
                                {change.type !== "added" && (
                                  <div className="text-red-600 bg-red-50 p-1 rounded text-xs font-mono">
                                    - {formatChangeValue(change.oldValue)}
                                  </div>
                                )}
                                {change.type !== "removed" && (
                                  <div className="text-green-600 bg-green-50 p-1 rounded text-xs font-mono">
                                    + {formatChangeValue(change.newValue)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Approval Status */}
                      {versions.approvalWorkflow.enabled && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Approval Status</Label>
                          <div className="flex items-center gap-2">
                            {version.approvedBy ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Approved by {version.approvedBy} on {version.approvedAt?.toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Pending approval</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => selectVersionForDiff(version.id)}
                      data-testid={`button-select-diff-${version.id}`}
                    >
                      {selectedVersions?.includes(version.id) ? "Selected" : "Select for Diff"}
                    </Button>
                    
                    {version.status === "draft" && !version.approvedBy && versions.approvalWorkflow.enabled && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveVersion(version.id)}
                        data-testid={`button-approve-${version.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    
                    {version.status === "draft" && (!versions.approvalWorkflow.enabled || version.approvedBy) && (
                      <Button 
                        size="sm"
                        onClick={() => publishVersion(version.id)}
                        data-testid={`button-publish-${version.id}`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    )}

                    {version.status === "published" && version.id === versions.currentVersion && (
                      <Badge variant="default" className="px-2 py-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {versions.versions.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No versions found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first version to start tracking changes
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-version">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Version
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="diff" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Two Versions to Compare</Label>
              <Button
                variant="outline"
                onClick={() => setSelectedVersions(null)}
                disabled={!selectedVersions}
                data-testid="button-clear-selection"
              >
                Clear Selection
              </Button>
            </div>

            {selectedVersions && selectedVersions[1] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Diff className="h-5 w-5" />
                    Version Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-red-600">From Version</Label>
                      <p className="text-lg font-medium">
                        {versions.versions.find(v => v.id === selectedVersions[0])?.version}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-green-600">To Version</Label>
                      <p className="text-lg font-medium">
                        {versions.versions.find(v => v.id === selectedVersions[1])?.version}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Configuration Differences</Label>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        Detailed diff view would show configuration changes between selected versions
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm">
                          <div className="text-red-600 bg-red-50 p-2 rounded">
                            - Old configuration values
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-green-600 bg-green-50 p-2 rounded">
                            + New configuration values
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(!selectedVersions || !selectedVersions[1]) && (
              <Card className="text-center py-12">
                <CardContent>
                  <Diff className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select versions to compare</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose two versions from the history tab to see their differences
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Version Retention (days)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      value={versions.retentionDays}
                      onChange={(e) => updateVersions({ retentionDays: parseInt(e.target.value) || 90 })}
                      data-testid="input-retention-days"
                    />
                    <p className="text-sm text-muted-foreground">
                      Archived versions older than this will be automatically deleted
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-versioning">Auto Versioning</Label>
                      <p className="text-sm text-muted-foreground">Create versions automatically on publish</p>
                    </div>
                    <Switch
                      id="auto-versioning"
                      checked={versions.autoVersioning}
                      onCheckedChange={(checked) => updateVersions({ autoVersioning: checked })}
                      data-testid="switch-auto-versioning"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="approval-enabled">Enable Approval Workflow</Label>
                  <p className="text-sm text-muted-foreground">Require approval before publishing versions</p>
                </div>
                <Switch
                  id="approval-enabled"
                  checked={versions.approvalWorkflow.enabled}
                  onCheckedChange={(checked) => updateVersions({
                    approvalWorkflow: { ...versions.approvalWorkflow, enabled: checked }
                  })}
                  data-testid="switch-approval-enabled"
                />
              </div>

              {versions.approvalWorkflow.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="required-approvers">Required Approvers</Label>
                      <Input
                        id="required-approvers"
                        type="number"
                        min="1"
                        value={versions.approvalWorkflow.requiredApprovers}
                        onChange={(e) => updateVersions({
                          approvalWorkflow: {
                            ...versions.approvalWorkflow,
                            requiredApprovers: parseInt(e.target.value) || 1
                          }
                        })}
                        data-testid="input-required-approvers"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-publish">Auto-publish on Approval</Label>
                        <p className="text-sm text-muted-foreground">Publish automatically when approved</p>
                      </div>
                      <Switch
                        id="auto-publish"
                        checked={versions.approvalWorkflow.autoPublishOnApproval}
                        onCheckedChange={(checked) => updateVersions({
                          approvalWorkflow: {
                            ...versions.approvalWorkflow,
                            autoPublishOnApproval: checked
                          }
                        })}
                        data-testid="switch-auto-publish"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Approved Users</Label>
                    <div className="text-sm text-muted-foreground">
                      Current approvers: {versions.approvalWorkflow.approvers.length > 0 
                        ? versions.approvalWorkflow.approvers.join(", ")
                        : "No approvers configured"
                      }
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
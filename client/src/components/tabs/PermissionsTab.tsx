import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Shield, 
  Key, 
  UserPlus, 
  UserMinus, 
  Edit3, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// User and Permission interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "suspended";
  lastActive: Date;
  invitedAt?: Date;
  invitedBy?: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  color: string;
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
}

interface AccessRule {
  id: string;
  name: string;
  description: string;
  type: "ip_whitelist" | "domain_restriction" | "time_based" | "geo_restriction";
  enabled: boolean;
  configuration: Record<string, any>;
  appliesTo: string[]; // user IDs or role IDs
}

interface PermissionsData {
  users: User[];
  roles: Role[];
  permissionGroups: PermissionGroup[];
  accessRules: AccessRule[];
  settings: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
    maxFailedLogins: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expirationDays: number;
    };
    auditRetentionDays: number;
    autoSuspendInactiveUsers: boolean;
    inactiveUserDays: number;
  };
}

// Default permissions data with enterprise-grade examples
const defaultPermissionsData: PermissionsData = {
  users: [
    {
      id: "user-001",
      name: "John Doe",
      email: "john@company.com",
      role: "owner",
      status: "active",
      lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      permissions: ["*"], // All permissions
    },
    {
      id: "user-002", 
      name: "Jane Smith",
      email: "jane@company.com",
      role: "admin",
      status: "active",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      permissions: ["integration:read", "integration:write", "integration:admin", "users:read", "users:write"],
    },
    {
      id: "user-003",
      name: "Bob Wilson", 
      email: "bob@company.com",
      role: "editor",
      status: "active",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      permissions: ["integration:read", "integration:write", "analytics:read"],
    },
    {
      id: "user-004",
      name: "Alice Johnson",
      email: "alice@company.com", 
      role: "viewer",
      status: "pending",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      invitedBy: "john@company.com",
      permissions: ["integration:read", "analytics:read"],
    },
  ],
  roles: [
    {
      id: "role-owner",
      name: "Owner",
      description: "Full access to all features and settings",
      permissions: ["*"],
      isSystem: true,
      userCount: 1,
      color: "#DC2626",
    },
    {
      id: "role-admin",
      name: "Administrator", 
      description: "Manage integrations, users, and most settings",
      permissions: ["integration:*", "users:*", "analytics:*", "settings:read"],
      isSystem: true,
      userCount: 1,
      color: "#EA580C",
    },
    {
      id: "role-editor",
      name: "Editor",
      description: "Create and modify integrations, view analytics",
      permissions: ["integration:read", "integration:write", "analytics:read"],
      isSystem: true,
      userCount: 1,
      color: "#0284C7",
    },
    {
      id: "role-viewer",
      name: "Viewer",
      description: "Read-only access to integrations and analytics",
      permissions: ["integration:read", "analytics:read"],
      isSystem: true,
      userCount: 1,
      color: "#059669",
    },
  ],
  permissionGroups: [
    {
      id: "group-integration",
      name: "Integration Management",
      description: "Permissions for managing integrations",
      permissions: [
        {
          id: "integration:read",
          name: "View Integrations",
          description: "View integration configurations and settings",
          category: "integration",
          isSystem: true,
        },
        {
          id: "integration:write",
          name: "Edit Integrations", 
          description: "Create, update, and configure integrations",
          category: "integration",
          isSystem: true,
        },
        {
          id: "integration:delete",
          name: "Delete Integrations",
          description: "Delete integrations and their configurations",
          category: "integration",
          isSystem: true,
        },
        {
          id: "integration:admin",
          name: "Integration Admin",
          description: "Full administrative access to integrations",
          category: "integration",
          isSystem: true,
        },
      ],
    },
    {
      id: "group-users",
      name: "User Management",
      description: "Permissions for managing users and roles",
      permissions: [
        {
          id: "users:read",
          name: "View Users",
          description: "View user accounts and their information",
          category: "users",
          isSystem: true,
        },
        {
          id: "users:write",
          name: "Manage Users",
          description: "Invite, edit, and manage user accounts",
          category: "users", 
          isSystem: true,
        },
        {
          id: "users:delete",
          name: "Remove Users",
          description: "Remove user accounts and revoke access",
          category: "users",
          isSystem: true,
        },
      ],
    },
    {
      id: "group-analytics",
      name: "Analytics & Reporting",
      description: "Permissions for analytics and reporting features",
      permissions: [
        {
          id: "analytics:read",
          name: "View Analytics",
          description: "View analytics dashboards and reports",
          category: "analytics",
          isSystem: true,
        },
        {
          id: "analytics:export",
          name: "Export Analytics",
          description: "Export analytics data and generate reports",
          category: "analytics",
          isSystem: true,
        },
      ],
    },
  ],
  accessRules: [
    {
      id: "rule-001",
      name: "Office IP Whitelist",
      description: "Restrict access to office IP addresses",
      type: "ip_whitelist",
      enabled: true,
      configuration: {
        allowedIPs: ["192.168.1.0/24", "10.0.0.0/8"],
        blockByDefault: true,
      },
      appliesTo: ["role-admin", "role-owner"],
    },
    {
      id: "rule-002",
      name: "Company Domain Only",
      description: "Only allow users with company email domains",
      type: "domain_restriction",
      enabled: true,
      configuration: {
        allowedDomains: ["company.com", "subsidiary.com"],
        requireVerification: true,
      },
      appliesTo: ["*"],
    },
  ],
  settings: {
    requireTwoFactor: true,
    sessionTimeout: 480, // 8 hours in minutes
    maxFailedLogins: 5,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    auditRetentionDays: 365,
    autoSuspendInactiveUsers: true,
    inactiveUserDays: 90,
  },
};

interface PermissionsTabProps {
  data: PermissionsData;
  onChange: (data: PermissionsData) => void;
}

export default function PermissionsTab({ data, onChange }: PermissionsTabProps) {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Use data directly from props (controlled component pattern)
  
  const updatePermissions = (updates: Partial<PermissionsData>) => {
    onChange({ ...data, ...updates });
  };

  const inviteUser = (userData: { email: string; role: string; message?: string }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.email.split('@')[0],
      email: userData.email,
      role: userData.role as any,
      status: "pending",
      lastActive: new Date(),
      invitedAt: new Date(),
      invitedBy: "current-user",
      permissions: getRolePermissions(userData.role),
    };
    
    updatePermissions({
      users: [...data.users, newUser]
    });
    setShowInviteDialog(false);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const users = data.users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    updatePermissions({ users });
  };

  const removeUser = (userId: string) => {
    const users = data.users.filter(user => user.id !== userId);
    updatePermissions({ users });
  };

  const getRolePermissions = (roleId: string): string[] => {
    const role = data.roles.find(r => r.id === `role-${roleId}` || r.name.toLowerCase() === roleId);
    return role ? role.permissions : [];
  };

  const getRoleColor = (roleName: string) => {
    const role = data.roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    return role?.color || "#6B7280";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "suspended": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      default: return "secondary";
    }
  };

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 sm:px-0" style={{ maxWidth: '93vw' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Access Control & Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and access permissions for your integration
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} data-testid="button-invite-user" className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="users" data-testid="tab-users" className="text-sm">Users</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-roles" className="text-sm">Roles</TabsTrigger>
          <TabsTrigger value="access-rules" data-testid="tab-access-rules" className="text-sm">Access Rules</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-security-settings" className="text-sm">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage team members and their access levels
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full sm:w-64"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-32" data-testid="select-role-filter">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No users found matching your search</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row  justify-between gap-4 p-0 lg:p-4 border rounded-lg hover-elevate">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium break-words">{user.name}</h4>
                            {getStatusIcon(user.status)}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{user.email}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                borderColor: getRoleColor(user.role),
                                color: getRoleColor(user.role)
                              }}
                            >
                              {user.role}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex   flex-row items-center justify-between gap-2 w-full sm:w-auto">
                        <div className="text-left sm:text-right text-sm text-muted-foreground">
                          <p>Last active</p>
                          <p className="break-words">{user.lastActive.toLocaleDateString()}</p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-user-menu-${user.id}`} className="sm:w-auto">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedUser(user.id)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUser(user.id, { 
                                status: user.status === "suspended" ? "active" : "suspended" 
                              })}
                            >
                              {user.status === "suspended" ? (
                                <>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unsuspend
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Suspend
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => removeUser(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Roles</CardTitle>
              <CardDescription>
                Define and manage permission roles for different access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {data.roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-0 lg:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <h4 className="font-medium">{role.name}</h4>
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                      </div>
                      <Badge variant="outline">{role.userCount} users</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">PERMISSIONS</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission === "*" ? "All Permissions" : permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Groups</CardTitle>
              <CardDescription>
                Detailed permission breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.permissionGroups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-0 lg:p-4 space-y-3">
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-2 p-2 border rounded">
                          <Shield className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Rules</CardTitle>
              <CardDescription>
                Configure advanced access restrictions and security rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.accessRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-0 lg:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex  items-end lg:items-center gap-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => {
                          const accessRules = data.accessRules.map(r => 
                            r.id === rule.id ? { ...r, enabled } : r
                          );
                          updatePermissions({ accessRules });
                        }}
                        data-testid={`switch-rule-${rule.id}`}
                      />
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{rule.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applies to:</span>
                        <span>{rule.appliesTo.length} entities</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure global security policies and authentication requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Require Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Enforce 2FA for all users to enhance security
                  </p>
                </div>
                <Switch
                  checked={data.settings.requireTwoFactor}
                  onCheckedChange={(requireTwoFactor) => 
                    updatePermissions({
                      settings: { ...data.settings, requireTwoFactor }
                    })
                  }
                  data-testid="switch-require-2fa"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="15"
                    max="1440"
                    value={data.settings.sessionTimeout}
                    onChange={(e) => 
                      updatePermissions({
                        settings: { 
                          ...data.settings, 
                          sessionTimeout: parseInt(e.target.value) || 480 
                        }
                      })
                    }
                    data-testid="input-session-timeout"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-failed-logins">Max Failed Login Attempts</Label>
                  <Input
                    id="max-failed-logins"
                    type="number"
                    min="3"
                    max="20"
                    value={data.settings.maxFailedLogins}
                    onChange={(e) => 
                      updatePermissions({
                        settings: { 
                          ...data.settings, 
                          maxFailedLogins: parseInt(e.target.value) || 5 
                        }
                      })
                    }
                    data-testid="input-max-failed-logins"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Password Policy</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-password-length">Minimum Length</Label>
                    <Input
                      id="min-password-length"
                      type="number"
                      min="6"
                      max="50"
                      value={data.settings.passwordPolicy.minLength}
                      onChange={(e) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              minLength: parseInt(e.target.value) || 12
                            }
                          }
                        })
                      }
                      data-testid="input-min-password-length"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      min="30"
                      max="365"
                      value={data.settings.passwordPolicy.expirationDays}
                      onChange={(e) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              expirationDays: parseInt(e.target.value) || 90
                            }
                          }
                        })
                      }
                      data-testid="input-password-expiry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Require Uppercase</Label>
                    <Switch
                      checked={data.settings.passwordPolicy.requireUppercase}
                      onCheckedChange={(requireUppercase) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              requireUppercase
                            }
                          }
                        })
                      }
                      data-testid="switch-require-uppercase"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Require Numbers</Label>
                    <Switch
                      checked={data.settings.passwordPolicy.requireNumbers}
                      onCheckedChange={(requireNumbers) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              requireNumbers
                            }
                          }
                        })
                      }
                      data-testid="switch-require-numbers"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Require Lowercase</Label>
                    <Switch
                      checked={data.settings.passwordPolicy.requireLowercase}
                      onCheckedChange={(requireLowercase) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              requireLowercase
                            }
                          }
                        })
                      }
                      data-testid="switch-require-lowercase"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Require Special Characters</Label>
                    <Switch
                      checked={data.settings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(requireSpecialChars) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            passwordPolicy: {
                              ...data.settings.passwordPolicy,
                              requireSpecialChars
                            }
                          }
                        })
                      }
                      data-testid="switch-require-special-chars"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-suspend Inactive Users</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically suspend users who haven't logged in for a specified period
                    </p>
                  </div>
                  <Switch
                    checked={data.settings.autoSuspendInactiveUsers}
                    onCheckedChange={(autoSuspendInactiveUsers) => 
                      updatePermissions({
                        settings: { ...data.settings, autoSuspendInactiveUsers }
                      })
                    }
                    data-testid="switch-auto-suspend-users"
                  />
                </div>

                {data.settings.autoSuspendInactiveUsers && (
                  <div className="space-y-2">
                    <Label htmlFor="inactive-user-days">Inactive Period (days)</Label>
                    <Input
                      id="inactive-user-days"
                      type="number"
                      min="30"
                      max="365"
                      value={data.settings.inactiveUserDays}
                      onChange={(e) => 
                        updatePermissions({
                          settings: { 
                            ...data.settings, 
                            inactiveUserDays: parseInt(e.target.value) || 90 
                          }
                        })
                      }
                      data-testid="input-inactive-user-days"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member. They'll receive an email with setup instructions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@company.com"
                data-testid="input-invite-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select>
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (Optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a personal message to the invitation..."
                data-testid="textarea-invite-message"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => inviteUser({ 
                email: "user@company.com", 
                role: "viewer" 
              })}
              data-testid="button-send-invitation"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
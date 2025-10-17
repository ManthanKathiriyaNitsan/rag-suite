import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  Plus,
  Users,
  UserPlus,
  Settings,
  Shield,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Edit,
  UserX,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
  lastActive: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface PermissionsTabProps {
  data: Role[];
  users: User[];
  onChange: (roles: Role[]) => void;
}

export default function PermissionsTab({ data, users, onChange }: PermissionsTabProps) {
  const [roles, setRoles] = useState<Role[]>(data || []);
  const [teamUsers, setTeamUsers] = useState<User[]>(users || []);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRoleCreateOpen, setIsRoleCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
      role: "viewer",
  });
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    setRoles(data || []);
  }, [data]);

  useEffect(() => {
    setTeamUsers(users || []);
  }, [users]);

  const handleInviteUser = () => {
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as "owner" | "admin" | "editor" | "viewer",
      status: "pending",
      lastActive: new Date().toISOString(),
      permissions: getDefaultPermissions(newUser.role as string),
    };

    const updated = [...teamUsers, user];
    setTeamUsers(updated);
    setIsInviteOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
    });
  };

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) return;

    const role: Role = {
      id: `role-${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions || [],
      userCount: 0,
    };

    const updated = [...roles, role];
    setRoles(updated);
    onChange(updated);
    setIsRoleCreateOpen(false);
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    const updated = teamUsers.map(user =>
      user.id === id ? { ...user, ...updates } : user
    );
    setTeamUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = teamUsers.filter(user => user.id !== id);
    setTeamUsers(updated);
  };

  const handleDeleteRole = (id: string) => {
    const updated = roles.filter(role => role.id !== id);
    setRoles(updated);
    onChange(updated);
  };

  const getDefaultPermissions = (role: string) => {
    const permissions: Record<string, User["permissions"]> = {
      owner: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canViewAnalytics: true,
        canManageSettings: true,
      },
      admin: {
        canEdit: true,
        canDelete: false,
        canInvite: true,
        canViewAnalytics: true,
        canManageSettings: false,
      },
      editor: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canViewAnalytics: true,
        canManageSettings: false,
      },
      viewer: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canViewAnalytics: false,
        canManageSettings: false,
      },
    };
    return permissions[role] || permissions.viewer;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="destructive">Owner</Badge>;
      case "admin":
        return <Badge variant="default" className="bg-blue-500">Admin</Badge>;
      case "editor":
        return <Badge variant="outline" className="border-green-500 text-green-500">Editor</Badge>;
      case "viewer":
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Access Control & Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and access permissions for your integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isRoleCreateOpen} onOpenChange={setIsRoleCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Create a custom role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name || ""}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description || ""}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role's responsibilities"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRoleCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new team member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email Address</Label>
                    <Input
                    id="user-email"
                    type="email"
                    value={newUser.email || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    />
                  </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage team members and their access levels
          </p>
            </CardHeader>
            <CardContent>
          {teamUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No team members yet</p>
                  </div>
                ) : (
            <div className="space-y-4">
              {teamUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    <div>
                          <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                          </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>Last active {new Date(user.lastActive).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser(user)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive"
                            >
                          <UserX className="h-4 w-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
              ))}
            </div>
                )}
            </CardContent>
          </Card>

      {/* Roles */}
          <Card>
            <CardHeader>
          <CardTitle className="text-base">Roles & Permissions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define roles and their associated permissions
          </p>
            </CardHeader>
            <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <p>No custom roles defined</p>
                      </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline">{role.userCount} users</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                          </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser({ ...editingUser!, role: role.name as any })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser({ ...editingUser!, role: role.name as any })}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
                  </div>
                )}
            </CardContent>
          </Card>
    </div>
  );
}
import * as React from "react";
import { useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { User, Settings, LogOut, Shield, Bell, HelpCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/badge";
// 🔐 Import authentication context
import { useAuthContext } from "@/contexts/AuthContext";

interface UserDropdownProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

const UserDropdown = React.memo(function UserDropdown({ user }: UserDropdownProps) {
  const [, setLocation] = useLocation();
  
  // 🔐 Use authentication context instead of direct localStorage access
  const { user: authUser, isAuthenticated, logout } = useAuthContext();
  
  // 🔧 FIXED: Use authUser from context, fallback to prop, then to safe defaults
  const currentUser = authUser || user;
  
  // 🔧 FIXED: Ensure all user properties have fallback values with proper type handling
  const safeUser = {
    name: (currentUser as any)?.name || (currentUser as any)?.username || "User",
    email: (currentUser as any)?.email || "user@example.com",
    avatar: (currentUser as any)?.avatar || "",
    role: (currentUser as any)?.role || "User"
  };

  // 🔧 DEBUG: Log current user data
  console.log('🔍 UserDropdown - authUser:', authUser);
  console.log('🔍 UserDropdown - user prop:', user);
  console.log('🔍 UserDropdown - currentUser:', currentUser);
  console.log('🔍 UserDropdown - safeUser:', safeUser);

  // 🔐 Use context logout handler
  const handleLogout = useCallback(() => {
    logout();
    setLocation("/login");
  }, [logout, setLocation]);

  // 🔧 FIXED: Compute initials unconditionally to preserve hook order
  const userInitials = useMemo(() => {
    return safeUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [safeUser.name]);

  // 🔧 FIXED: Only control rendering, never conditionally call hooks
  if (!isAuthenticated || !currentUser) {
    console.log('🔍 UserDropdown - No user found, not rendering');
    return null; // Don't render if no user is logged in
  }

  return (
    <div className="relative  ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-auto rounded-full px-2 py-1.5 flex items-center gap-2"
            data-testid="user-menu-trigger"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-sidebar-foreground whitespace-nowrap">
              {safeUser.role}
            </span>
          </Button>
        </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-screen md:w-80 !overflow-y-auto max-h-[91vh] pr-1 md:!overflow-y-hidden md:max-h-none md:pr-1 z-[10000]" 
        align="end" 
        forceMount
        style={{ 
          zIndex: 10000,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 p-4 border-b flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{safeUser.name}</p>
              <Badge variant="secondary" className="text-xs">
                {safeUser.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{safeUser.email}</p>
          </div>
        </div>

        {/* Account Management */}
        <div className="p-2">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </DropdownMenuLabel>
          
          <Link href="/profile">
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 cursor-pointer hover-elevate"
              data-testid="menu-profile"
            >
              <User className="h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">My Profile</p>
                <p className="text-xs text-muted-foreground">Manage your account details</p>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/settings">
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 cursor-pointer hover-elevate"
              data-testid="menu-settings"
            >
              <Settings className="h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Preferences and configuration</p>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid="menu-security">
            <Shield className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">Security</p>
              <p className="text-xs text-muted-foreground">Password and authentication</p>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <div className="p-2">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </DropdownMenuLabel>
          
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid="menu-notifications">
            <Bell className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Manage alerts and updates</p>
            </div>
            <Badge
              variant="destructive"
              className="h-[20px] w-[20px] min-w-[20px] text-[12px] font-semibold flex items-center justify-center rounded-full !p-0"
              style={{ borderRadius: '9999px' }}
            >
              3
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid="menu-billing">
            <CreditCard className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">Billing</p>
              <p className="text-xs text-muted-foreground">Subscription and usage</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid="menu-help">
            <HelpCircle className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">Help & Support</p>
              <p className="text-xs text-muted-foreground">Documentation and contact</p>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 cursor-pointer text-destructive focus:text-destructive hover-elevate"
            data-testid="menu-logout"
          >
            <LogOut className="h-4 w-4" />
            <p className="font-medium">Sign out</p>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

export default UserDropdown;

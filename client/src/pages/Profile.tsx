import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User, Mail, Shield, Key, Bell, Globe, Save, Upload, Camera } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import { GlassCard } from "@/components/ui/GlassCard";

const Profile = React.memo(function Profile() {
  const { user: authUser } = useAuthContext();
  const [userData, setUserData] = useState({
    name: (authUser as any)?.name || authUser?.username || "User",
    email: (authUser as any)?.email || "user@example.com",
    title: "Senior Product Manager", // Default title
    department: "Engineering", // Default department
    bio: "Passionate about building AI-powered solutions that enhance user experience and drive business growth.",
    avatar: (authUser as any)?.avatar || "",
    phone: "+1 (555) 123-4567", // Default phone
    location: "San Francisco, CA", // Default location
    timezone: "America/Los_Angeles", // Default timezone
    joinDate: "March 2023" // Default join date
  });

  // 🔧 FIXED: Update user data when auth user changes
  useEffect(() => {
    if (authUser) {
      setUserData(prev => ({
        ...prev,
        name: (authUser as any)?.name || authUser?.username || prev.name,
        email: (authUser as any)?.email || prev.email,
        avatar: (authUser as any)?.avatar || prev.avatar,
      }));
    }
  }, [authUser]); // Only depend on authUser

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    weeklyReports: true,
    securityAlerts: true,
    marketingEmails: false,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "team",
    activityVisible: true,
    emailVisible: false
  });

  // 📝 Memoized initials calculation
  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // 💾 Memoized save handler
  const handleSave = useCallback(() => {
    // Save functionality
  }, []);

  // 📷 Memoized avatar upload handler
  const handleAvatarUpload = useCallback(() => {
    // Avatar upload functionality
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-0 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        {/* Profile Summary Card */}
        <GlassCard>
          <CardContent className=" py-6  px-2 lg:p-6">
            <div className="flex flex-col lg:flex-row  items-center gap-6">
              <div className="relative  ">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={handleAvatarUpload}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-foreground">{userData.name}</h2>
                  <Badge variant="secondary">{(authUser as any)?.role || "User"}</Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-1">{userData.title}</p>
                <p className="text-sm text-muted-foreground">{userData.department} • Joined {userData.joinDate}</p>
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {userData.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {userData.location}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Button className="w-full md:w-auto group" onClick={handleSave} data-testid="button-save-profile">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <PointerTypes.Save className="absolute inset-0" />
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Profile Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2" data-testid="tab-general">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2" data-testid="tab-security">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2" data-testid="tab-privacy">
            <Key className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    data-testid="input-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    data-testid="input-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={userData.title}
                    onChange={(e) => setUserData({...userData, title: e.target.value})}
                    data-testid="input-title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={userData.department} onValueChange={(value) => setUserData({...userData, department: value})}>
                    <SelectTrigger data-testid="select-department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle>Contact & Location</CardTitle>
                <CardDescription>
                  Manage your contact details and timezone settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    data-testid="input-phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={userData.location}
                    onChange={(e) => setUserData({...userData, location: e.target.value})}
                    data-testid="input-location"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={userData.timezone} onValueChange={(value) => setUserData({...userData, timezone: value})}>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="Europe/Berlin">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={userData.bio}
                    onChange={(e) => setUserData({...userData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                    data-testid="textarea-bio"
                  />
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <CardHeader>
                <CardTitle>Password & Authentication</CardTitle>
                <CardDescription>
                  Manage your password and two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    data-testid="input-current-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                </div>
                
                <div className="relative">
                  <Button className="w-full group" data-testid="button-update-password">
                    Update Password
                  </Button>
                  <PointerTypes.Save className="absolute inset-0" />
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Additional security options for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-enable-2fa">Enable</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-login-notifications" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Management</h4>
                    <p className="text-sm text-muted-foreground">Manage active sessions</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-view-sessions">View Sessions</Button>
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Updates</h4>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch 
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, emailUpdates: checked})}
                    data-testid="switch-email-updates"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">Get weekly analytics and performance reports</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                    data-testid="switch-weekly-reports"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">Important security and account alerts</p>
                  </div>
                  <Switch 
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
                    data-testid="switch-security-alerts"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">Product updates and promotional content</p>
                  </div>
                  <Switch 
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                    data-testid="switch-marketing-emails"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Real-time notifications in your browser</p>
                  </div>
                  <Switch 
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    data-testid="switch-push-notifications"
                  />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control how your information is shared and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                    <SelectTrigger data-testid="select-profile-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Visible to everyone</SelectItem>
                      <SelectItem value="team">Team - Visible to team members only</SelectItem>
                      <SelectItem value="private">Private - Only visible to you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Activity Status</h4>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch 
                    checked={privacy.activityVisible}
                    onCheckedChange={(checked) => setPrivacy({...privacy, activityVisible: checked})}
                    data-testid="switch-activity-visible"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Email Address</h4>
                    <p className="text-sm text-muted-foreground">Display your email in your public profile</p>
                  </div>
                  <Switch 
                    checked={privacy.emailVisible}
                    onCheckedChange={(checked) => setPrivacy({...privacy, emailVisible: checked})}
                    data-testid="switch-email-visible"
                  />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
});

export default Profile;

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Settings,
  Database,
  Shield,
  Users,
  Film,
  Bell,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
  Server,
  Mail,
  Palette,
  HardDrive,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  twoFactorEnabled: boolean;
  autoBackupEnabled: boolean;
  backupFrequency: string;
  logRetentionDays: number;
  cacheEnabled: boolean;
  cdnEnabled: boolean;
  analyticsEnabled: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  tmdbApiKey: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  darkModeEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "CineHub",
    siteDescription: "Your ultimate movie and TV show companion",
    siteUrl: "https://cinehub.com",
    adminEmail: "admin@cinehub.com",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 5,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif", "webp"],
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorEnabled: false,
    autoBackupEnabled: true,
    backupFrequency: "daily",
    logRetentionDays: 90,
    cacheEnabled: true,
    cdnEnabled: false,
    analyticsEnabled: true,
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: false,
    tmdbApiKey: "",
    themePrimaryColor: "#4fd1c5",
    themeSecondaryColor: "#2d3748",
    darkModeEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Settings would be loaded from the API here
      // For now, we use the default settings
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "Backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Cache cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-slate-700 rounded-lg"></div>
              <div className="h-96 bg-slate-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
            <p className="text-slate-400">Configure and manage your CineHub platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSettings}
              disabled={loading}
              className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              <Save className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="general" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="users" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              Content
            </TabsTrigger>
            <TabsTrigger value="security" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              System
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              Maintenance
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-slate-300">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl" className="text-slate-300">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-slate-300">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-slate-300">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-slate-300">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="UTC" className="cursor-pointer hover:bg-primary/10">UTC</SelectItem>
                        <SelectItem value="US/Eastern" className="cursor-pointer hover:bg-primary/10">US Eastern</SelectItem>
                        <SelectItem value="US/Pacific" className="cursor-pointer hover:bg-primary/10">US Pacific</SelectItem>
                        <SelectItem value="Europe/London" className="cursor-pointer hover:bg-primary/10">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo" className="cursor-pointer hover:bg-primary/10">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Dark Mode</Label>
                    <p className="text-sm text-slate-400">Enable dark theme across the platform</p>
                  </div>
                  <Switch
                    checked={settings.darkModeEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, darkModeEnabled: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-slate-300">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        value={settings.themePrimaryColor}
                        onChange={(e) => setSettings({ ...settings, themePrimaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <div
                        className="w-10 h-10 rounded border border-slate-600 cursor-pointer"
                        style={{ backgroundColor: settings.themePrimaryColor }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-slate-300">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        value={settings.themeSecondaryColor}
                        onChange={(e) => setSettings({ ...settings, themeSecondaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <div
                        className="w-10 h-10 rounded border border-slate-600 cursor-pointer"
                        style={{ backgroundColor: settings.themeSecondaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Settings */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">User Registration</Label>
                    <p className="text-sm text-slate-400">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Email Verification</Label>
                    <p className="text-sm text-slate-400">Require email verification for new accounts</p>
                  </div>
                  <Switch
                    checked={settings.emailVerificationRequired}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-slate-300">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize" className="text-slate-300">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings({ ...settings, maxFileSize: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tmdbApiKey" className="text-slate-300">TMDB API Key</Label>
                  <Input
                    id="tmdbApiKey"
                    type="password"
                    value={settings.tmdbApiKey}
                    onChange={(e) => setSettings({ ...settings, tmdbApiKey: e.target.value })}
                    placeholder="Enter your TMDB API key"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-sm text-slate-400">Required for fetching movie and TV show data</p>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">CDN</Label>
                    <p className="text-sm text-slate-400">Enable Content Delivery Network for faster image loading</p>
                  </div>
                  <Switch
                    checked={settings.cdnEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cdnEnabled: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Cache</Label>
                    <p className="text-sm text-slate-400">Enable caching for better performance</p>
                  </div>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cacheEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength" className="text-slate-300">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                      min="6"
                      max="32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logRetention" className="text-slate-300">Log Retention (days)</Label>
                    <Input
                      id="logRetention"
                      type="number"
                      value={settings.logRetentionDays}
                      onChange={(e) => setSettings({ ...settings, logRetentionDays: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Strong Password Required</Label>
                    <p className="text-sm text-slate-400">Require passwords with uppercase, lowercase, numbers, and symbols</p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPassword}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPassword: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-400">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Maintenance Mode</Label>
                    <p className="text-sm text-slate-400">Put the site in maintenance mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.maintenanceMode && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Analytics</Label>
                    <p className="text-sm text-slate-400">Enable user analytics and tracking</p>
                  </div>
                  <Switch
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Email Notifications</Label>
                    <p className="text-sm text-slate-400">Send system email notifications</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Push Notifications</Label>
                    <p className="text-sm text-slate-400">Enable browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  Backup & Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Auto Backup</Label>
                    <p className="text-sm text-slate-400">Automatically backup database and files</p>
                  </div>
                  <Switch
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackupEnabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-slate-300">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="hourly" className="cursor-pointer hover:bg-primary/10">Hourly</SelectItem>
                      <SelectItem value="daily" className="cursor-pointer hover:bg-primary/10">Daily</SelectItem>
                      <SelectItem value="weekly" className="cursor-pointer hover:bg-primary/10">Weekly</SelectItem>
                      <SelectItem value="monthly" className="cursor-pointer hover:bg-primary/10">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-slate-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleBackup}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button
                    onClick={handleClearCache}
                    variant="outline"
                    className="cursor-pointer hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="text-red-400 font-medium mb-2">Reset System Settings</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    This will reset all system settings to their default values. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
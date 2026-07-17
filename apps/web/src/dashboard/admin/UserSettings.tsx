import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks';

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');

  const handleSave = () => {
    // Persist settings to user profile (mock)
    updateUser({
      // You can add a settings object to the user type as needed
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
        <p className="text-muted-foreground">Configure your personal preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id="notifications" checked={notifications} onCheckedChange={(v) => setNotifications(!!v)} />
            <Label htmlFor="notifications">Enable Notifications</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'es' | 'fr')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
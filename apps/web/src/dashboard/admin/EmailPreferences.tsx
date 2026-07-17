import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Bell, Calendar, DollarSign } from 'lucide-react';

interface EmailPreferences {
  LEAVE_REQUEST?: boolean;
  LEAVE_STATUS?: boolean;
  PAYOUT_REQUEST?: boolean;
  PAYOUT_STATUS?: boolean;
}

interface EmailPreferencesProps {
  onUpdate?: (preferences: EmailPreferences) => void;
}

export const EmailPreferences: React.FC<EmailPreferencesProps> = ({ onUpdate }) => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    LEAVE_REQUEST: true,
    LEAVE_STATUS: true,
    PAYOUT_REQUEST: true,
    PAYOUT_STATUS: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/email-preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.emailPreferences || {});
      }
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    if (onUpdate) {
      onUpdate(newPreferences);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/users/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ emailPreferences: preferences }),
      });

      if (response.ok) {
        toast.success('Email preferences updated successfully');
      } else {
        toast.error('Failed to update email preferences');
      }
    } catch (error) {
      console.error('Error saving email preferences:', error);
      toast.error('Failed to update email preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceOptions = [
    {
      key: 'LEAVE_REQUEST' as keyof EmailPreferences,
      title: 'Leave Requests',
      description: 'Get notified when someone requests leave approval',
      icon: Calendar,
      roles: ['manager', 'hr'],
    },
    {
      key: 'LEAVE_STATUS' as keyof EmailPreferences,
      title: 'Leave Status Updates',
      description: 'Get notified when your leave request status changes',
      icon: Calendar,
      roles: ['employee'],
    },
    {
      key: 'PAYOUT_REQUEST' as keyof EmailPreferences,
      title: 'Payout Requests',
      description: 'Get notified when someone requests a payout',
      icon: DollarSign,
      roles: ['finance'],
    },
    {
      key: 'PAYOUT_STATUS' as keyof EmailPreferences,
      title: 'Payout Status Updates',
      description: 'Get notified when your payout request status changes',
      icon: DollarSign,
      roles: ['customer', 'driver'],
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage your email notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>Manage your email notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preferenceOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = preferences[option.key] !== false; // Default to true if not set
          
          return (
            <div key={option.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-500" />
                <div>
                  <Label htmlFor={option.key} className="text-sm font-medium">
                    {option.title}
                  </Label>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <Switch
                id={option.key}
                checked={isEnabled}
                onCheckedChange={(checked) => handlePreferenceChange(option.key, checked)}
              />
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
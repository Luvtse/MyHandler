import React, { useState } from 'react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, CheckCircle, AlertCircle, Info, XCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const notificationIcons = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertCircle,
  ERROR: XCircle,
  LEAVE_REQUEST: Calendar,
  LEAVE_STATUS: CheckCircle,
  PAYOUT_REQUEST: Info,
  PAYOUT_STATUS: CheckCircle
};

const notificationColors = {
  INFO: 'text-blue-500',
  SUCCESS: 'text-green-500',
  WARNING: 'text-yellow-500',
  ERROR: 'text-red-500',
  LEAVE_REQUEST: 'text-blue-500',
  LEAVE_STATUS: 'text-green-500',
  PAYOUT_REQUEST: 'text-purple-500',
  PAYOUT_STATUS: 'text-green-500'
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ id: notificationId });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteMutation.mutateAsync({ id: notificationId });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No notifications</p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {notifications.map((notification: any) => {
                  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons];
                  
                  // Determine action URL based on notification type and related data
                  let actionUrl = notification.actionUrl;
                  let actionText = notification.actionText;
                  
                  if (!actionUrl) {
                    switch (notification.type) {
                      case 'LEAVE_REQUEST':
                        actionUrl = '/hr/leave-management';
                        actionText = 'Review Leave';
                        break;
                      case 'LEAVE_STATUS':
                        actionUrl = '/leave';
                        actionText = 'View Leave';
                        break;
                      case 'PAYOUT_REQUEST':
                        actionUrl = '/finance/payout-requests';
                        actionText = 'Review Payout';
                        break;
                      case 'PAYOUT_STATUS':
                        actionUrl = '/finance/payout-requests';
                        actionText = 'View Payout';
                        break;
                    }
                  }
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${notificationColors[notification.type as keyof typeof notificationColors]}`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                            </p>
                            <div className="flex space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {actionUrl && actionText && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                window.location.href = actionUrl;
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification.id);
                                }
                              }}
                            >
                              {actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
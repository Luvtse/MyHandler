import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { NotificationType } from '@prisma/client';

export const notificationController = {
  // Create notification
  createNotification: async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ) => {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          actionUrl,
          actionText,
          isRead: false
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get all notifications for the current user
  getUserNotifications: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = { userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.notification.count({ where })
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.updateMany({
        where: {
          id,
          userId
        },
        data: {
          isRead: true
        }
      });

      if (notification.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read'
      });
    }
  },

  // Delete a notification
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.deleteMany({
        where: {
          id,
          userId
        }
      });

      if (notification.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }
  },

  // Get unread notification count
  getUnreadCount: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unread count'
      });
    }
  }
};

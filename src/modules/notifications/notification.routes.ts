import { Router } from 'express';
import { notificationController } from './notification.controller';
import { requireAuth } from '../../services/authService';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Notification routes
router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.get('/unread-count', notificationController.getUnreadCount);

export const notificationRouter = router;
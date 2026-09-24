"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.notificationController = {
    // Create notification
    createNotification: async (userId, type, title, message, actionUrl, actionText) => {
        try {
            const notification = await prisma_1.default.notification.create({
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
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },
    // Get all notifications for the current user
    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user.sub;
            const { page = 1, limit = 20, unreadOnly = false } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = { userId };
            if (unreadOnly === 'true') {
                where.isRead = false;
            }
            const [notifications, total] = await Promise.all([
                prisma_1.default.notification.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma_1.default.notification.count({ where })
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
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notifications'
            });
        }
    },
    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.sub;
            const notification = await prisma_1.default.notification.updateMany({
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
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark notification as read'
            });
        }
    },
    // Mark all notifications as read
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.sub;
            await prisma_1.default.notification.updateMany({
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
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark all notifications as read'
            });
        }
    },
    // Delete a notification
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.sub;
            const notification = await prisma_1.default.notification.deleteMany({
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
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete notification'
            });
        }
    },
    // Get unread notification count
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.sub;
            const count = await prisma_1.default.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            });
            res.json({
                success: true,
                data: { count }
            });
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count'
            });
        }
    }
};

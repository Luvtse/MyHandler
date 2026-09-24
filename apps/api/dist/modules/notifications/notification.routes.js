"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const authService_1 = require("../../services/authService");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(authService_1.requireAuth);
// Notification routes
router.get('/', notification_controller_1.notificationController.getUserNotifications);
router.patch('/:id/read', notification_controller_1.notificationController.markAsRead);
router.patch('/mark-all-read', notification_controller_1.notificationController.markAllAsRead);
router.delete('/:id', notification_controller_1.notificationController.deleteNotification);
router.get('/unread-count', notification_controller_1.notificationController.getUnreadCount);
exports.notificationRouter = router;

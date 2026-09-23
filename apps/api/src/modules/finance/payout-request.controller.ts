import { Request, Response } from 'express';
import { hasAnyRole } from '../../services/authService';
import prisma from '../../utils/prisma';
import { emailService } from '../../services/emailService';

export const payoutRequestController = {
  // Create a new payout request
  create: async (req: Request, res: Response) => {
    try {
      const { amount, currency, paymentMethod, bankAccount, mobileNumber, description } = req.body;
      const userId = req.user?.sub;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: user missing' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Payment method is required'
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          error: 'Description is required'
        });
      }

      if (paymentMethod === 'BANK_TRANSFER' && !bankAccount) {
        return res.status(400).json({ success: false, error: 'Bank account is required for bank transfer' });
      }
      if (paymentMethod === 'MOBILE_MONEY' && !mobileNumber) {
        return res.status(400).json({ success: false, error: 'Mobile number is required for mobile money' });
      }

      const payoutRequest = await prisma.payoutRequest.create({
        data: {
          userId,
          amount,
          currency: currency || 'USD',
          paymentMethod,
          bankAccount,
          mobileNumber,
          description,
          requestedBy: String(userId),
          status: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create notification for finance users
      const financeUsers = await prisma.user.findMany({
        where: { role: 'finance' },
      });

      for (const financeUser of financeUsers) {
        await prisma.notification.create({
          data: {
            userId: financeUser.id,
            type: 'INFO',
            title: 'New Payout Request',
            message: `${payoutRequest.user.name} has requested a payout of ${payoutRequest.amount} ${payoutRequest.currency}`,
            actionUrl: '/dashboard/finance/payout-requests',
            actionText: 'Review Request',
          },
        });

        // Send email notification to finance users
        await emailService.sendNotificationEmail(financeUser.id, 'PAYOUT_REQUEST', {
          amount: payoutRequest.amount,
          currency: payoutRequest.currency,
          paymentMethod: payoutRequest.paymentMethod,
          requestedBy: payoutRequest.user.name,
        });
      }

      res.status(201).json({
        success: true,
        data: payoutRequest
      });
    } catch (error) {
      console.error('Error creating payout request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payout request'
      });
    }
  },

  // Get all payout requests with optional filtering
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, userId, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (userId) {
        where.userId = userId;
      }

      const [payoutRequests, total] = await Promise.all([
        prisma.payoutRequest.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.payoutRequest.count({ where })
      ]);

      res.json({
        success: true,
        data: payoutRequests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payout requests'
      });
    }
  },

  // Get payout request by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const payoutRequest = await prisma.payoutRequest.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!payoutRequest) {
        return res.status(404).json({
          success: false,
          error: 'Payout request not found'
        });
      }

      res.json({
        success: true,
        data: payoutRequest
      });
    } catch (error) {
      console.error('Error fetching payout request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payout request'
      });
    }
  },

  // Update payout request status (approve/reject/process)
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason, notes } = req.body;
      const userId = req.user!.sub;

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }

      const existingRequest = await prisma.payoutRequest.findUnique({
        where: { id }
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          error: 'Payout request not found'
        });
      }

      const updateData: any = {
        status,
        notes: notes || existingRequest.notes
      };

      if (status === 'APPROVED' || status === 'REJECTED') {
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }

      if (status === 'PROCESSING' || status === 'COMPLETED') {
        updateData.processedBy = userId;
        updateData.processedAt = new Date();
      }

      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedRequest = await prisma.payoutRequest.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create notification for user
      const statusMessages = {
        APPROVED: 'Your payout request has been approved',
        REJECTED: 'Your payout request has been rejected',
        PROCESSING: 'Your payout request is being processed',
        COMPLETED: 'Your payout request has been completed'
      };

      if (statusMessages[status as keyof typeof statusMessages]) {
        const typeMap: Record<string, 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING'> = {
          APPROVED: 'SUCCESS',
          COMPLETED: 'SUCCESS',
          REJECTED: 'ERROR',
          PROCESSING: 'INFO',
          PENDING: 'INFO',
          CANCELLED: 'WARNING',
        };

        await prisma.notification.create({
          data: {
            userId: updatedRequest.userId,
            type: typeMap[status] || 'INFO',
            title: `Payout Request ${status}`,
            message: statusMessages[status as keyof typeof statusMessages],
            actionUrl: '/dashboard/finance/payout-requests',
            actionText: 'View Details',
          },
        });

        // Send email notification to user
        await emailService.sendNotificationEmail(updatedRequest.userId, 'PAYOUT_STATUS', {
          status,
          amount: updatedRequest.amount,
          currency: updatedRequest.currency,
          paymentMethod: updatedRequest.paymentMethod,
          notes: updatedRequest.notes,
        });
      }

      res.json({
        success: true,
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error updating payout request status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update payout request status'
      });
    }
  },

  // Delete payout request (only if pending)
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existingRequest = await prisma.payoutRequest.findUnique({
        where: { id }
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          error: 'Payout request not found'
        });
      }

      if (existingRequest.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Can only delete pending payout requests'
        });
      }

      await prisma.payoutRequest.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Payout request deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payout request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete payout request'
      });
    }
  }
};

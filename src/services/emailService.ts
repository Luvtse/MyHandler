import * as nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        ...options,
      });
      console.log('Email sent successfully to:', options.to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send notification email based on type
   */
  async sendNotificationEmail(userId: string, type: string, data: any): Promise<void> {
    try {
      // Get user email preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user || !user.email) {
        console.log('User not found or no email address');
        return;
      }

      // Check if user has enabled email notifications for this type
      // For now, we'll assume all notifications are enabled
      // TODO: Add emailPreferences field to User model or use a separate preferences table

      // Get email template
      const template = this.getEmailTemplate(type, data, user.name);
      if (!template) {
        console.log(`No email template found for type: ${type}`);
        return;
      }

      await this.sendEmail({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      // Log email sent
      await (prisma as any).emailLog.create({
        data: {
          userId,
          type,
          recipient: user.email,
          subject: template.subject,
          status: 'SENT',
        },
      });
    } catch (error) {
      console.error('Error sending notification email:', error);
      
      // Log email failure
      await (prisma as any).emailLog.create({
        data: {
          userId,
          type,
          recipient: 'unknown',
          subject: `Email notification: ${type}`,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Get email template based on notification type
   */
  private getEmailTemplate(type: string, data: any, userName: string): EmailTemplate | null {
    const templates: Record<string, EmailTemplate> = {
      'LEAVE_REQUEST': {
        subject: 'New Leave Request',
        text: `Hello ${userName},\n\nA new leave request has been submitted and requires your review.\n\nLeave Type: ${data.leaveType}\nDuration: ${data.duration} days\nEmployee: ${data.employeeName}\n\nPlease log in to review the request.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Leave Request</h2>
            <p>Hello ${userName},</p>
            <p>A new leave request has been submitted and requires your review.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Leave Type:</strong> ${data.leaveType}</p>
              <p><strong>Duration:</strong> ${data.duration} days</p>
              <p><strong>Employee:</strong> ${data.employeeName}</p>
            </div>
            <p>Please log in to review the request.</p>
            <a href="${process.env.FRONTEND_URL}/hr/leave-management" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Review Leave Request</a>
          </div>
        `
      },
      'LEAVE_STATUS': {
        subject: `Leave Request ${data.status}`,
        text: `Hello ${userName},\n\nYour leave request has been ${data.status.toLowerCase()}.\n\nLeave Type: ${data.leaveType}\nDuration: ${data.duration} days\n${data.comments ? `Comments: ${data.comments}` : ''}\n\nPlease log in to view the details.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${data.status === 'APPROVED' ? '#28a745' : '#dc3545'};">Leave Request ${data.status}</h2>
            <p>Hello ${userName},</p>
            <p>Your leave request has been ${data.status.toLowerCase()}.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Leave Type:</strong> ${data.leaveType}</p>
              <p><strong>Duration:</strong> ${data.duration} days</p>
              ${data.comments ? `<p><strong>Comments:</strong> ${data.comments}</p>` : ''}
            </div>
            <a href="${process.env.FRONTEND_URL}/leave" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Leave Details</a>
          </div>
        `
      },
      'PAYOUT_REQUEST': {
        subject: 'New Payout Request',
        text: `Hello ${userName},\n\nA new payout request has been submitted and requires your review.\n\nAmount: ${data.amount} ${data.currency}\nPayment Method: ${data.paymentMethod}\nRequested by: ${data.requestedBy}\n\nPlease log in to review the request.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Payout Request</h2>
            <p>Hello ${userName},</p>
            <p>A new payout request has been submitted and requires your review.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p><strong>Requested by:</strong> ${data.requestedBy}</p>
            </div>
            <p>Please log in to review the request.</p>
            <a href="${process.env.FRONTEND_URL}/finance/payout-requests" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Review Payout Request</a>
          </div>
        `
      },
      'PAYOUT_STATUS': {
        subject: `Payout Request ${data.status}`,
        text: `Hello ${userName},\n\nYour payout request has been ${data.status.toLowerCase()}.\n\nAmount: ${data.amount} ${data.currency}\nPayment Method: ${data.paymentMethod}\n${data.notes ? `Notes: ${data.notes}` : ''}\n\nPlease log in to view the details.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${data.status === 'APPROVED' || data.status === 'COMPLETED' ? '#28a745' : '#dc3545'};">Payout Request ${data.status}</h2>
            <p>Hello ${userName},</p>
            <p>Your payout request has been ${data.status.toLowerCase()}.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
            </div>
            <a href="${process.env.FRONTEND_URL}/finance/payout-requests" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Payout Details</a>
          </div>
        `
      },
    };

    return templates[type] || null;
  }
}

export const emailService = new EmailService();
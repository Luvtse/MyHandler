import * as nodemailer from 'nodemailer';
import prisma from '../utils/prisma';


interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailTemplate { subject: string; text: string; html: string }

// ─── Brand helpers ────────────────────────────────────────────────────────────

const BRAND_BLUE = '#1A3C8F';
const BRAND_YELLOW = '#FFC107';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://woriyaexpress.com';

function header(title: string): string {
  return `
  <div style="background:${BRAND_BLUE};padding:24px 32px;border-radius:8px 8px 0 0;">
    <h1 style="color:#fff;margin:0;font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:700;">
      WORIYA EXPRESS
    </h1>
    <p style="color:#CBD5F0;margin:4px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;">
      ${title}
    </p>
  </div>`;
}

function footer(): string {
  return `
  <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;border-radius:0 0 8px 8px;">
    <p style="color:#94A3B8;font-family:Inter,Arial,sans-serif;font-size:12px;margin:0;text-align:center;">
      © ${new Date().getFullYear()} WORIYA EXPRESS &nbsp;·&nbsp;
      <a href="${FRONTEND_URL}/terms" style="color:#94A3B8;">Terms</a>
      &nbsp;·&nbsp;
      <a href="${FRONTEND_URL}/support" style="color:#94A3B8;">Support</a>
    </p>
  </div>`;
}

function card(content: string): string {
  return `
  <div style="background:#fff;padding:24px 32px;border:1px solid #E2E8F0;">
    ${content}
  </div>`;
}

function pill(label: string, color: string): string {
  return `<span style="background:${color};color:#fff;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:600;">${label}</span>`;
}

function cta(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${BRAND_BLUE};color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:600;margin-top:20px;">${text}</a>`;
}

function wrap(title: string, body: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;background:#F1F5F9;padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
      ${header(title)}
      ${card(body)}
      ${footer()}
    </div>
  </body>
  </html>`;
}

// ─── EmailService ─────────────────────────────────────────────────────────────

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"WORIYA EXPRESS" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        ...options,
      });
      console.log('[Email] Sent to:', options.to, '|', options.subject);
    } catch (error) {
      console.error('[Email] Failed:', error);
      throw error;
    }
  }

  /**
   * Send a typed notification email to a user.
   * Looks up user email from DB, picks the right template, and logs the result.
   */
  async sendNotificationEmail(userId: string, type: string, data: any): Promise<void> {
    let userEmail = 'unknown';
    let userName = '';
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (!user?.email) {
        console.log('[Email] No email for user:', userId);
        return;
      }
      userEmail = user.email;
      userName = user.name ?? 'Customer';

      const template = this.getEmailTemplate(type, data, userName);
      if (!template) {
        console.log('[Email] No template for type:', type);
        return;
      }

      await this.sendEmail({ to: userEmail, subject: template.subject, html: template.html, text: template.text });

      await this.logEmail(userId, type, userEmail, template.subject, 'SENT');
    } catch (error) {
      console.error('[Email] sendNotificationEmail error:', error);
      await this.logEmail(userId, type, userEmail, `Email: ${type}`, 'FAILED', error);
    }
  }

  private async logEmail(
    userId: string,
    type: string,
    recipient: string,
    subject: string,
    status: string,
    error?: any,
  ) {
    try {
      await (prisma as any).emailLog.create({
        data: {
          userId,
          type,
          recipient,
          subject,
          status,
          error: error instanceof Error ? error.message : error ? String(error) : null,
        },
      });
    } catch { /* swallow – logging should never break */ }
  }

  // ─── Templates ──────────────────────────────────────────────────────────────

  private getEmailTemplate(type: string, data: any, userName: string): EmailTemplate | null {
    const templates: Record<string, EmailTemplate> = {

      // ── Shipment created ────────────────────────────────────────────────────
      SHIPMENT_CREATED: {
        subject: `Shipment Booked – ${data.reference || 'AWB Ready'}`,
        text: `Hi ${userName},\n\nYour shipment ${data.reference} has been created.\nOrigin: ${data.origin}\nDestination: ${data.destination}\nService: ${data.serviceType || 'Standard'}\n\nTrack it at ${FRONTEND_URL}/tracking\n\n– WORIYA EXPRESS`,
        html: wrap(
          'Shipment Created',
          `<p style="font-family:Inter,Arial,sans-serif;color:#0F172A;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="font-family:Inter,Arial,sans-serif;color:#475569;margin:0 0 20px;line-height:1.6;">Your shipment has been booked and an Air Waybill has been generated.</p>
          <table style="width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748B;width:40%;">AWB / Reference</td><td style="padding:8px 0;color:#0F172A;font-weight:600;font-family:monospace;letter-spacing:.05em;">${data.reference || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Origin</td><td style="padding:8px 0;color:#0F172A;">${data.origin || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Destination</td><td style="padding:8px 0;color:#0F172A;">${data.destination || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Service</td><td style="padding:8px 0;color:#0F172A;">${data.serviceType || 'Standard'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Status</td><td style="padding:8px 0;">${pill('Order Received', BRAND_BLUE)}</td></tr>
          </table>
          ${cta('Track Your Shipment', `${FRONTEND_URL}/tracking?awb=${data.reference}`)}
          <p style="font-family:Inter,Arial,sans-serif;color:#94A3B8;font-size:12px;margin-top:24px;">Questions? Reply to this email or visit our <a href="${FRONTEND_URL}/support" style="color:${BRAND_BLUE};">Support Centre</a>.</p>`,
        ),
      },

      // ── Shipment delivered ──────────────────────────────────────────────────
      SHIPMENT_DELIVERED: {
        subject: `Delivered ✓ – ${data.reference || 'Your Shipment'}`,
        text: `Hi ${userName},\n\nGreat news! Your shipment ${data.reference} has been delivered.\nDelivered to: ${data.destination}\nDelivery time: ${data.deliveredAt || 'N/A'}\n\nThank you for choosing WORIYA EXPRESS.\n– WORIYA EXPRESS`,
        html: wrap(
          'Shipment Delivered',
          `<p style="font-family:Inter,Arial,sans-serif;color:#0F172A;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="font-family:Inter,Arial,sans-serif;color:#475569;margin:0 0 20px;line-height:1.6;">
            Great news! Your shipment has been successfully delivered. 🎉
          </p>
          <table style="width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748B;width:40%;">AWB / Reference</td><td style="padding:8px 0;color:#0F172A;font-weight:600;font-family:monospace;letter-spacing:.05em;">${data.reference || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Delivered To</td><td style="padding:8px 0;color:#0F172A;">${data.destination || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Delivery Time</td><td style="padding:8px 0;color:#0F172A;">${data.deliveredAt || '—'}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Status</td><td style="padding:8px 0;">${pill('Delivered', '#16A34A')}</td></tr>
          </table>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px;margin-top:20px;">
            <p style="font-family:Inter,Arial,sans-serif;color:#15803D;font-size:14px;margin:0;font-weight:600;">Thank you for choosing WORIYA EXPRESS!</p>
            <p style="font-family:Inter,Arial,sans-serif;color:#16A34A;font-size:13px;margin:6px 0 0;">Fast. Reliable. Affordable.</p>
          </div>
          ${cta('View Shipment Details', `${FRONTEND_URL}/tracking?awb=${data.reference}`)}`,
        ),
      },

      // ── Existing: Leave request ─────────────────────────────────────────────
      LEAVE_REQUEST: {
        subject: 'New Leave Request',
        text: `Hi ${userName},\n\nA new leave request requires your review.\nType: ${data.leaveType}\nDuration: ${data.duration} days\nEmployee: ${data.employeeName}\n\nPlease log in to review.`,
        html: wrap(
          'New Leave Request',
          `<p style="font-family:Inter,Arial,sans-serif;color:#0F172A;">Hi <strong>${userName}</strong>,</p>
          <p style="font-family:Inter,Arial,sans-serif;color:#475569;">A new leave request requires your review.</p>
          <table style="width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748B;width:40%;">Leave Type</td><td style="padding:8px 0;color:#0F172A;">${data.leaveType}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Duration</td><td style="padding:8px 0;color:#0F172A;">${data.duration} days</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Employee</td><td style="padding:8px 0;color:#0F172A;">${data.employeeName}</td></tr>
            ${data.comments ? `<tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Comments</td><td style="padding:8px 0;color:#0F172A;">${data.comments}</td></tr>` : ''}
          </table>
          ${cta('Review Request', `${FRONTEND_URL}/leave`)}`,
        ),
      },

      // ── Existing: Payout request ────────────────────────────────────────────
      PAYOUT_REQUEST: {
        subject: 'New Payout Request',
        text: `Hi ${userName},\n\nA new payout request requires your review.\nAmount: ${data.amount} ${data.currency}\nMethod: ${data.paymentMethod}\nRequested by: ${data.requestedBy}`,
        html: wrap(
          'New Payout Request',
          `<p style="font-family:Inter,Arial,sans-serif;color:#0F172A;">Hi <strong>${userName}</strong>,</p>
          <p style="font-family:Inter,Arial,sans-serif;color:#475569;">A new payout request requires your review.</p>
          <table style="width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748B;width:40%;">Amount</td><td style="padding:8px 0;color:#0F172A;font-weight:600;">${data.amount} ${data.currency}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Method</td><td style="padding:8px 0;color:#0F172A;">${data.paymentMethod}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Requested By</td><td style="padding:8px 0;color:#0F172A;">${data.requestedBy}</td></tr>
          </table>
          ${cta('Review Payout', `${FRONTEND_URL}/finance/payout-requests`)}`,
        ),
      },

      // ── Existing: Payout status ─────────────────────────────────────────────
      PAYOUT_STATUS: {
        subject: `Payout Request ${data.status}`,
        text: `Hi ${userName},\n\nYour payout request has been ${data.status?.toLowerCase()}.\nAmount: ${data.amount} ${data.currency}\nMethod: ${data.paymentMethod}${data.notes ? `\nNotes: ${data.notes}` : ''}`,
        html: wrap(
          `Payout ${data.status}`,
          `<p style="font-family:Inter,Arial,sans-serif;color:#0F172A;">Hi <strong>${userName}</strong>,</p>
          <p style="font-family:Inter,Arial,sans-serif;color:#475569;">Your payout request has been <strong>${data.status?.toLowerCase()}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748B;width:40%;">Amount</td><td style="padding:8px 0;color:#0F172A;font-weight:600;">${data.amount} ${data.currency}</td></tr>
            <tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Method</td><td style="padding:8px 0;color:#0F172A;">${data.paymentMethod}</td></tr>
            ${data.notes ? `<tr style="border-top:1px solid #F1F5F9;"><td style="padding:8px 0;color:#64748B;">Notes</td><td style="padding:8px 0;color:#0F172A;">${data.notes}</td></tr>` : ''}
          </table>
          ${cta('View Details', `${FRONTEND_URL}/finance/payout-requests`)}`,
        ),
      },
    };

    return templates[type] ?? null;
  }
}

export const emailService = new EmailService();

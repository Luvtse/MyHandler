"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBEProcessor = void 0;
const config_1 = __importDefault(require("../../../config"));
class CBEProcessor {
    constructor() {
        this.merchantId = config_1.default.cbe?.merchantId;
        this.apiKey = config_1.default.cbe?.apiKey;
    }
    async processPayment(paymentData) {
        try {
            console.log(`Processing CBE bank transfer for ${paymentData.amount} ${paymentData.currency}`);
            // Generate reference number
            const referenceNumber = `CBE${Date.now()}${Math.floor(Math.random() * 1000)}`;
            // In a real implementation, we would integrate with CBE's API
            // For now, we'll return instructions for manual bank transfer
            return {
                success: true,
                paymentId: referenceNumber,
                processorReference: referenceNumber,
                // No redirect URL for bank transfers, but we could provide instructions page
                redirectUrl: `/bank-transfer-instructions?ref=${referenceNumber}`
            };
        }
        catch (error) {
            console.error('CBE payment processing error:', error);
            const message = error instanceof Error ? error.message : 'Failed to process CBE bank transfer';
            return {
                success: false,
                error: message
            };
        }
    }
    async verifyPayment(paymentId) {
        try {
            console.log(`Verifying CBE bank transfer ${paymentId}`);
            // Bank transfers typically require manual verification
            // This would check if the payment has been marked as verified in our system
            // For demo purposes, we'll assume it's pending verification
            return {
                verified: false,
                paymentId,
                status: 'PENDING_VERIFICATION',
                error: 'Bank transfers require manual verification'
            };
        }
        catch (error) {
            console.error('CBE payment verification error:', error);
            const message = error instanceof Error ? error.message : 'Failed to verify CBE bank transfer';
            return {
                verified: false,
                error: message
            };
        }
    }
    async refundPayment(paymentId, amount) {
        try {
            console.log(`Refund request for CBE bank transfer ${paymentId} for amount ${amount}`);
            // Bank transfer refunds are typically handled manually
            return {
                success: false,
                error: 'Bank transfer refunds must be processed manually'
            };
        }
        catch (error) {
            console.error('CBE refund error:', error);
            const message = error instanceof Error ? error.message : 'Failed to refund CBE bank transfer';
            return {
                success: false,
                error: message
            };
        }
    }
}
exports.CBEProcessor = CBEProcessor;

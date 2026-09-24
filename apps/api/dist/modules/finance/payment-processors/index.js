"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessorFactory = void 0;
// Import specific payment processors
const stripe_1 = require("./stripe");
const paypal_1 = require("./paypal");
const chapa_1 = require("./chapa");
const telebirr_1 = require("./telebirr");
const cbe_1 = require("./cbe");
// Payment processor factory
class PaymentProcessorFactory {
    static getProcessor(method) {
        switch (method) {
            case 'CREDIT_CARD':
                return new stripe_1.StripeProcessor();
            case 'PAYPAL':
                return new paypal_1.PayPalProcessor();
            case 'CHAPA':
                return new chapa_1.ChapaPay();
            case 'TELEBIRR':
                return new telebirr_1.TelebirrProcessor();
            case 'BANK_TRANSFER':
                return new cbe_1.CBEProcessor();
            default:
                throw new Error(`Payment method ${method} not supported`);
        }
    }
}
exports.PaymentProcessorFactory = PaymentProcessorFactory;

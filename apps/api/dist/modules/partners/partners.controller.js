"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCustomsDeclaration = exports.syncEcommerceOrders = exports.regenerateApiCredentials = exports.updatePartner = exports.getPartnerById = exports.getPartners = exports.registerPartner = void 0;
const crypto_1 = __importDefault(require("crypto"));
const registerPartner = (_req, res) => {
    res.status(201).json({ message: 'Partner registered (stub)' });
};
exports.registerPartner = registerPartner;
const getPartners = (_req, res) => {
    res.status(200).json([]);
};
exports.getPartners = getPartners;
const getPartnerById = (_req, res) => {
    res.status(404).json({ message: 'Partner not found' });
};
exports.getPartnerById = getPartnerById;
const updatePartner = (_req, res) => {
    res.status(200).json({ message: 'Partner updated (stub)' });
};
exports.updatePartner = updatePartner;
// Generates cryptographically random credentials instead of returning the
// previous hardcoded TEST_KEY/TEST_SECRET placeholders. NOTE: persistence is
// still a stub until partners are stored in the DB — the secret is shown once
// and must be stored hashed server-side when real storage lands.
const regenerateApiCredentials = (_req, res) => {
    const apiKey = `ah_${crypto_1.default.randomBytes(16).toString('hex')}`;
    const secret = crypto_1.default.randomBytes(32).toString('hex');
    res.status(200).json({ apiKey, secret });
};
exports.regenerateApiCredentials = regenerateApiCredentials;
const syncEcommerceOrders = (_req, res) => {
    res.status(202).json({ message: 'Sync initiated (stub)' });
};
exports.syncEcommerceOrders = syncEcommerceOrders;
const submitCustomsDeclaration = (_req, res) => {
    res.status(200).json({ message: 'Customs submitted (stub)' });
};
exports.submitCustomsDeclaration = submitCustomsDeclaration;

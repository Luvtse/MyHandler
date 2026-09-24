"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const AppError_1 = require("./AppError");
function errorHandler(err, _req, res, _next) {
    // ── Zod validation errors ──────────────────────────────────────────────
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    // ── Prisma known request errors ────────────────────────────────────────
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: 'A record with this data already exists',
                code: 'DUPLICATE',
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Record not found',
                code: 'NOT_FOUND',
            });
        }
        if (err.code === 'P2003') {
            return res.status(400).json({
                success: false,
                error: 'Foreign key constraint failed – related record not found',
                code: 'FK_VIOLATION',
            });
        }
    }
    // ── Prisma validation errors ───────────────────────────────────────────
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            error: 'Invalid data supplied to the database',
            code: 'DB_VALIDATION',
        });
    }
    // ── Application errors (AppError subclasses) ───────────────────────────
    if (err instanceof AppError_1.AppError) {
        return res.status(err.status).json({
            success: false,
            error: err.message,
            code: err.code,
        });
    }
    // ── JWT errors ─────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            code: 'TOKEN_INVALID',
        });
    }
    // ── Generic / unhandled errors ─────────────────────────────────────────
    const status = err.status ?? err.statusCode ?? 500;
    const message = process.env.NODE_ENV === 'production' && status >= 500
        ? 'Internal Server Error'
        : err.message ?? 'Internal Server Error';
    console.error('[ErrorHandler]', err);
    return res.status(status).json({ success: false, error: message });
}

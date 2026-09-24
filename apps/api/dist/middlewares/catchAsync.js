"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
/**
 * Wraps an async route handler so unhandled promise rejections are
 * forwarded to Express's error middleware instead of crashing the process.
 */
const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
exports.catchAsync = catchAsync;

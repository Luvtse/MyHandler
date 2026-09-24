"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("./config/passport"));
const error_1 = require("./middlewares/error");
const apiService_1 = require("./services/apiService");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)('dev'));
    // Initialize Passport
    app.use(passport_1.default.initialize());
    app.use('/api', apiService_1.apiRouter);
    // Serve uploaded files
    const uploadsDir = path_1.default.resolve(process.cwd(), 'server', 'uploads');
    app.use('/files', express_1.default.static(uploadsDir));
    app.use(error_1.errorHandler);
    return app;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRouter = void 0;
const express_1 = require("express");
const apiService_1 = require("../services/apiService");
const mainRouter = (0, express_1.Router)();
exports.mainRouter = mainRouter;
mainRouter.use('/api', apiService_1.apiRouter);

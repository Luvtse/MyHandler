"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const leave_controller_1 = require("./leave.controller");
const employee_controller_1 = require("./employee.controller");
const department_controller_1 = __importDefault(require("./department.controller"));
const team_controller_1 = __importDefault(require("./team.controller"));
const correspondence_controller_1 = require("./correspondence.controller");
const router = (0, express_1.Router)();
const leaveController = new leave_controller_1.LeaveController();
// Apply auth middleware to all routes
router.use(authService_1.requireAuth);
// ========================================
// ✅ Leave Request Routes (Wrapped to preserve `this` context)
// ========================================
router.post('/leave-requests', (req, res) => leaveController.createLeaveRequest(req, res));
router.get('/leave-requests', (req, res) => leaveController.getLeaveRequests(req, res));
router.get('/leave-requests/:id', (req, res) => leaveController.getLeaveRequestById(req, res));
router.patch('/leave-requests/:id/manager-approval', (req, res) => leaveController.updateManagerApproval(req, res));
router.patch('/leave-requests/:id/hr-approval', (req, res) => leaveController.updateHrApproval(req, res));
router.get('/leave-balance/:employeeId?', (req, res) => leaveController.getEmployeeLeaveBalanceById(req, res));
router.patch('/leave-balance/:employeeId', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => leaveController.updateEmployeeLeaveBalance(req, res));
router.delete('/leave-requests/:id', (req, res) => leaveController.deleteLeaveRequest(req, res));
// ✅ NEW: Support endpoints for form dropdowns (Wrapped)
router.get('/leaves/approvers', (req, res) => leaveController.getLeaveApprovers(req, res));
router.get('/leave-types', (req, res) => leaveController.getLeaveTypes(req, res));
// ========================================
// Employee Routes
// ========================================
// Employee self-access routes (for all employee roles)
router.get('/employees/self', (req, res) => employee_controller_1.employeeController.getSelf(req, res));
router.get('/employees/colleagues', (req, res) => employee_controller_1.employeeController.getColleagues(req, res));
// Employee routes (HR only)
router.get('/employees', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.getAll(req, res));
router.get('/employees/export', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.exportCsv(req, res));
router.get('/employees/org-chart', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.getOrgChart(req, res));
router.get('/employees/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.getById(req, res));
router.post('/employees', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.create(req, res));
router.patch('/employees/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.update(req, res));
router.delete('/employees/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.delete(req, res));
// ========================================
// Department Routes (HR only)
// ========================================
router.post('/departments', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => department_controller_1.default.create(req, res));
router.get('/departments', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => department_controller_1.default.getAll(req, res));
router.get('/departments/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => department_controller_1.default.getById(req, res));
router.patch('/departments/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => department_controller_1.default.update(req, res));
router.delete('/departments/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => department_controller_1.default.delete(req, res));
// ========================================
// Team Routes (HR only)
// ========================================
router.get('/teams', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => team_controller_1.default.getAll(req, res));
router.post('/teams', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => team_controller_1.default.create(req, res));
router.get('/teams/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => team_controller_1.default.getById(req, res));
router.patch('/teams/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => team_controller_1.default.update(req, res));
router.delete('/teams/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => team_controller_1.default.delete(req, res));
// ========================================
// Correspondence Routes (HR only)
// ========================================
router.get('/correspondence', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => correspondence_controller_1.correspondenceController.getAll(req, res));
router.get('/correspondence/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => correspondence_controller_1.correspondenceController.getById(req, res));
router.post('/correspondence', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => correspondence_controller_1.correspondenceController.create(req, res));
router.patch('/correspondence/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => correspondence_controller_1.correspondenceController.update(req, res));
router.delete('/correspondence/:id', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => correspondence_controller_1.correspondenceController.delete(req, res));
// Convenience alias for org-chart
router.get('/org-chart', (0, authService_1.requireRole)(['admin', 'hr_manager']), (req, res) => employee_controller_1.employeeController.getOrgChart(req, res));
exports.hrRouter = router;

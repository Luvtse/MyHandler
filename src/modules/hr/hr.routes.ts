import { Router } from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import { LeaveController } from './leave.controller';
import { employeeController } from './employee.controller';
import departmentController from './department.controller';
import teamController from './team.controller';
import { correspondenceController } from './correspondence.controller';

const router = Router();
const leaveController = new LeaveController();

// Apply auth middleware to all routes
router.use(requireAuth);

// ========================================
// ✅ Leave Request Routes (Wrapped to preserve `this` context)
// ========================================
router.post('/leave-requests', (req, res) => leaveController.createLeaveRequest(req, res));
router.get('/leave-requests', (req, res) => leaveController.getLeaveRequests(req, res));
router.get('/leave-requests/:id', (req, res) => leaveController.getLeaveRequestById(req, res));
router.patch('/leave-requests/:id/manager-approval', (req, res) => leaveController.updateManagerApproval(req, res));
router.patch('/leave-requests/:id/hr-approval', (req, res) => leaveController.updateHrApproval(req, res));
router.get('/leave-balance/:employeeId?', (req, res) => leaveController.getEmployeeLeaveBalanceById(req, res));
router.patch('/leave-balance/:employeeId', requireRole(['admin', 'hr_manager']), (req, res) => leaveController.updateEmployeeLeaveBalance(req, res));
router.delete('/leave-requests/:id', (req, res) => leaveController.deleteLeaveRequest(req, res));

// ✅ NEW: Support endpoints for form dropdowns (Wrapped)
router.get('/leaves/approvers', (req, res) => leaveController.getLeaveApprovers(req, res));
router.get('/leave-types', (req, res) => leaveController.getLeaveTypes(req, res));

// ========================================
// Employee Routes
// ========================================
// Employee self-access routes (for all employee roles)
router.get('/employees/self', (req, res) => employeeController.getSelf(req, res)); 
router.get('/employees/colleagues', (req, res) => employeeController.getColleagues(req, res)); 

// Employee routes (HR only)
router.get('/employees', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.getAll(req, res));
router.get('/employees/export', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.exportCsv(req, res));
router.get('/employees/org-chart', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.getOrgChart(req, res));
router.get('/employees/:id', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.getById(req, res));
router.post('/employees', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.create(req, res));
router.patch('/employees/:id', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.update(req, res));
router.delete('/employees/:id', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.delete(req, res));

// ========================================
// Department Routes (HR only)
// ========================================
router.post('/departments', requireRole(['admin', 'hr_manager']), (req, res) => departmentController.create(req, res));
router.get('/departments', requireRole(['admin', 'hr_manager']), (req, res) => departmentController.getAll(req, res));
router.get('/departments/:id', requireRole(['admin', 'hr_manager']), (req, res) => departmentController.getById(req, res));
router.patch('/departments/:id', requireRole(['admin', 'hr_manager']), (req, res) => departmentController.update(req, res));
router.delete('/departments/:id', requireRole(['admin', 'hr_manager']), (req, res) => departmentController.delete(req, res));

// ========================================
// Team Routes (HR only)
// ========================================
router.get('/teams', requireRole(['admin', 'hr_manager']), (req, res) => teamController.getAll(req, res));
router.post('/teams', requireRole(['admin', 'hr_manager']), (req, res) => teamController.create(req, res));
router.get('/teams/:id', requireRole(['admin', 'hr_manager']), (req, res) => teamController.getById(req, res));
router.patch('/teams/:id', requireRole(['admin', 'hr_manager']), (req, res) => teamController.update(req, res));
router.delete('/teams/:id', requireRole(['admin', 'hr_manager']), (req, res) => teamController.delete(req, res));

// ========================================
// Correspondence Routes (HR only)
// ========================================
router.get('/correspondence', requireRole(['admin', 'hr_manager']), (req, res) => correspondenceController.getAll(req, res));
router.get('/correspondence/:id', requireRole(['admin', 'hr_manager']), (req, res) => correspondenceController.getById(req, res));
router.post('/correspondence', requireRole(['admin', 'hr_manager']), (req, res) => correspondenceController.create(req, res));
router.patch('/correspondence/:id', requireRole(['admin', 'hr_manager']), (req, res) => correspondenceController.update(req, res));
router.delete('/correspondence/:id', requireRole(['admin', 'hr_manager']), (req, res) => correspondenceController.delete(req, res));

// Convenience alias for org-chart
router.get('/org-chart', requireRole(['admin', 'hr_manager']), (req, res) => employeeController.getOrgChart(req, res));

export const hrRouter = router;
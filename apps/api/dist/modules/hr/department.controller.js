"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const zod_1 = require("zod");
const validateRequest = (data, schema) => schema.parse(data);
// Validation schemas
const createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string(),
});
const updateDepartmentSchema = createDepartmentSchema.partial().extend({
    id: zod_1.z.string(),
});
// Controller functions
exports.departmentController = {
    // Create a new department
    async create(req, res) {
        try {
            const data = validateRequest(req.body, createDepartmentSchema);
            const manager = await prisma_1.default.employee.findUnique({
                where: { id: data.managerId },
                select: { id: true },
            });
            if (!manager) {
                return res.status(404).json({ error: 'Department manager not found' });
            }
            const department = await prisma_1.default.department.create({
                data: {
                    name: data.name,
                    description: data.description,
                    managerId: data.managerId,
                },
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                },
            });
            return res.status(201).json(department);
        }
        catch (error) {
            console.error('Error creating department:', error);
            return res.status(500).json({ error: 'Failed to create department' });
        }
    },
    // Get all departments
    async getAll(req, res) {
        try {
            const departments = await prisma_1.default.department.findMany({
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                    _count: {
                        select: {
                            employees: true,
                            teams: true,
                        },
                    },
                },
            });
            return res.status(200).json(departments);
        }
        catch (error) {
            console.error('Error fetching departments:', error);
            return res.status(500).json({ error: 'Failed to fetch departments' });
        }
    },
    // Get department by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const department = await prisma_1.default.department.findUnique({
                where: { id },
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                    employees: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                            employmentStatus: true,
                        },
                    },
                    teams: {
                        include: {
                            leader: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    position: true,
                                },
                            },
                            _count: {
                                select: {
                                    employees: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
            }
            return res.status(200).json(department);
        }
        catch (error) {
            console.error('Error fetching department:', error);
            return res.status(500).json({ error: 'Failed to fetch department' });
        }
    },
    // Update department
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = validateRequest(req.body, updateDepartmentSchema);
            // Check if department exists
            const existingDepartment = await prisma_1.default.department.findUnique({
                where: { id },
            });
            if (!existingDepartment) {
                return res.status(404).json({ error: 'Department not found' });
            }
            if (data.managerId !== undefined) {
                const manager = await prisma_1.default.employee.findUnique({
                    where: { id: data.managerId },
                    select: { id: true },
                });
                if (!manager) {
                    return res.status(404).json({ error: 'Department manager not found' });
                }
            }
            // Update department
            const department = await prisma_1.default.department.update({
                where: { id },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.managerId !== undefined ? { managerId: data.managerId } : {}),
                },
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                },
            });
            return res.status(200).json(department);
        }
        catch (error) {
            console.error('Error updating department:', error);
            return res.status(500).json({ error: 'Failed to update department' });
        }
    },
    // Delete department
    async delete(req, res) {
        try {
            const { id } = req.params;
            // Check if department exists
            const existingDepartment = await prisma_1.default.department.findUnique({
                where: { id },
                include: {
                    employees: true,
                    teams: true,
                },
            });
            if (!existingDepartment) {
                return res.status(404).json({ error: 'Department not found' });
            }
            // Check if department has employees or teams
            if (existingDepartment.employees.length > 0 || existingDepartment.teams.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete department with employees or teams',
                    employeeCount: existingDepartment.employees.length,
                    teamCount: existingDepartment.teams.length
                });
            }
            // Delete department
            await prisma_1.default.department.delete({
                where: { id },
            });
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting department:', error);
            return res.status(500).json({ error: 'Failed to delete department' });
        }
    },
};
exports.default = exports.departmentController;

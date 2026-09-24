"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const zod_1 = require("zod");
const validateRequest = (data, schema) => schema.parse(data);
// Validation schemas
const createTeamSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.string(),
    leaderId: zod_1.z.string(),
});
const updateTeamSchema = createTeamSchema.partial().extend({
    id: zod_1.z.string(),
});
// Controller functions
exports.teamController = {
    // Create a new team
    async create(req, res) {
        try {
            const data = validateRequest(req.body, createTeamSchema);
            // Check if department exists
            const department = await prisma_1.default.department.findUnique({
                where: { id: data.departmentId },
            });
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
            }
            const leader = await prisma_1.default.employee.findUnique({
                where: { id: data.leaderId },
                select: { id: true },
            });
            if (!leader) {
                return res.status(404).json({ error: 'Team leader not found' });
            }
            const team = await prisma_1.default.team.create({
                data: {
                    name: data.name,
                    description: data.description,
                    departmentId: data.departmentId,
                    leaderId: data.leaderId,
                },
                include: {
                    department: true,
                    leader: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                },
            });
            return res.status(201).json(team);
        }
        catch (error) {
            console.error('Error creating team:', error);
            return res.status(500).json({ error: 'Failed to create team' });
        }
    },
    // Get all teams
    async getAll(req, res) {
        try {
            const teams = await prisma_1.default.team.findMany({
                include: {
                    department: true,
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
            });
            return res.status(200).json(teams);
        }
        catch (error) {
            console.error('Error fetching teams:', error);
            return res.status(500).json({ error: 'Failed to fetch teams' });
        }
    },
    // Get team by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const team = await prisma_1.default.team.findUnique({
                where: { id },
                include: {
                    department: true,
                    leader: {
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
                },
            });
            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }
            return res.status(200).json(team);
        }
        catch (error) {
            console.error('Error fetching team:', error);
            return res.status(500).json({ error: 'Failed to fetch team' });
        }
    },
    // Update team
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = validateRequest(req.body, updateTeamSchema);
            // Check if team exists
            const existingTeam = await prisma_1.default.team.findUnique({
                where: { id },
            });
            if (!existingTeam) {
                return res.status(404).json({ error: 'Team not found' });
            }
            if (data.departmentId !== undefined) {
                const department = await prisma_1.default.department.findUnique({
                    where: { id: data.departmentId },
                    select: { id: true },
                });
                if (!department) {
                    return res.status(404).json({ error: 'Department not found' });
                }
            }
            if (data.leaderId !== undefined) {
                const leader = await prisma_1.default.employee.findUnique({
                    where: { id: data.leaderId },
                    select: { id: true },
                });
                if (!leader) {
                    return res.status(404).json({ error: 'Team leader not found' });
                }
            }
            // Update team
            const team = await prisma_1.default.team.update({
                where: { id },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
                    ...(data.leaderId !== undefined ? { leaderId: data.leaderId } : {}),
                },
                include: {
                    department: true,
                    leader: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                        },
                    },
                },
            });
            return res.status(200).json(team);
        }
        catch (error) {
            console.error('Error updating team:', error);
            return res.status(500).json({ error: 'Failed to update team' });
        }
    },
    // Delete team
    async delete(req, res) {
        try {
            const { id } = req.params;
            // Check if team exists
            const existingTeam = await prisma_1.default.team.findUnique({
                where: { id },
                include: {
                    employees: true,
                },
            });
            if (!existingTeam) {
                return res.status(404).json({ error: 'Team not found' });
            }
            // Check if team has employees
            if (existingTeam.employees.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete team with employees',
                    employeeCount: existingTeam.employees.length
                });
            }
            // Delete team
            await prisma_1.default.team.delete({
                where: { id },
            });
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting team:', error);
            return res.status(500).json({ error: 'Failed to delete team' });
        }
    },
    // Add employee to team
    async addEmployee(req, res) {
        try {
            const { id } = req.params;
            const { employeeId } = req.body;
            if (!employeeId) {
                return res.status(400).json({ error: 'Employee ID is required' });
            }
            // Check if team exists
            const team = await prisma_1.default.team.findUnique({
                where: { id },
            });
            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }
            // Check if employee exists
            const employee = await prisma_1.default.employee.findUnique({
                where: { id: employeeId },
            });
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            // Update employee's team
            const updatedEmployee = await prisma_1.default.employee.update({
                where: { id: employeeId },
                data: {
                    teamId: id,
                },
            });
            return res.status(200).json(updatedEmployee);
        }
        catch (error) {
            console.error('Error adding employee to team:', error);
            return res.status(500).json({ error: 'Failed to add employee to team' });
        }
    },
    // Remove employee from team
    async removeEmployee(req, res) {
        try {
            const { id, employeeId } = req.params;
            // Check if team exists
            const team = await prisma_1.default.team.findUnique({
                where: { id },
            });
            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }
            // Check if employee exists and belongs to the team
            const employee = await prisma_1.default.employee.findFirst({
                where: {
                    id: employeeId,
                    teamId: id,
                },
            });
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found in this team' });
            }
            // Remove employee from team
            const updatedEmployee = await prisma_1.default.employee.update({
                where: { id: employeeId },
                data: {
                    teamId: null,
                },
            });
            return res.status(200).json(updatedEmployee);
        }
        catch (error) {
            console.error('Error removing employee from team:', error);
            return res.status(500).json({ error: 'Failed to remove employee from team' });
        }
    },
};
exports.default = exports.teamController;

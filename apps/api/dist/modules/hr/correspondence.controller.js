"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correspondenceController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const zod_1 = require("zod");
const createCorrespondenceSchema = zod_1.z.object({
    employeeId: zod_1.z.string(),
    type: zod_1.z.enum(['OFFER_LETTER', 'CONTRACT', 'WARNING', 'PROMOTION', 'TERMINATION', 'GENERAL']),
    subject: zod_1.z.string(),
    content: zod_1.z.string(),
});
const updateCorrespondenceSchema = createCorrespondenceSchema.partial();
exports.correspondenceController = {
    // Get all correspondence
    async getAll(req, res) {
        try {
            const correspondence = await prisma_1.default.correspondence.findMany({
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        },
                    },
                    // Remove sentByUser - it doesn't exist in your schema
                },
                orderBy: { sentDate: 'desc' },
            });
            // Add user info manually since there's no relation
            const userId = req.user?.sub;
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            const correspondenceWithUser = correspondence.map(item => ({
                ...item,
                sentByUser: user || { name: 'System' }
            }));
            return res.status(200).json(correspondenceWithUser);
        }
        catch (error) {
            console.error('Error fetching correspondence:', error);
            return res.status(500).json({ error: 'Failed to fetch correspondence' });
        }
    },
    // Get correspondence by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const correspondence = await prisma_1.default.correspondence.findUnique({
                where: { id },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        },
                    },
                },
            });
            if (!correspondence) {
                return res.status(404).json({ error: 'Correspondence not found' });
            }
            // Add user info manually
            const user = await prisma_1.default.user.findUnique({
                where: { id: correspondence.sentBy },
                select: { name: true }
            });
            const correspondenceWithUser = {
                ...correspondence,
                sentByUser: user || { name: 'System' }
            };
            return res.status(200).json(correspondenceWithUser);
        }
        catch (error) {
            console.error('Error fetching correspondence:', error);
            return res.status(500).json({ error: 'Failed to fetch correspondence' });
        }
    },
    // Create new correspondence
    async create(req, res) {
        try {
            const data = createCorrespondenceSchema.parse(req.body);
            const userId = req.user?.sub;
            // Verify employee exists
            const employee = await prisma_1.default.employee.findUnique({
                where: { id: data.employeeId },
                select: { id: true },
            });
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            // Convert string type to enum type
            const correspondenceType = data.type;
            const correspondence = await prisma_1.default.correspondence.create({
                data: {
                    employeeId: data.employeeId,
                    type: correspondenceType,
                    subject: data.subject,
                    content: data.content,
                    sentBy: userId,
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        },
                    },
                },
            });
            // Add user info for response
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            const responseWithUser = {
                ...correspondence,
                sentByUser: user || { name: 'System' }
            };
            return res.status(201).json(responseWithUser);
        }
        catch (error) {
            console.error('Error creating correspondence:', error);
            return res.status(500).json({ error: 'Failed to create correspondence' });
        }
    },
    // Update correspondence
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = updateCorrespondenceSchema.parse(req.body);
            const existing = await prisma_1.default.correspondence.findUnique({
                where: { id },
            });
            if (!existing) {
                return res.status(404).json({ error: 'Correspondence not found' });
            }
            // Build update data safely
            const updateData = {};
            if (data.employeeId !== undefined)
                updateData.employeeId = data.employeeId;
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.subject !== undefined)
                updateData.subject = data.subject;
            if (data.content !== undefined)
                updateData.content = data.content;
            const correspondence = await prisma_1.default.correspondence.update({
                where: { id },
                data: updateData,
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        },
                    },
                },
            });
            // Add user info for response
            const user = await prisma_1.default.user.findUnique({
                where: { id: correspondence.sentBy },
                select: { name: true }
            });
            const responseWithUser = {
                ...correspondence,
                sentByUser: user || { name: 'System' }
            };
            return res.status(200).json(responseWithUser);
        }
        catch (error) {
            console.error('Error updating correspondence:', error);
            return res.status(500).json({ error: 'Failed to update correspondence' });
        }
    },
    // Delete correspondence
    async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_1.default.correspondence.findUnique({
                where: { id },
            });
            if (!existing) {
                return res.status(404).json({ error: 'Correspondence not found' });
            }
            await prisma_1.default.correspondence.delete({
                where: { id },
            });
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting correspondence:', error);
            return res.status(500).json({ error: 'Failed to delete correspondence' });
        }
    },
};

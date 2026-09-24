"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.usersService = {
    async findAll(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const where = buildWhereClause(filters);
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    profilePicture: true,
                    businessAccountCode: true,
                    createdAt: true,
                    secondaryRoles: {
                        select: {
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.user.count({ where })
        ]);
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    },
    async findById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
            include: {
                secondaryRoles: {
                    select: {
                        role: true
                    }
                }
            }
        });
    },
    async create(data) {
        return prisma_1.default.user.create({
            data: {
                email: data.email,
                password: data.password, // Should be hashed before passing to this function
                name: data.name,
                role: data.role,
                phone: data.phone,
                profilePicture: data.profilePicture,
                businessAccountCode: data.businessAccountCode
            }
        });
    },
    async update(id, data) {
        return prisma_1.default.user.update({
            where: { id },
            data
        });
    },
    async delete(id) {
        return prisma_1.default.user.delete({
            where: { id }
        });
    },
    async addRole(userId, role) {
        return prisma_1.default.userSecondaryRole.create({
            data: {
                userId,
                role
            }
        });
    },
    async removeRole(userId, role) {
        return prisma_1.default.userSecondaryRole.deleteMany({
            where: {
                userId,
                role
            }
        });
    },
    async activate(userId) {
        // Implement user activation logic if needed
        return prisma_1.default.user.update({
            where: { id: userId },
            data: { /* activation fields */}
        });
    },
    async deactivate(userId) {
        // Implement user deactivation logic if needed
        return prisma_1.default.user.update({
            where: { id: userId },
            data: { /* deactivation fields */}
        });
    },
    async bulkDelete(userIds) {
        return prisma_1.default.user.deleteMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });
    },
    async bulkAssignRole(userIds, role) {
        // This would require a transaction to ensure all operations succeed or fail together
        return prisma_1.default.$transaction(userIds.map(userId => prisma_1.default.userSecondaryRole.create({
            data: {
                userId,
                role
            }
        })));
    }
};
function buildWhereClause(filters) {
    const where = {};
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
        ];
    }
    if (filters.role) {
        where.role = filters.role;
    }
    return where;
}

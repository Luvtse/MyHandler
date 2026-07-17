import prisma from '../../utils/prisma';
import { UserRole } from '@prisma/client';

export const usersService = {
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = buildWhereClause(filters);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where })
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
  
  async findById(id: string) {
    return prisma.user.findUnique({
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
  
  async create(data: any) {
    return prisma.user.create({
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
  
  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data
    });
  },
  
  async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  },
  
  async addRole(userId: string, role: UserRole) {
    return prisma.userSecondaryRole.create({
      data: {
        userId,
        role
      }
    });
  },
  
  async removeRole(userId: string, role: UserRole) {
    return prisma.userSecondaryRole.deleteMany({
      where: {
        userId,
        role
      }
    });
  },
  
  async activate(userId: string) {
    // Implement user activation logic if needed
    return prisma.user.update({
      where: { id: userId },
      data: { /* activation fields */ }
    });
  },
  
  async deactivate(userId: string) {
    // Implement user deactivation logic if needed
    return prisma.user.update({
      where: { id: userId },
      data: { /* deactivation fields */ }
    });
  },
  
  async bulkDelete(userIds: string[]) {
    return prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });
  },
  
  async bulkAssignRole(userIds: string[], role: UserRole) {
    // This would require a transaction to ensure all operations succeed or fail together
    return prisma.$transaction(
      userIds.map(userId => 
        prisma.userSecondaryRole.create({
          data: {
            userId,
            role
          }
        })
      )
    );
  }
};

function buildWhereClause(filters: any) {
  const where: any = {};
  
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
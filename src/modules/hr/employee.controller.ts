import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';

const prisma = new PrismaClient();
const validateRequest = <S extends z.ZodTypeAny>(data: unknown, schema: S): z.infer<S> => schema.parse(data);

// Validation schemas
const createEmployeeSchema = z.object({
  userId: z.string(),
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  position: z.string(),
  employmentStatus: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'PROBATION', 'REMOTE']).default('ACTIVE'),
  joinDate: z.string(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  managerId: z.string().optional(),
  salary: z.number().optional(),
  bankDetails: z.string().optional(),
  taxId: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// Default leave entitlements
const DEFAULT_LEAVE_ENTITLEMENTS = {
  annualLeave: 21,
  sickLeave: 10,
  personalLeave: 5,
};

const employeeSelect = {
  id: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
    },
  },
  employeeId: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  nationality: true,
  address: true,
  emergencyContact: true,
  position: true,
  employmentStatus: true,
  joinDate: true,
  departmentId: true,
  teamId: true,
  managerId: true,
  department: true,
  team: true,
  manager: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
    },
  },
  salary: true,
  bankDetails: true,
  taxId: true,
  phone: true,
} as const;

const employeeDetailSelect = {
  ...employeeSelect,
  subordinates: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      employeeId: true,
      employmentStatus: true,
      user: {
        select: {
          email: true,
          profilePicture: true,
        },
      },
    },
  },
  documents: {
    select: {
      id: true,
      name: true,
      type: true,
      url: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

function parsePage(input: unknown, fallback: number): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function parseLimit(input: unknown, fallback: number): number {
  const allowed = new Set([10, 25, 50]);
  const n = Number(input);
  if (!Number.isFinite(n)) return fallback;
  const v = Math.floor(n);
  if (allowed.has(v)) return v;
  return fallback;
}

function normalizeString(input: unknown): string | undefined {
  const v = typeof input === 'string' ? input.trim() : '';
  return v ? v : undefined;
}

function buildEmployeeWhere(filters: {
  search?: string;
  departmentId?: string;
  teamId?: string;
  status?: string;
}) {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { employeeId: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.teamId) where.teamId = filters.teamId;

  if (filters.status) {
    const s = filters.status.toLowerCase();
    if (s === 'active') where.employmentStatus = { not: 'TERMINATED' };
    if (s === 'inactive') where.employmentStatus = 'TERMINATED';
  }

  return where;
}

async function getAnnualLeaveSummary(employeeId: string) {
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

  const [usedAgg, pendingCount] = await Promise.all([
    prisma.leave.aggregate({
      where: {
        employeeId,
        leaveType: 'ANNUAL',
        status: 'APPROVED',
        startDate: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { totalDays: true },
    }),
    prisma.leave.count({
      where: {
        employeeId,
        status: 'PENDING',
      },
    }),
  ]);

  const allocatedDays = 21;
  const usedDays = Number(usedAgg._sum.totalDays || 0);
  const balanceDays = Math.max(0, allocatedDays - usedDays);

  return {
    year: now.getUTCFullYear(),
    allocatedDays,
    usedDays,
    balanceDays,
    pendingRequests: pendingCount,
  };
}

// Controller functions
export const employeeController = {
  // Create a new employee
  async create(req: Request, res: Response) {
    try {
      const data = validateRequest(req.body, createEmployeeSchema);
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if employee ID is unique
      const existingEmployee = await prisma.employee.findUnique({
        where: { employeeId: data.employeeId },
      });
      
      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
      
      // Parse date fields
      const joinDate = new Date(data.joinDate);
      const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
      
      // Use transaction to create employee AND leave balance atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create employee
        const employee = await tx.employee.create({
          data: {
            userId: data.userId,
            employeeId: data.employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth,
            gender: data.gender,
            nationality: data.nationality,
            address: data.address,
            emergencyContact: data.emergencyContact,
            position: data.position,
            employmentStatus: data.employmentStatus,
            joinDate,
            departmentId: data.departmentId,
            teamId: data.teamId,
            managerId: data.managerId,
            salary: data.salary,
            bankDetails: data.bankDetails,
            taxId: data.taxId,
          },
          select: employeeSelect,
        });

        // Create initial leave balance record
        await tx.leaveBalance.create({
          data: {
            employeeId: employee.id,
            annualLeave: DEFAULT_LEAVE_ENTITLEMENTS.annualLeave,
            sickLeave: DEFAULT_LEAVE_ENTITLEMENTS.sickLeave,
            personalLeave: DEFAULT_LEAVE_ENTITLEMENTS.personalLeave,
          },
        });

        return employee;
      });

      return res.status(201).json({ data: result });
    } catch (error) {
      console.error('Error creating employee:', error);
      return res.status(500).json({ error: 'Failed to create employee' });
    }
  },
  
  // Get current employee's own profile
async getSelf(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        manager: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching self employee:', error);
    return res.status(500).json({ error: 'Failed to fetch employee profile' });
  }
},

// Get colleagues (other employees in same department/team)
async getColleagues(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true, departmentId: true, teamId: true }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    // Get colleagues from same team, or same department if no team
    const colleagues = await prisma.employee.findMany({
      where: {
        id: { not: employee.id },
        OR: [
          { teamId: employee.teamId },
          { departmentId: employee.departmentId }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return res.status(200).json(colleagues);
  } catch (error) {
    console.error('Error fetching colleagues:', error);
    return res.status(500).json({ error: 'Failed to fetch colleagues' });
  }
},

  // Get all employees
  async getAll(req: Request, res: Response) {
    try {
      const page = parsePage((req.query as any).page, 1);
      const limit = parseLimit((req.query as any).limit, 25);
      const search = normalizeString((req.query as any).search);
      const departmentId = normalizeString((req.query as any).department);
      const teamId = normalizeString((req.query as any).team);
      const status = normalizeString((req.query as any).status);

      const where = buildEmployeeWhere({ search, departmentId, teamId, status });
      const skip = (page - 1) * limit;

      const [rows, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          select: employeeSelect,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.employee.count({ where }),
      ]);

      return res.status(200).json({
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
  },
  
  // Get employee by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const employee = await prisma.employee.findUnique({
        where: { id },
        select: employeeDetailSelect,
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const leaveSummary = await getAnnualLeaveSummary(employee.id);

      const docs = (employee as any).documents || [];
      const documents = docs.length
        ? docs
        : [
            {
              id: 'mock-1',
              name: 'Onboarding Checklist',
              type: 'PDF',
              url: '#',
              createdAt: new Date().toISOString(),
            },
          ];

      return res.status(200).json({
        data: {
          ...employee,
          leaveSummary,
          documents,
        },
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
  },
  
  // Update employee
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = validateRequest(req.body, updateEmployeeSchema);
      
      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { id },
      });
      
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Parse date fields if provided
      const joinDate = data.joinDate ? new Date(data.joinDate) : undefined;
      const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
      
      // Update employee
      const employee = await prisma.employee.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth,
          gender: data.gender,
          nationality: data.nationality,
          address: data.address,
          emergencyContact: data.emergencyContact,
          position: data.position,
          employmentStatus: data.employmentStatus as any,
          joinDate,
          departmentId: data.departmentId,
          teamId: data.teamId,
          managerId: data.managerId,
          salary: data.salary,
          bankDetails: data.bankDetails,
          taxId: data.taxId,
        },
        select: employeeSelect,
      });
      
      return res.status(200).json({ data: employee });
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ error: 'Failed to update employee' });
    }
  },
  
  // Delete employee
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { id },
      });
      
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Delete employee
      await prisma.employee.delete({
        where: { id },
      });
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).json({ error: 'Failed to delete employee' });
    }
  },
  
  // Get organization chart
  async getOrgChart(req: Request, res: Response) {
    try {
      // Get all employees with their managers
      const employees = await prisma.employee.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          managerId: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      // Build organization chart
      const orgChart = buildOrgChart(employees);
      
      return res.status(200).json({ data: orgChart });
    } catch (error) {
      console.error('Error fetching organization chart:', error);
      return res.status(500).json({ error: 'Failed to fetch organization chart' });
    }
  },

  async exportCsv(req: Request, res: Response) {
    try {
      const search = normalizeString((req.query as any).search);
      const departmentId = normalizeString((req.query as any).department);
      const teamId = normalizeString((req.query as any).team);
      const status = normalizeString((req.query as any).status);

      const where = buildEmployeeWhere({ search, departmentId, teamId, status });

      const rows = await prisma.employee.findMany({
        where,
        select: employeeSelect,
        orderBy: { createdAt: 'desc' },
        take: 5000,
      });

      const flat = rows.map((e: any) => ({
        employeeId: e.employeeId,
        fullName: `${e.firstName} ${e.lastName}`.trim(),
        email: e.user?.email || '',
        position: e.position,
        department: e.department?.name || '',
        team: e.team?.name || '',
        status: e.employmentStatus,
        joinDate: e.joinDate ? new Date(e.joinDate).toISOString().slice(0, 10) : '',
      }));

      const parser = new Parser({
        fields: ['employeeId', 'fullName', 'email', 'position', 'department', 'team', 'status', 'joinDate'],
      });
      const csv = parser.parse(flat);

      const ts = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="employees_${ts}.csv"`);
      return res.status(200).send(csv);
    } catch (error) {
      console.error('Error exporting employees csv:', error);
      return res.status(500).json({ error: 'Failed to export employees' });
    }
  },
};

// Helper function to build organization chart
function buildOrgChart(employees: any[]) {
  const employeeMap = new Map();
  const rootNodes: any[] = [];
  
  // Create nodes for each employee
  employees.forEach(employee => {
    employeeMap.set(employee.id, {
      ...employee,
      children: [],
    });
  });
  
  // Build tree structure
  employees.forEach(employee => {
    const node = employeeMap.get(employee.id);
    
    if (employee.managerId && employeeMap.has(employee.managerId)) {
      // Add as child to manager
      const manager = employeeMap.get(employee.managerId);
      manager.children.push(node);
    } else {
      // No manager, add as root node
      rootNodes.push(node);
    }
  });
  
  return rootNodes;
}

export default employeeController;
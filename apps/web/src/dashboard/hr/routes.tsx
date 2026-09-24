// src/dashboard/hr/routes.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import HRDashboardPage from '@/dashboard/hr/HRDashboardPage';
import HRRoleGuard from '@/features/components/HRRoleGuard';
import OrgChartPage from '@/dashboard/hr/OrgChartPage';
import HRReportsPage from '@/dashboard/hr/HRReportsPage';
import LeaveManagement from '@/dashboard/hr/LeaveManagement';
import { EmployeeLeaveInspector } from '@/dashboard/hr/EmployeeLeaveInspector';
import { apiService } from '@/lib/api/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EmployeeDetail } from '@/dashboard/hr/EmployeeDetail';
import { EmployeeEditForm } from '@/dashboard/hr/EmployeeEditForm';
import { DepartmentForm } from '@/dashboard/hr/DepartmentForm';
import { TeamForm } from '@/dashboard/hr/TeamForm';
import { CorrespondenceList } from '@/dashboard/hr/CorrespondenceList';
import { CorrespondenceForm } from '@/dashboard/hr/CorrespondenceForm';
import { CorrespondenceDetail } from '@/dashboard/hr/CorrespondenceDetail';

const HRHome = () => {
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [pendingHrLeaveCount, setPendingHrLeaveCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [{ success: empOk,  data: employeesData }, { success: leaveOk,  data: leaveData }] = await Promise.all([
          apiService.request({ method: 'GET', url: '/hr/employees' }),
          apiService.request({ method: 'GET', url: '/hr/leave-requests', params: { page: 1, limit: 50 } }),
        ]);

        const employees = Array.isArray(employeesData)
          ? employeesData
          : Array.isArray(employeesData?.data)
            ? employeesData.data
            : [];

        // The leave API returns { status:'success', leaves:[...], pagination } — there is no `.data` field.
        const leaves = Array.isArray((leaveData as any)?.leaves)
          ? (leaveData as any).leaves
          : Array.isArray(leaveData?.data)
            ? leaveData.data
            : Array.isArray(leaveData)
              ? leaveData
              : [];

        const pendingHr = leaves.filter((l: any) => l && l.hrApproval === 'PENDING').length;

        if (!active) return;
        setEmployeeCount(empOk ? employees.length : 0);
        setPendingHrLeaveCount(leaveOk ? pendingHr : 0);
      } catch {
        if (!active) return;
        setEmployeeCount(0);
        setPendingHrLeaveCount(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Employees</Typography>
              <Typography variant="h3">{employeeCount ?? 0}</Typography>
              <Button component={Link} to="/dashboard/hr/employees" sx={{ mt: 2 }} variant="outlined">
                View employees
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending HR approvals</Typography>
              <Typography variant="h3">{pendingHrLeaveCount ?? 0}</Typography>
              <Button component={Link} to="/dashboard/hr/leave-management" sx={{ mt: 2 }} variant="outlined">
                Review leave requests
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Use the buttons above to manage employees, view the org chart, and handle approvals.
        </Typography>
      </Paper>
    </Box>
  );
};

const EmployeesList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { success, data } = await apiService.request({ method: 'GET', url: '/hr/employees' });
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (!active) return;
        setEmployees(success ? list : []);
        setError(null);
      } catch {
        if (!active) return;
        setEmployees([]);
        setError('Failed to load employees');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    return employees.map((e) => ({
      id: e.id,
      name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeId || e.id,
      position: e.position || '',
      status: e.employmentStatus || '',
      department: e.department?.name || '',
      team: e.team?.name || '',
    }));
  }, [employees]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Employees</Typography>
        <Button component={Link} to="/dashboard/hr/employees/new" variant="contained">
          New employee
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/hr/employees/${row.id}`)}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.team}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No employees found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Department List Component
const DepartmentsList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { success, data } = await apiService.request({ method: 'GET', url: '/hr/departments' });
        const list = Array.isArray(data) ? data : [];
        if (!active) return;
        setDepartments(success ? list : []);
        setError(null);
      } catch {
        if (!active) return;
        setDepartments([]);
        setError('Failed to load departments');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      manager: dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'Unassigned',
      employeeCount: dept._count?.employees || 0,
      teamCount: dept._count?.teams || 0,
    }));
  }, [departments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Departments</Typography>
        <Button component={Link} to="/dashboard/hr/departments/new" variant="contained">
          New department
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell>Teams</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/hr/departments/${row.id}`)}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.manager}</TableCell>
                <TableCell>{row.employeeCount}</TableCell>
                <TableCell>{row.teamCount}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No departments found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Teams List Component
const TeamsList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { success, data } = await apiService.request({ method: 'GET', url: '/hr/teams' });
        const list = Array.isArray(data) ? data : [];
        if (!active) return;
        setTeams(success ? list : []);
        setError(null);
      } catch {
        if (!active) return;
        setTeams([]);
        setError('Failed to load teams');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      department: team.department?.name || 'Unassigned',
      leader: team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : 'Unassigned',
      employeeCount: team._count?.employees || 0,
    }));
  }, [teams]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Teams</Typography>
        <Button component={Link} to="/dashboard/hr/teams/new" variant="contained">
          New team
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Leader</TableCell>
              <TableCell>Members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/hr/teams/${row.id}`)}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.leader}</TableCell>
                <TableCell>{row.employeeCount}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No teams found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Generic fetch helper for the detail views below (APIs return the entity directly).
const useEntityDetail = <T extends { id: string }>(url: string) => {
  const [entity, setEntity] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { success, data } = await apiService.request({ method: 'GET', url });
        if (!active) return;
        if (success && data) {
          setEntity((data as any).data ?? data);
        } else {
          setError('Failed to load record');
        }
      } catch {
        if (active) setError('Failed to load record');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [url]);

  return { entity, loading, error };
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const DepartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entity: dept, loading, error } = useEntityDetail<any>(`/hr/departments/${id}`);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dept) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error || 'Department not found.'}</Typography>
        <Button size="small" onClick={() => navigate('/dashboard/hr/departments')} sx={{ mt: 1 }}>
          Back to departments
        </Button>
      </Box>
    );
  }

  const employees: any[] = dept.employees || [];
  const teams: any[] = dept.teams || [];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{dept.name}</Typography>
        <Button size="small" onClick={() => navigate('/dashboard/hr/departments')}>
          Back
        </Button>
      </Box>

      <DetailSection title="Overview">
        <Typography variant="body2">
          Manager:{' '}
          {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'Unassigned'}
        </Typography>
        <Typography variant="body2">Employees: {employees.length}</Typography>
        <Typography variant="body2">Teams: {teams.length}</Typography>
      </DetailSection>

      <DetailSection title="Teams">
        {teams.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No teams in this department.
          </Typography>
        ) : (
          teams.map((team: any) => (
            <Typography
              key={team.id}
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => navigate(`/dashboard/hr/teams/${team.id}`)}
            >
              {team.name}
            </Typography>
          ))
        )}
      </DetailSection>

      <DetailSection title="Employees">
        {employees.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No employees in this department.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp: any) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/hr/employees/${emp.id}`)}
                  >
                    <TableCell>
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{emp.position || '-'}</TableCell>
                    <TableCell>{emp.employmentStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DetailSection>
    </Box>
  );
};

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entity: team, loading, error } = useEntityDetail<any>(`/hr/teams/${id}`);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !team) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error || 'Team not found.'}</Typography>
        <Button size="small" onClick={() => navigate('/dashboard/hr/teams')} sx={{ mt: 1 }}>
          Back to teams
        </Button>
      </Box>
    );
  }

  const employees: any[] = team.employees || [];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{team.name}</Typography>
        <Button size="small" onClick={() => navigate('/dashboard/hr/teams')}>
          Back
        </Button>
      </Box>

      <DetailSection title="Overview">
        <Typography variant="body2">
          Department:{' '}
          {team.department ? (
            <span
              style={{ cursor: 'pointer', color: '#1976d2' }}
              onClick={() => navigate(`/dashboard/hr/departments/${team.department.id}`)}
            >
              {team.department.name}
            </span>
          ) : (
            'Unassigned'
          )}
        </Typography>
        <Typography variant="body2">
          Leader:{' '}
          {team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : 'Unassigned'}
        </Typography>
        <Typography variant="body2">Members: {employees.length}</Typography>
      </DetailSection>

      <DetailSection title="Members">
        {employees.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members in this team.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp: any) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/hr/employees/${emp.id}`)}
                  >
                    <TableCell>
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{emp.position || '-'}</TableCell>
                    <TableCell>{emp.employmentStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DetailSection>
    </Box>
  );
};

const HRRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <HRRoleGuard allowedRoles={['admin', 'hr_manager', 'hr_staff']}>
            <HRDashboardPage />
          </HRRoleGuard>
        }
      >
        <Route index element={<HRHome />} />

        {/* EMPLOYEE ROUTES - SPECIFIC BEFORE GENERAL */}
        <Route
          path="employees/new"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <EmployeeEditForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="employees/:id/edit"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <EmployeeEditForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="employees/:id"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <EmployeeDetail />
            </HRRoleGuard>
          }
        />
        <Route path="employees" element={<EmployeesList />} />

        {/* DEPARTMENT ROUTES */}
        <Route
          path="departments/new"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <DepartmentForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="departments/:id/edit"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <DepartmentForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="departments/:id"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <DepartmentDetail />
            </HRRoleGuard>
          }
        />
        <Route path="departments" element={<DepartmentsList />} />

        {/* TEAM ROUTES */}
        <Route
          path="teams/new"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <TeamForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="teams/:id/edit"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <TeamForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="teams/:id"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <TeamDetail />
            </HRRoleGuard>
          }
        />
        <Route path="teams" element={<TeamsList />} />

        {/* CORRESPONDENCE ROUTES */}
        <Route
          path="correspondence"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <CorrespondenceList />
            </HRRoleGuard>
          }
        />
        <Route
          path="correspondence/new"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <CorrespondenceForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="correspondence/:id/edit"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <CorrespondenceForm />
            </HRRoleGuard>
          }
        />
        <Route
          path="correspondence/:id"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <CorrespondenceDetail />
            </HRRoleGuard>
          }
        />

        {/* OTHER HR ROUTES */}
        <Route
          path="org-chart"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <OrgChartPage />
            </HRRoleGuard>
          }
        />
        <Route
          path="reports"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager']}>
              <HRReportsPage />
            </HRRoleGuard>
          }
        />
        <Route
          path="employees/:id/leave"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager', 'hr_staff']}>
              <EmployeeLeaveInspector />
            </HRRoleGuard>
          }
        />
        <Route
          path="leave-management"
          element={
            <HRRoleGuard allowedRoles={['admin', 'hr_manager', 'hr_staff']}>
              <LeaveManagement />
            </HRRoleGuard>
          }
        />
      </Route>
    </Routes>
  );
};

export default HRRoutes;
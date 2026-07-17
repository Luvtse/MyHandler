// src/dashboard/hr/HRDashboardPage.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Typography, Container, Button, ButtonGroup } from '@mui/material';
import { useAuth } from '@/features/auth/hooks';

const HRDashboardPage = () => {
  const { user } = useAuth();
  const canManageStructure = user?.role === 'hr_manager' || user?.role === 'admin';

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              HR Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name || user?.email}
            </Typography>
          </Box>
          <ButtonGroup variant="outlined" size="small">
            <Button component={Link} to="/dashboard/hr/employees">
              Employees
            </Button>
            <Button component={Link} to="/dashboard/hr/org-chart">
              Org Chart
            </Button>
            {canManageStructure && (
              <>
                <Button component={Link} to="/dashboard/hr/departments">
                  Departments
                </Button>
                <Button component={Link} to="/dashboard/hr/teams">
                  Teams
                </Button>
              </>
            )}
            <Button component={Link} to="/dashboard/hr/correspondence">
              Correspondence
            </Button>
            {canManageStructure && (
              <Button component={Link} to="/dashboard/hr/reports">
                Reports
              </Button>
            )}
            {canManageStructure && (
              <Button component={Link} to="/dashboard/hr/leave-management">
                Leave
              </Button>
            )}
          </ButtonGroup>
        </Box>
        <Outlet />
      </Box>
    </Container>
  );
};

export default HRDashboardPage;
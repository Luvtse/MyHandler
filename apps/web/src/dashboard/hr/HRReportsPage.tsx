import React, { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ArrowBack, BarChart, PieChart, Timeline, Download } from '@mui/icons-material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Types
interface HeadcountData {
  period: string;
  count: number;
  change: number;
}

interface TurnoverData {
  period: string;
  rate: number;
  voluntary: number;
  involuntary: number;
}

interface DepartmentData {
  id: string;
  name: string;
  employeeCount: number;
  budgetUtilization: number;
  manager: string;
}

interface PerformanceMetric {
  rating: string;
  count: number;
  percentage: number;
}

interface HRMetrics {
  totalEmployees: number;
  newHires: number;
  terminations: number;
  averageTenure: number;
  turnoverRate: number;
  diversityIndex: number;
}

interface HRReportData {
  headcountTrend: HeadcountData[];
  turnoverTrend: TurnoverData[];
  departmentDistribution: DepartmentData[];
  performanceMetrics: PerformanceMetric[];
  keyMetrics: HRMetrics;
}

function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children?: ReactNode;
  value: number;
  index: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HRReportsPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<HRReportData | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const fetchReportData = async (range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/hr/reports?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HRReportData = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      console.error('Error fetching HR report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (range: string): HRReportData => {
    // This is a fallback function - remove in production or keep for demo purposes
    const periods = range === 'month' ? 12 : range === 'quarter' ? 4 : 1;
    
    return {
      headcountTrend: Array.from({ length: periods }, (_, i) => ({
        period: `Period ${i + 1}`,
        count: Math.floor(Math.random() * 100) + 50,
        change: Math.random() * 10 - 5,
      })),
      turnoverTrend: Array.from({ length: periods }, (_, i) => ({
        period: `Period ${i + 1}`,
        rate: Math.random() * 5,
        voluntary: Math.floor(Math.random() * 10),
        involuntary: Math.floor(Math.random() * 5),
      })),
      departmentDistribution: [
        { id: '1', name: 'Engineering', employeeCount: 30, budgetUtilization: 85, manager: 'John Doe' },
        { id: '2', name: 'Sales', employeeCount: 20, budgetUtilization: 92, manager: 'Jane Smith' },
        { id: '3', name: 'Marketing', employeeCount: 15, budgetUtilization: 78, manager: 'Bob Johnson' },
        { id: '4', name: 'HR', employeeCount: 10, budgetUtilization: 95, manager: 'Alice Brown' },
        { id: '5', name: 'Finance', employeeCount: 12, budgetUtilization: 88, manager: 'Charlie Wilson' },
      ],
      performanceMetrics: [
        { rating: '5 - Outstanding', count: 10, percentage: 12 },
        { rating: '4 - Exceeds', count: 25, percentage: 30 },
        { rating: '3 - Meets', count: 40, percentage: 48 },
        { rating: '2 - Needs Improvement', count: 8, percentage: 8 },
        { rating: '1 - Unsatisfactory', count: 2, percentage: 2 },
      ],
      keyMetrics: {
        totalEmployees: 87,
        newHires: 15,
        terminations: 8,
        averageTenure: 3.2,
        turnoverRate: 9.2,
        diversityIndex: 72.5,
      },
    };
  };

  useEffect(() => {
    // For demo purposes - replace with fetchReportData(timeRange) in production
    const data = generateMockData(timeRange);
    setReportData(data);
    
    // Uncomment for production:
    // fetchReportData(timeRange);
  }, [timeRange]);

  const handleTabChange = (_event: unknown, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const handleBack = () => {
    navigate('/dashboard/hr');
  };

  const handleExport = async () => {
    try {
      // TODO: Replace with your actual export API endpoint
      const response = await fetch('/api/hr/reports/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeRange }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hr-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export report');
      console.error('Export error:', err);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading HR Reports...</Typography>
      </Box>
    );
  }

  const totalEmployees = reportData?.departmentDistribution.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0
  ) || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
          Back
        </Button>
        <Typography variant="h5" component="h1">
          <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
          HR Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download />}
          onClick={handleExport}
          disabled={!reportData}
        >
          Export Report
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1">Time Range:</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} label="Time Range" onChange={handleTimeRangeChange}>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {timeRange === 'custom' && (
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>From</InputLabel>
                <Select value="" label="From">
                  <MenuItem value="">Select date</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>To</InputLabel>
                <Select value="" label="To">
                  <MenuItem value="">Select date</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      </Paper>

      {reportData ? (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="hr report tabs">
              <Tab label="Workforce Overview" icon={<BarChart />} iconPosition="start" />
              <Tab label="Turnover Analysis" icon={<Timeline />} iconPosition="start" />
              <Tab label="Department Distribution" icon={<PieChart />} iconPosition="start" />
              <Tab label="Performance Metrics" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Headcount Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart
                        data={reportData.headcountTrend}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="count" name="Employee Count" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Metrics
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Employees</TableCell>
                            <TableCell align="right">{reportData.keyMetrics.totalEmployees}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>New Hires ({timeRange === 'year' ? 'This Year' : 'Current Period'})</TableCell>
                            <TableCell align="right">{reportData.keyMetrics.newHires}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Average Tenure</TableCell>
                            <TableCell align="right">{reportData.keyMetrics.averageTenure.toFixed(1)} years</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Turnover Rate</TableCell>
                            <TableCell align="right">{reportData.keyMetrics.turnoverRate.toFixed(1)}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Diversity Index</TableCell>
                            <TableCell align="right">{reportData.keyMetrics.diversityIndex.toFixed(1)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Turnover Rate (%)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={reportData.turnoverTrend}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="Turnover Rate (%)" stroke="#ff7300" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employees by Department
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData.departmentDistribution.map(d => ({ name: d.name, employeeCount: d.employeeCount }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="employeeCount"
                          label={({ name, value }) =>
                            `${name}: ${value} (${((value / totalEmployees) * 100).toFixed(0)}%)`
                          }
                        >
                          {reportData.departmentDistribution.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Department Breakdown
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Employees</TableCell>
                            <TableCell align="right">% of Total</TableCell>
                            <TableCell align="right">Budget Utilization</TableCell>
                            <TableCell>Manager</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.departmentDistribution.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell align="right">{row.employeeCount}</TableCell>
                              <TableCell align="right">
                                {((row.employeeCount / totalEmployees) * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell align="right">{row.budgetUtilization}%</TableCell>
                              <TableCell>{row.manager}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Rating Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart
                        data={reportData.performanceMetrics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="count" name="Number of Employees" fill="#82ca9d" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabPanel>
        </Box>
      ) : (
        <Alert severity="info">
          No report data available. Please check your connection or try again later.
        </Alert>
      )}
    </Box>
  );
};

export default HRReportsPage;
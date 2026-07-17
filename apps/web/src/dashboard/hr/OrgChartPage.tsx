import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api/client';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, ZoomIn, ZoomOut, AccountTree } from '@mui/icons-material';
import Tree from 'react-d3-tree';

const CustomNode = ({ nodeDatum, onNodeClick }: any) => {
  return (
    <g onClick={() => onNodeClick(nodeDatum)}>
      <circle r={20} fill="#1976d2" />
      <Tooltip title={`${nodeDatum.name} - ${nodeDatum.attributes?.position || 'N/A'}`}>
        <text strokeWidth="1" x="30" y="5" style={{ fill: '#333', fontSize: '14px' }}>
          {nodeDatum.name}
        </text>
      </Tooltip>
      {nodeDatum.attributes?.position && (
        <text x="30" y="20" style={{ fill: '#666', fontSize: '12px' }}>
          {nodeDatum.attributes.position}
        </text>
      )}
    </g>
  );
};

const OrgChartPage = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setLoading(true);
        const toTreeNode = (node: any): any => {
          if (!node) return null;
          const name =
            `${node.firstName || ''} ${node.lastName || ''}`.trim() ||
            node.employeeId ||
            node.id ||
            'Unknown';
          const departmentName = node.department?.name || node.department?.department?.name || '';
          return {
            id: node.id,
            name,
            attributes: {
              position: node.position || '',
              department: departmentName || '',
            },
            children: Array.isArray(node.children)
              ? node.children.map(toTreeNode).filter(Boolean)
              : [],
          };
        };

        const { success, data } = await apiService.request({ method: 'GET', url: '/hr/org-chart' });
        const roots = Array.isArray(data) ? data : [];
        const convertedRoots = success ? roots.map(toTreeNode).filter(Boolean) : [];

        const extractDepartments = (node: any, deps: Set<string>) => {
          if (node.attributes?.department) deps.add(node.attributes.department);
          if (node.children) node.children.forEach((child: any) => extractDepartments(child, deps));
        };

        const deptSet = new Set<string>();
        convertedRoots.forEach((r: any) => extractDepartments(r, deptSet));

        setOrgData(
          convertedRoots.length === 1
            ? convertedRoots[0]
            : { name: 'Organization', attributes: {}, children: convertedRoots }
        );
        setDepartments(Array.from(deptSet).filter(Boolean));
        setError(null);
      } catch (_err) {
        setError('Failed to load organization chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();

    const dimensions = {
      width: window.innerWidth - 40,
      height: window.innerHeight - 200,
    };
    setTranslate({ x: dimensions.width / 2, y: 50 });
  }, []);

  const handleNodeClick = (nodeDatum: any) => {
    if (nodeDatum?.id) {
      navigate(`/dashboard/hr/employees/${nodeDatum.id}`);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/hr');
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleDepartmentChange = (event: any) => {
    setSelectedDepartment(event.target.value);
  };

  const getFilteredOrgData = () => {
    if (selectedDepartment === 'all') {
      return orgData;
    }

    const filterByDepartment = (node: any): any => {
      if (!node) return null;

      const nodeInDept = node.attributes?.department === selectedDepartment;
      const filteredChildren = node.children
        ? node.children.map((child: any) => filterByDepartment(child)).filter(Boolean)
        : [];

      if (nodeInDept || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return filterByDepartment(orgData);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
          Back to HR Dashboard
        </Button>
      </Box>
    );
  }

  const filteredData = getFilteredOrgData();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
          Back
        </Button>
        <Typography variant="h5" component="h1">
          <AccountTree sx={{ mr: 1, verticalAlign: 'middle' }} />
          Organization Chart
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={handleDepartmentChange}
              size="small"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={handleZoomIn} color="primary">
            <ZoomIn />
          </IconButton>
          <IconButton onClick={handleZoomOut} color="primary">
            <ZoomOut />
          </IconButton>
        </Box>
      </Box>

      <Paper
        sx={{
          height: 'calc(100vh - 200px)',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {filteredData ? (
          <div id="treeWrapper" style={{ width: '100%', height: '100%' }}>
            <Tree
              data={filteredData}
              orientation="vertical"
              translate={translate}
              zoom={zoom}
              nodeSize={{ x: 200, y: 100 }}
              separation={{ siblings: 1, nonSiblings: 2 }}
              renderCustomNodeElement={(rd3tProps) => (
                <CustomNode {...rd3tProps} onNodeClick={handleNodeClick} />
              )}
              pathFunc="step"
            />
          </div>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>No data available for the selected department</Typography>
          </Box>
        )}
      </Paper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to use the Organization Chart
          </Typography>
          <Typography paragraph>• Click on any employee node to view their details</Typography>
          <Typography paragraph>• Use the zoom buttons or mouse wheel to zoom in and out</Typography>
          <Typography paragraph>• Filter by department using the dropdown menu</Typography>
          <Typography paragraph>• Drag the chart to pan and view different areas</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrgChartPage;

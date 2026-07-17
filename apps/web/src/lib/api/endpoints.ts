// src/lib/api/endpoints.ts

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Existing interfaces...
interface AuthEndpoints {
  login: string;
  register: string;
  logout: string;
  refresh: string;
  forgot: string;
  reset: string;
}

interface ShipmentEndpoints {
  create: string;
  list: string;
  details: (id: string) => string;
  track: (awb: string) => string;
  update: (id: string) => string;
  delete: (id: string) => string;
  retryAWB: (id: string) => string;
  trackingEvents: (id: string) => string;
  etaCalculate: string;
  etaAvailability: string;
  airports: string;
  flightSchedules: string;
}

interface UserEndpoints {
  profile: string;
  update: string;
  list: string;
  details: (id: string) => string;
}

interface AddressEndpoints {
  list: string;
  create: string;
  details: (id: string) => string;
  update: (id: string) => string;
  delete: (id: string) => string;
}

interface FinanceEndpoints {
  INVOICES: string;
  PAYMENTS: string;
  PAYOUT_REQUESTS: string;
  ANALYTICS: string;
  REPORTS: string;
}

interface ReportEndpoints {
  GENERATE: string;
  AVAILABLE: string;
  METADATA: string;
}

// ✅ NEW: HR Module Endpoints Interface
interface HREndpoints {
  // Leave types & balances
  leaveTypes: string;
  leaveBalance: {
    get: (employeeId?: string) => string;
    update: (employeeId: string) => string;
  };
  
  // Leave requests
  leaveRequests: {
    list: string;
    create: string;
    details: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
    approve: {
      manager: (id: string) => string;
      hr: (id: string) => string;
    };
  };
  
  // Leave support data (for forms)
  leaves: {
    approvers: string;
    history: string;
  };
  
  // Employee data
  employees: {
    self: string;
    colleagues: string;
    list: string;
    details: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    export: string;
    orgChart: string;
  };
  
  // Department & Team management
  departments: {
    list: string;
    details: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  teams: {
    list: string;
    details: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  
  // Correspondence
  correspondence: {
    list: string;
    details: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
}

// Update main ApiEndpoints interface
interface ApiEndpoints {
  auth: AuthEndpoints;
  shipments: ShipmentEndpoints;
  users: UserEndpoints;
  addresses: AddressEndpoints;
  finance: FinanceEndpoints;
  reports: ReportEndpoints;
  hr: HREndpoints; // ✅ Add HR endpoints
}

// ✅ Complete API_ENDPOINTS object with HR module
export const API_ENDPOINTS: ApiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgot: '/auth/forgot',
    reset: '/auth/reset',
  },
  shipments: {
    create: '/shipments',
    list: '/shipments',
    details: (id: string) => `/shipments/${id}`,
    track: (awb: string) => `/shipments/track/${awb}`,
    update: (id: string) => `/shipments/${id}`,
    delete: (id: string) => `/shipments/${id}`,
    retryAWB: (id: string) => `/shipments/${id}/retry-awb`,
    trackingEvents: (id: string) => `/shipments/${id}/tracking-events`,
    etaCalculate: '/shipments/eta/calculate',
    etaAvailability: '/shipments/eta/availability',
    airports: '/shipments/airports',
    flightSchedules: '/shipments/flight-schedules',
  },
  users: {
    profile: '/users/profile',
    update: '/users/profile',
    list: '/users',
    details: (id: string) => `/users/${id}`,
  },
  addresses: {
    list: '/addresses',
    create: '/addresses',
    details: (id: string) => `/addresses/${id}`,
    update: (id: string) => `/addresses/${id}`,
    delete: (id: string) => `/addresses/${id}`,
  },
  finance: {
    INVOICES: '/finance/invoices',
    PAYMENTS: '/finance/payments',
    PAYOUT_REQUESTS: '/finance/payout-requests',
    ANALYTICS: '/finance/analytics',
    REPORTS: '/finance/reports',
  },
  reports: {
    GENERATE: '/reports/generate',
    AVAILABLE: '/reports/available',
    METADATA: '/reports/metadata',
  },
  
  // ✅ NEW: HR Module Endpoints
  hr: {
    // Leave types & balances
    leaveTypes: '/hr/leave-types',
    leaveBalance: {
      get: (employeeId?: string) => `/hr/leave-balance${employeeId ? `/${employeeId}` : ''}`,
      update: (employeeId: string) => `/hr/leave-balance/${employeeId}`,
    },
    
    // Leave requests
    leaveRequests: {
      list: '/hr/leave-requests',
      create: '/hr/leave-requests',
      details: (id: string) => `/hr/leave-requests/${id}`,
      update: (id: string) => `/hr/leave-requests/${id}`,
      delete: (id: string) => `/hr/leave-requests/${id}`,
      approve: {
        manager: (id: string) => `/hr/leave-requests/${id}/manager-approval`,
        hr: (id: string) => `/hr/leave-requests/${id}/hr-approval`,
      },
    },
    
    // Leave support data (for forms)
    leaves: {
      approvers: '/hr/leaves/approvers', // ✅ This was causing 404
      history: '/hr/leaves/history',
    },
    
    // Employee data
    employees: {
      self: '/hr/employees/self',
      colleagues: '/hr/employees/colleagues',
      list: '/hr/employees',
      details: (id: string) => `/hr/employees/${id}`,
      create: '/hr/employees',
      update: (id: string) => `/hr/employees/${id}`,
      delete: (id: string) => `/hr/employees/${id}`,
      export: '/hr/employees/export',
      orgChart: '/hr/employees/org-chart',
    },
    
    // Department management
    departments: {
      list: '/hr/departments',
      details: (id: string) => `/hr/departments/${id}`,
      create: '/hr/departments',
      update: (id: string) => `/hr/departments/${id}`,
      delete: (id: string) => `/hr/departments/${id}`,
    },
    
    // Team management
    teams: {
      list: '/hr/teams',
      details: (id: string) => `/hr/teams/${id}`,
      create: '/hr/teams',
      update: (id: string) => `/hr/teams/${id}`,
      delete: (id: string) => `/hr/teams/${id}`,
    },
    
    // Correspondence
    correspondence: {
      list: '/hr/correspondence',
      details: (id: string) => `/hr/correspondence/${id}`,
      create: '/hr/correspondence',
      update: (id: string) => `/hr/correspondence/${id}`,
      delete: (id: string) => `/hr/correspondence/${id}`,
    },
  },
};

// ✅ Type-safe helper for API calls (optional but recommended)
export const api = {
  hr: {
    // Leave types
    getLeaveTypes: () => ({
      method: 'GET' as const,
      url: API_ENDPOINTS.hr.leaveTypes,
    }),
    
    // Leave approvers (for form dropdowns)
    getLeaveApprovers: () => ({
      method: 'GET' as const,
      url: API_ENDPOINTS.hr.leaves.approvers,
    }),
    
    // Leave requests
    getLeaveRequests: (params?: Record<string, string>) => ({
      method: 'GET' as const,
      url: API_ENDPOINTS.hr.leaveRequests.list,
      params,
    }),
    createLeaveRequest: () => ({
      method: 'POST' as const,
      url: API_ENDPOINTS.hr.leaveRequests.create,
    }),
    
    // Employee data
    getSelf: () => ({
      method: 'GET' as const,
      url: API_ENDPOINTS.hr.employees.self,
    }),
  },
} as const;

// ✅ Dev-only validation helper (prevents double /api)
if (process.env.NODE_ENV === 'development') {
  const validateEndpoint = (url: string) => {
    if (url.startsWith('/api/') && API_CONFIG.baseURL?.endsWith('/api')) {
      console.warn(`[API] Potential double /api detected: ${url}`);
      console.warn(`[API] baseURL: ${API_CONFIG.baseURL}`);
    }
  };
  
  // Example usage in hooks:
  // validateEndpoint(API_ENDPOINTS.hr.leaves.approvers);
}
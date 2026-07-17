
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Index from "@/pages/Index";
import Tracking from "@/components/tracking/Tracking";
import CreateShipment from "@/pages/CreateShipment";
import Locations from "@/components/home/Locations";
import Support from "@/pages/Support";
import Login from "@/features/pages/Login";
import Register from "@/features/pages/Register";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import ForgotPassword from "@/features/pages/ForgotPassword";
import ResetPassword from "@/features/pages/ResetPassword";
import Invite from "@/features/pages/Invite";

// Service pages
import ExpressDelivery from "@/components/services/ExpressDelivery";
import StandardShipping from "@/components/services/StandardShipping";
import International from "@/components/services/International";
import SecureShipping from "@/components/services/SecureShipping";
import TimeDefinite from "@/components/services/TimeDefinite";
import Cargo from "@/components/services/Cargo";
import Warehousing from "@/components/services/Warehousing";

// Company pages
import About from "@/components/company/About";
import Careers from "@/components/company/Careers";
import News from "@/components/company/News";
import Sustainability from "@/components/company/Sustainability";
import Terms from "@/components/company/Terms";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import DashboardLayout from "@/dashboard/DashboardLayout";
import DashboardHome from "@/dashboard/DashboardHome";
import ShipmentsManagement from "@/pages/ShipmentsManagement";
import ReportsPage from "@/dashboard/report/ReportsPage";
import { AuthProvider } from "@/features/auth/hooks";
import ProtectedRoute from "@/features/components/ProtectedRoute";
import SchedulePickup from "@/pages/SchedulePickup";
import CustomerDashboard from "@/dashboard/customer/CustomerDashboard";
import OperationsDashboard from "@/dashboard/operations/OperationsDashboard";
import DriverDashboard from "@/dashboard/driver/DriverDashboard";
import AdminDashboard from "@/dashboard/admin/AdminDashboard";
import AirOps from "@/dashboard/admin/AirOps";
import UsersManagement from "@/dashboard/admin/UsersManagement";
import WarehouseDashboard from "@/dashboard/warehouse/WarehouseDashboard";
import FinanceDashboard from "@/dashboard/finance/FinanceDashboard";
import InvoiceMaker from "@/dashboard/finance/InvoiceMaker";
import FinancePayoutRequests from "@/dashboard/finance/FinancePayoutRequests";
import PayoutRequestForm from "@/dashboard/finance/PayoutRequestForm";
import { EmployeeLeaveInspector } from "@/dashboard/hr/EmployeeLeaveInspector";
import SystemSettings from "@/dashboard/admin/SystemSettings";
import UserProfile from "@/dashboard/admin/UserProfile";
import UserSettings from "@/dashboard/admin/UserSettings";
import HRRoutes from "@/routes/HRRoutes";
import ServicePointDashboard from "@/dashboard/service-point/ServicePointDashboard";
import FleetDashboard from "@/dashboard/fleet-manager/FleetDashboard";
import { DashboardVisibilityProvider } from "@/dashboard/dashboardVisibilityContext";
import VehicleDetailPage from "@/dashboard/fleet-manager/VehicleDetailPage";
import ScheduleMaintenancePage from "@/dashboard/fleet-manager/ScheduleMaintenancePage";
import MaintenanceCalendarPage from "@/dashboard/fleet-manager/MaintenanceCalendarPage";
import AccountManagerDashboard from "@/dashboard/account/AccountManagerDashboard";
import ClientDetailPage from "@/dashboard/account/ClientDetailPage";
import RenewalPipelinePage from "@/dashboard/account/RenewalPipelinePage";
import QuotationFormPage from "@/dashboard/account/QuotationFormPage";
import QuotationHistoryPage from "@/dashboard/account/QuotationHistoryPage";
import AnalyticsDashboard from "@/dashboard/account/AnalyticsDashboard";
import ApprovalsDashboard from "@/dashboard/account/Approvals";
import CooDashboard from "@/dashboard/coo/CooDashboard";
import CfoDashboard from "@/dashboard/cfo/CfoDashboard";
import CmoDashboard from "@/dashboard/cmo/CmoDashboard";
import CeoDashboard from "@/dashboard/ceo/CeoDashboard";
import RegionalDashboard from "./dashboard/regional-manager/RegionalDashboard";
import { LeavePage } from "@/pages/LeavePage";


const App = () => (
  <AuthProvider>
    <DashboardVisibilityProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/create-shipment" element={<CreateShipment />} />
            <Route path="/schedule-pickup" element={<SchedulePickup />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/leave" element={<LeavePage />} />
            
            {/* Service pages */}
            <Route path="/express-delivery" element={<ExpressDelivery />} />
            <Route path="/standard-shipping" element={<StandardShipping />} />
            <Route path="/international" element={<International />} />
            <Route path="/secure-shipping" element={<SecureShipping />} />
            <Route path="/time-definite" element={<TimeDefinite />} />
            <Route path="/cargo" element={<Cargo />} />
            <Route path="/warehousing" element={<Warehousing />} />
            
            {/* Company pages */}
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/news" element={<News />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
            
            {/* Dashboard routes - protected with role-based access */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard home - redirects to appropriate role dashboard */}
              <Route index element={<DashboardHome />} />
              
              {/* Customer-specific routes */}
              <Route path="customer" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Driver-specific routes */}
              <Route path="driver" element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin-specific routes */}
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/air-ops" element={
                <ProtectedRoute requiredRole="admin">
                  <AirOps />
                </ProtectedRoute>
              } />

              {/* Finance-specific routes */}
              <Route path="finance" element={
                <ProtectedRoute requiredRole="finance">
                  <FinanceDashboard />
                </ProtectedRoute>
              } />
              
              {/* Finance-specific routes */}
              <Route path="finance/invoice" element={
                <ProtectedRoute requiredRole="finance">
                  <InvoiceMaker />
                </ProtectedRoute>
              } />
              
              {/* Payout Request routes */}
              <Route path="finance/payout-requests" element={
                <ProtectedRoute requiredRole="finance">
                  <FinancePayoutRequests />
                </ProtectedRoute>
              } />
              
              {/* User payout request route */}
              <Route path="payout-request" element={
                <ProtectedRoute>
                  <PayoutRequestForm />
                </ProtectedRoute>
              } />
              
              {/* Warehouse-specific routes */}
              <Route path="warehouse" element={
                <ProtectedRoute requiredRole="warehouse">
                  <WarehouseDashboard />
                </ProtectedRoute>
              } />
              
              {/* Service Point route */}
              <Route path="service-point" element={
                <ProtectedRoute requiredPermission="service_point:use">
                  <ServicePointDashboard />
                </ProtectedRoute>
              } />

              {/* Fleet Manager-specific routes */}
              <Route path="fleet-manager" element={
                <ProtectedRoute requiredRole="fleet_manager">
                  <FleetDashboard />
                </ProtectedRoute>
              } />

              <Route path="fleet/:vehicleId" element={
                <ProtectedRoute requiredRole="fleet_manager">
                 <VehicleDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="fleet/:vehicleId/schedule-maintenance" element={
                <ProtectedRoute requiredRole="fleet_manager">
                  <ScheduleMaintenancePage />
                </ProtectedRoute>
              } />

              <Route path="fleet/calendar" element={
                <ProtectedRoute requiredRole="fleet_manager">
                  <MaintenanceCalendarPage />
                </ProtectedRoute>
              } />

              {/* Account Manager routes */}
            <Route path="account" element={''} />
            <Route path="account/:clientId" element={''} />
            <Route path="account/:clientId/quotation" element={''} />
            <Route path="account/:clientId/quotations/:quotationId/history" element={''} />
            <Route path="account/approvals" element={
              <ProtectedRoute requiredRole="account_manager">
                <ApprovalsDashboard />
              </ProtectedRoute>
            } />
            <Route path="account/analytics" element={
              <ProtectedRoute requiredRole="account_manager">
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />

              {/* Account Manager route */}
             <Route path="account" element={
               <ProtectedRoute requiredRole="account_manager">
                <AccountManagerDashboard />
              </ProtectedRoute>
              } />

             <Route path="account/:clientId" element={
                <ProtectedRoute requiredRole="account_manager">
                  <ClientDetailPage />
             </ProtectedRoute>
              } />

            <Route path="account/renewals" element={
                <ProtectedRoute requiredRole="account_manager">
                  <RenewalPipelinePage />
            </ProtectedRoute>
              } />

            <Route path="account/:clientId/quotation" element={
                <ProtectedRoute requiredRole="account_manager">
                  <QuotationFormPage />
            </ProtectedRoute>
              } />

             <Route path="account/:clientId/quotations/:quotationId/history" element={
                <ProtectedRoute requiredRole="account_manager">
                  <QuotationHistoryPage />
            </ProtectedRoute>
              } />

            <Route path="cfo" element={
             <ProtectedRoute requiredRole="cfo">
               <CfoDashboard />
              </ProtectedRoute>
               } />

            <Route path="coo" element={
              <ProtectedRoute requiredRole="coo">
                <CooDashboard />
            </ProtectedRoute>
               } />

            <Route path="cmo" element={
              <ProtectedRoute requiredRole="cmo">
                <CmoDashboard />
            </ProtectedRoute>
              } />

          <Route 
  path="ceo" 
  element={
    <ProtectedRoute requiredRole="ceo">
      <CeoDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="regional/:region" 
  element={
    <ProtectedRoute requiredRole="regional_manager">
      <RegionalDashboard />
    </ProtectedRoute>
  } />
  

              {/* HR-specific routes */}
              <Route path="hr/*" element={
                <ProtectedRoute requiredPermission="hr:access">
                  <HRRoutes />
                </ProtectedRoute>
              } />

              {/* Operations-specific route */}
            <Route path="operations" element={
              <ProtectedRoute requiredRole="operations">
               <OperationsDashboard />
              </ProtectedRoute>
            } />
              
              {/* Employee Leave Dashboard */}
              <Route path="leave" element={
                <ProtectedRoute>
                  <EmployeeLeaveInspector />
                </ProtectedRoute>
              } />

              {/* Shared routes with permission-based access */}
              <Route path="shipments" element={
                <ProtectedRoute requiredPermission="shipment:read">
                  <ShipmentsManagement />
                </ProtectedRoute>
              } />

              {/* User personal pages */}
              <Route path="profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="user-settings" element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              } />
              
              <Route path="reports" element={
                <ProtectedRoute requiredPermission="reports:view">
                  <ReportsPage />
                </ProtectedRoute>
              } />
              
              <Route path="users" element={
                <ProtectedRoute requiredPermission="user:read_all">
                  <UsersManagement />
                </ProtectedRoute>
              } />

              {/* System Settings route */}
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <SystemSettings />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </DashboardVisibilityProvider>
  </AuthProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Layouts
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// User Pages
import UserDashboard from "@/pages/user/Dashboard";
import UploadReport from "@/pages/user/UploadReport";
import EnterValues from "@/pages/user/EnterValues";
import DiagnosisResult from "@/pages/user/DiagnosisResult";
import MedicalReports from "@/pages/user/MedicalReports";
import HospitalFinder from "@/pages/user/HospitalFinder";
import DoctorList from "@/pages/user/DoctorList";
import DiagnosisHistory from "@/pages/user/DiagnosisHistory";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import DiagnosisMonitoring from "@/pages/admin/DiagnosisMonitoring";
import DatasetManagement from "@/pages/admin/DatasetManagement";
import HospitalManagement from "@/pages/admin/HospitalManagement";
import DoctorManagement from "@/pages/admin/DoctorManagement";
import SystemLogs from "@/pages/admin/SystemLogs";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute role="user"><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
            <Route path="/upload-report" element={<ProtectedRoute role="user"><UserLayout><UploadReport /></UserLayout></ProtectedRoute>} />
            <Route path="/enter-values" element={<ProtectedRoute role="user"><UserLayout><EnterValues /></UserLayout></ProtectedRoute>} />
            <Route path="/diagnosis" element={<ProtectedRoute role="user"><UserLayout><DiagnosisResult /></UserLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute role="user"><UserLayout><MedicalReports /></UserLayout></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute role="user"><UserLayout><HospitalFinder /></UserLayout></ProtectedRoute>} />
            <Route path="/hospitals/:hospitalId/doctors" element={<ProtectedRoute role="user"><UserLayout><DoctorList /></UserLayout></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute role="user"><UserLayout><DoctorList /></UserLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute role="user"><UserLayout><DiagnosisHistory /></UserLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/diagnoses" element={<ProtectedRoute role="admin"><AdminLayout><DiagnosisMonitoring /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/datasets" element={<ProtectedRoute role="admin"><AdminLayout><DatasetManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/hospitals" element={<ProtectedRoute role="admin"><AdminLayout><HospitalManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><AdminLayout><DoctorManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute role="admin"><AdminLayout><SystemLogs /></AdminLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

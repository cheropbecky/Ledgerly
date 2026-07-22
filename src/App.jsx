import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import CustomerLayout from "./components/CustomerLayout";

import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import Requests from "./pages/admin/Requests";
import Inventory from "./pages/admin/Inventory";
import CustomerPortal from "./pages/customer/CustomerPortal";

function RoleRedirect() {
  const { role, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={role === "admin" ? "/admin" : "/portal"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/redirect" element={<RoleRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="requests" element={<Requests />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      <Route
        path="/portal"
        element={
          <ProtectedRoute requireRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerPortal />} />
      </Route>

      <Route path="*" element={<Navigate to="/redirect" replace />} />
    </Routes>
  );
}
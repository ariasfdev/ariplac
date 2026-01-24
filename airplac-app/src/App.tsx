import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Pedidos from "./pages/pedidos/Pedidos";
import ImportarPedido from "./pages/pedidos/importarPedido";
import Stock from "./pages/Stock";
import Admin from "./pages/Admin";
import Modelos from "./pages/Modelos";
import Trazabilidad from "./pages/trazabilidad";
import Precios from "./pages/Precios";
import Usuarios from "./pages/Usuarios";
import { useAuth } from "./context/AuthContext";

// Componente para proteger rutas por rol
function RoleProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
  const { userRole, loading } = useAuth();

  if (loading) return null;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/home/pedidos" replace />;
  }

  return children;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />

          {/* Redirecciona "/" a login si no hay sesión, o a home/pedidos si ya la hay */}
          <Route path="/" element={<Navigate to="/home/pedidos" replace />} />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          >
            {/* Rutas accesibles por Vendedor, Admin y Superadmin */}
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pedidos/importar" element={<Pedidos />} />
            <Route path="stock" element={<Stock />} />

            {/* Rutas solo para Admin y Superadmin */}
            <Route
              path="modelos"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Superadmin"]}>
                  <Modelos />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="precios"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Superadmin"]}>
                  <Precios />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="trazabilidad"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Superadmin"]}>
                  <Trazabilidad />
                </RoleProtectedRoute>
              }
            />

            {/* Rutas solo para Superadmin */}
            <Route
              path="admin"
              element={
                <RoleProtectedRoute allowedRoles={["Superadmin"]}>
                  <Admin />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <RoleProtectedRoute allowedRoles={["Superadmin"]}>
                  <Usuarios />
                </RoleProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;

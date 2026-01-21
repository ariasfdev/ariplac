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
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pedidos/importar" element={<ImportarPedido />} />
            <Route path="stock" element={<Stock />} />
            <Route path="modelos" element={<Modelos />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/pedidos" element={<Pedidos />} />
            <Route path="trazabilidad" element={<Trazabilidad />} />
            <Route path="precios" element={<Precios />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;

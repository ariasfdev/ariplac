import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/Home";
import Pedidos from "./pages/pedidos/Pedidos";
import ImportarPedido from "./pages/pedidos/importarPedido";
import Stock from "./pages/Stock";
import Admin from "./pages/Admin";
import Modelos from "./pages/Modelos";
import Trazabilidad from "./pages/trazabilidad";

const App: React.FC = () => {
  return (
    <AppProvider>
      s
      <Router>
        <Routes>
          {/* Redirecciona "/" a "/home/pedidos" */}
          <Route path="/" element={<Navigate to="/home/pedidos" replace />} />

          <Route path="/home" element={<Home />}>
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pedidos/importar" element={<ImportarPedido />} />
            <Route path="stock" element={<Stock />} />
            <Route path="modelos" element={<Modelos />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/pedidos" element={<Pedidos />} />
            <Route path="trazabilidad" element={<Trazabilidad />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;

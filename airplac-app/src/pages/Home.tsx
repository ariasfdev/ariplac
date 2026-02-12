import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "../componets/Nav";

const Home: React.FC = () => {
  const location = useLocation();
  const [isNavVisible, setIsNavVisible] = useState(true);

  const getTitle = () => {
    switch (location.pathname) {
      case "/home/pedidos":
        return "Gestión de Pedidos";
      case "/home/stock":
        return "Gestión de Stock";
      case "/home/admin":
        return "Administración";
      case "/home/modelos":
        return "Gestión de Modelos";
      case "/home/trazabilidad":
        return "Gestión de Trazabilidad";
      case "/home/precios":
        return "Gestión de Precios";
      case "/home/reportes":
        return "Reportes";
      case "/home/usuarios":
        return "Gestión de Usuarios";
      default:
        return "Inicio";
    }
  };

  return (
    <div className="layout-container">
      <div className={`sidebar ${isNavVisible ? '' : 'collapsed'}`}>
        <Nav isNavVisible={isNavVisible} setIsNavVisible={setIsNavVisible} />
      </div>

      <main className={`main-content ${isNavVisible ? '' : 'expanded'}`}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Home;

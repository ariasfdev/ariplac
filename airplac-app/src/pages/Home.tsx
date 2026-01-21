import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "../componets/Nav";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

const Home: React.FC = () => {
  const { isNavVisible, setIsNavVisible } = useAppContext();
  const location = useLocation();

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
      default:
        return "Inicio";
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav isNavVisible={isNavVisible} setIsNavVisible={setIsNavVisible} />

      <button
        onClick={() => setIsNavVisible(!isNavVisible)}
        className={`btn btn-circle btn-secondary text-xl fixed top-4 ${
          isNavVisible ? "left-64" : "left-4"
        } z-40 transition-all duration-500`}
      >
        {isNavVisible ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center mb-4">
          {" "}
          {/* Cambiado a justify-center */}
          <h2 className="text-2xl font-bold text-center">{getTitle()}</h2>{" "}
          {/* Alineación centrada */}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Home;

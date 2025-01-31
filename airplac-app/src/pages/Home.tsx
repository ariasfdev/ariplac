import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "../componets/Nav";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAppContext } from "../context/AppContext"; // Importa el contexto

const Home: React.FC = () => {
  const { isNavVisible, setIsNavVisible } = useAppContext();
  const location = useLocation(); // Hook para obtener la ruta actual

  // Mapea los títulos en función de la ruta actual
  const getTitle = () => {
    switch (location.pathname) {
      case "/home/pedidos":
        return "Gestión de Pedidos";
      case "/home/pedidos/importar":
        return "Importar Pedidos";
      case "/home/stock":
        return "Gestión de Stock";
      case "/home/admin":
        return "Administración";
      case "/home/modelos":
        return "Gestion de modelos";
      default:
        return "Inicio";
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Nav isNavVisible={isNavVisible} setIsNavVisible={setIsNavVisible} />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2
          className={`text-2xl font-bold mb-4 transition-all duration-500 ease-in-out ${
            isNavVisible
              ? "text-left ml-0"
              : "text-center ml-[50%] -translate-x-1/2"
          }`}
        >
          {getTitle()}
        </h2>
        <div className="relative left-1 z-50 mb-2">
          <button
            onClick={() => setIsNavVisible(!isNavVisible)}
            className="btn btn-circle btn-secondary text-xl"
          >
            {isNavVisible ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Home;

import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavProps {
  isNavVisible: boolean;
  setIsNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Nav: React.FC<NavProps> = ({ isNavVisible, setIsNavVisible }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsNavVisible(false);
    }
  };

  return (
    <aside
      className={`bg-neutral shadow-lg transition-transform duration-500 ease-in-out transform ${
        isNavVisible ? "translate-x-0 w-64 z-50" : "-translate-x-full w-0 z-0"
      } fixed md:relative h-100 md:z-0`}
    >
      <h1
        className={`text-xl font-bold text-center py-4 md:block transition-opacity duration-500 ${
          isNavVisible ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        Gestión de Negocio
      </h1>
      <nav
        className={`flex flex-col gap-2 px-4 ${
          isNavVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition-opacity duration-500`}
      >
        <Link
          to="/home/pedidos"
          onClick={handleLinkClick}
          className="block py-2 px-4 text-lg font-medium text-white hover:bg-secondary hover:text-black rounded"
        >
          Pedidos
        </Link>
        <Link
          to="/home/pedidos/importar"
          onClick={handleLinkClick}
          className="block py-2 px-4 text-lg font-medium text-white hover:bg-secondary hover:text-black rounded"
        >
          Importar Pedidos
        </Link>
        <Link
          to="/home/stock"
          onClick={handleLinkClick}
          className="block py-2 px-4 text-lg font-medium text-white hover:bg-secondary hover:text-black rounded"
        >
          Stock
        </Link>
        <Link
          to="/home/modelos"
          onClick={handleLinkClick}
          className="block py-2 px-4 text-lg font-medium text-white hover:bg-secondary hover:text-black rounded"
        >
          Modelos
        </Link>
        <Link
          to="/home/admin"
          onClick={handleLinkClick}
          className="block py-2 px-4 text-lg font-medium text-white hover:bg-secondary hover:text-black rounded"
        >
          Admin
        </Link>
      </nav>
    </aside>
  );
};

export default Nav;

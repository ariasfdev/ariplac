import React from "react";
import { Link } from "react-router-dom";

interface NavProps {
  isNavVisible: boolean;
  setIsNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Nav: React.FC<NavProps> = ({ isNavVisible, setIsNavVisible }) => {
  return (
    <aside
      className={`bg-neutral shadow-lg transition-all duration-500 ease-in-out ${
        isNavVisible ? "w-64 opacity-100" : "w-0 opacity-0"
      } overflow-hidden`}
    >
      <h1
        className={`text-xl font-bold text-center py-4 transition-opacity duration-500 ${
          isNavVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        Gestión de Negocio
      </h1>
      <nav className="flex flex-col gap-2 px-4 transition-opacity duration-500">
        <Link
          to="/home/pedidos"
          className="block py-2 px-4 text-lg font-medium text-white text-bold hover:bg-secondary hover:text-black text-bold rounded transition-all"
        >
          Pedidos
        </Link>
        <Link
          to="/home/pedidos/importar"
          className="block py-2 px-4 text-lg font-medium text-white text-bold hover:bg-secondary hover:text-black text-bold rounded transition-all"
        >
          Importar Pedidos
        </Link>
        <Link
          to="/home/stock"
          className="block py-2 px-4 text-lg font-medium text-white text-bold hover:bg-secondary hover:text-black text-bold rounded transition-all"
        >
          Stock
        </Link>
        <Link
          to="/home/modelos"
          className="block py-2 px-4 text-lg font-medium text-white text-bold hover:bg-secondary hover:text-black text-bold rounded transition-all"
        >
          Modelos
        </Link>
        <Link
          to="/home/admin"
          className="block py-2 px-4 text-lg font-medium text-white text-bold hover:bg-secondary hover:text-black text-bold rounded transition-all"
        >
          Admin
        </Link>
      </nav>
    </aside>
  );
};

export default Nav;

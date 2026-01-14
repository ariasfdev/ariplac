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

  const navItems = [
    {
      path: "/home/pedidos",
      label: "Pedidos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      description: "Gestión de pedidos y órdenes",
    },
    {
      path: "/home/pedidos/importar",
      label: "Importar Pedidos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      ),
      description: "Importar pedidos desde archivos",
    },
    {
      path: "/home/stock",
      label: "Stock",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      description: "Control de inventario y stock",
    },
    {
      path: "/home/modelos",
      label: "Modelos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      description: "Catálogo de modelos y productos",
    },
    {
      path: "/home/trazabilidad",
      label: "Control Stock",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      description: "Movimientos de Stock",
    },
    {
      path: "/home/precios",
      label: "Precios",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: "Gestión de precios masivos",
    },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-base-100 to-base-200 shadow-xl transition-all duration-500 ease-in-out transform ${
        isNavVisible ? "translate-x-0 w-80 z-50" : "-translate-x-full w-0 z-0"
      } fixed md:relative h-screen md:z-0 border-r border-base-300`}
    >
      {/* Header con logo y título */}
      <div
        className={`bg-gradient-to-r from-primary to-primary-focus px-6 py-6 transition-opacity duration-500 ${
          isNavVisible ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary-content text-primary rounded-full w-12 h-12 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-content">
              Gestión de Negocio
            </h1>
            <p className="text-primary-content/80 text-sm">
              Sistema de administración
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav
        className={`flex flex-col gap-2 p-6 ${
          isNavVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition-opacity duration-500`}
      >
        {/* Sección de navegación principal */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-4 px-2">
            Navegación Principal
          </h3>

          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isActiveParent =
                location.pathname.startsWith(item.path) &&
                item.path !== "/home/admin";

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`group relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive || isActiveParent
                      ? "bg-primary text-primary-content shadow-lg"
                      : "text-base-content hover:bg-base-200 hover:text-primary"
                  }`}
                >
                  {/* Indicador de página activa */}
                  {(isActive || isActiveParent) && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-content rounded-r-full"></div>
                  )}

                  {/* Icono */}
                  <div
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive || isActiveParent
                        ? "text-primary-content"
                        : "text-base-content/70 group-hover:text-primary"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Contenido del enlace */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium transition-colors duration-200 ${
                        isActive || isActiveParent
                          ? "text-primary-content"
                          : "text-base-content group-hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-xs transition-colors duration-200 ${
                        isActive || isActiveParent
                          ? "text-primary-content/80"
                          : "text-base-content/50 group-hover:text-primary/70"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Indicador de hover */}
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isActive || isActiveParent
                        ? "bg-primary-content"
                        : "bg-transparent group-hover:bg-primary/30"
                    }`}
                  ></div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sección de información del sistema */}
        <div className="mt-auto pt-6 border-t border-base-300">
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-base-content">
                Sistema Activo
              </span>
            </div>
            <div className="text-xs text-base-content/60">
              Última actualización: {new Date().toLocaleDateString("es-AR")}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Nav;

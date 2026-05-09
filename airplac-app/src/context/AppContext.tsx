import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

interface Pedido {
  id: string;
  remito: string;
  fecha: string;
  cliente: string;
  direccion: string;
  contacto: string;
  dni_cuil: string;
  detalle: string;
  cantidadM2: number;
  materiales: string;
  total: number;
  estado: string;
}

interface AppContextType {
  isNavVisible: boolean;
  setIsNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
  pedidos: Pedido[];
  fetchPedidos: () => Promise<void>;
  addPedido: (nuevoPedido: Pedido) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Función para obtener pedidos desde el backend
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/pedidos/");
      setPedidos(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener los pedidos:", err);
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para agregar un pedido
  const addPedido = (nuevoPedido: Pedido) => {
    setPedidos((prev) => [...prev, nuevoPedido]);
  };

  // Llama a fetchPedidos solo cuando la autenticación esté lista
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPedidos();
    }
  }, [authLoading, isAuthenticated, fetchPedidos]);

  return (
    <AppContext.Provider
      value={{
        isNavVisible,
        setIsNavVisible,
        pedidos,
        fetchPedidos,
        addPedido,
        error,
        setError,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe ser usado dentro de un AppProvider");
  }
  return context;
};

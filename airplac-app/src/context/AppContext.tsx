import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { api } from "../services/api";

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener pedidos desde el backend
  const fetchPedidos = useCallback(async () => {
    try {
      const response = await api.get("/pedidos/");
      console.log(response.data);
      setPedidos(response.data);
    } catch (err) {
      console.error("Error al obtener los pedidos:", err);
      setError("No se pudieron cargar los pedidos.");
    }
  }, []);

  // Función para agregar un pedido
  const addPedido = (nuevoPedido: Pedido) => {
    setPedidos((prev) => [...prev, nuevoPedido]);
  };

  // Llama a fetchPedidos al cargar el proveedor
  useEffect(() => {
    fetchPedidos();
  }, []); // Se ejecuta solo al montar el componente

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

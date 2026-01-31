import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/reportes`;

export interface DashboardData {
  resumen: any;
  pedidos_por_estado: any[];
  top_3_vendedores: any[];
  bajo_stock: any[];
  ingresos_por_mes: any[];
}

export interface VentasPorModelo {
  resumen: any;
  data: any[];
}

export interface VentasPorVendedor {
  resumen: any;
  data: any[];
}

export interface TopClientes {
  resumen: any;
  data: any[];
}

export interface ComparativaVendedores {
  ranking: any[];
  grafico_mes_a_mes: any[];
  meses_labels: string[];
  periodo: any;
}

export interface RentabilidadModelo {
  resumen: any;
  data: any[];
}

export interface TasaConversion {
  tasa_global: any;
  por_vendedor: any[];
  por_modelo: any[];
  periodo: any;
}

export interface RentabilidadCliente {
  resumen: any;
  data: any[];
}

export interface AnalisisDescuentos {
  resumen_general: any;
  descuentos_por_modelo: any[];
  pedidos_alto_descuento: any[];
  tendencia_por_periodo: any[];
  periodo: any;
}

export interface EstadoPedidos {
  resumen_estado: any[];
  estadisticas_tiempo: any;
  pendientes_cobro: any[];
  pedidos_retrasados: number;
  detalle_pedidos: any[];
  periodo: any;
}

export interface StockProduccion {
  resumen: any;
  bajo_alerta: any[];
  stock_general: any[];
  umbral_alerta: number;
  fecha_consulta: string;
}

export interface MetodosPagoProcedenecia {
  resumen_general: any;
  metodos_pago: any[];
  procedencia: any[];
  cartera_por_metodo: any[];
  cartera_por_procedencia: any[];
  periodo: any;
}

export const reportesService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching dashboard');
    return response.json();
  },

  async getVentasPorModelo(desde?: string, hasta?: string): Promise<VentasPorModelo> {
    let url = `${API_URL}/ventas-por-modelo`;
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching ventas por modelo');
    return response.json();
  },

  async getVentasPorVendedor(desde?: string, hasta?: string): Promise<VentasPorVendedor> {
    let url = `${API_URL}/ventas-por-vendedor`;
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching ventas por vendedor');
    return response.json();
  },

  async getTopClientes(limite: number = 5, desde?: string, hasta?: string): Promise<TopClientes> {
    let url = `${API_URL}/top-clientes?limite=${limite}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching top clientes');
    return response.json();
  },

  async getComparativaVendedores(meses: number = 6): Promise<ComparativaVendedores> {
    const response = await fetch(`${API_URL}/comparativa-vendedores?meses=${meses}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching comparativa vendedores');
    return response.json();
  },

  async getRentabilidadModelo(desde?: string, hasta?: string): Promise<RentabilidadModelo> {
    let url = `${API_URL}/rentabilidad-modelo`;
    if (desde || hasta) {
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching rentabilidad modelo');
    return response.json();
  },

  async getTasaConversion(desde?: string, hasta?: string): Promise<TasaConversion> {
    let url = `${API_URL}/tasa-conversion`;
    if (desde || hasta) {
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching tasa conversion');
    return response.json();
  },

  async getRentabilidadCliente(limite: number = 10, desde?: string, hasta?: string): Promise<RentabilidadCliente> {
    let url = `${API_URL}/rentabilidad-cliente?limite=${limite}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching rentabilidad cliente');
    return response.json();
  },

  async getEstadoPedidos(limite: number = 20, desde?: string, hasta?: string): Promise<EstadoPedidos> {
    let url = `${API_URL}/estado-pedidos?limite=${limite}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching estado pedidos');
    return response.json();
  },

  async getStockProduccion(alertaStock: number = 50): Promise<StockProduccion> {
    const response = await fetch(`${API_URL}/stock-produccion?alertaStock=${alertaStock}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching stock produccion');
    return response.json();
  },

  async getMetodosPagoProcedenencia(): Promise<MetodosPagoProcedenecia> {
    const response = await fetch(`${API_URL}/metodos-pago-procedencia`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (!response.ok) throw new Error('Error fetching metodos pago procedencia');
    return response.json();
  },
};

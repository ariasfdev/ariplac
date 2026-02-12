import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportableTable from '../../components/ExportableTable';
import { reportesService } from '../../services/reportes.service';
import '../../styles/Reportes.css';

interface ReporteIndividualProps {
  tipo: 'ventasModelo' | 'ventasVendedor' | 'topClientes' | 'rentabilidadModelo' | 'tasaConversion' | 'rentabilidadPedido' | 'estadoPedidos';
}

const ReporteIndividual: React.FC<ReporteIndividualProps> = ({ tipo }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [modelos, setModelos] = useState<any[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Filtrar modelos según el tipo seleccionado
  const modelosFiltrados = selectedTipo
    ? modelos.filter(m => m.producto === selectedTipo)
    : modelos;

  // Resetear modelo cuando cambia el tipo
  useEffect(() => {
    setSelectedModelo('');
  }, [selectedTipo]);

  const fmtNum = (v: any) => (v || 0).toString();
  const fmtMoney = (v: any) => `$${(v || 0).toLocaleString('es-AR')}`;
  const fmtPct = (v: any) => `${(v || 0).toFixed(2)}%`;

  const filterSummary = (summary: any) => {
    if (!summary) return {};
    const filtered: any = {};
    Object.entries(summary).forEach(([key, value]) => {
      if (value !== null && value !== undefined && typeof value !== 'object') {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const addRankingsToVendedores = (data: any[]) => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => (b.total_facturado || 0) - (a.total_facturado || 0));
    return sorted.map((item, index) => ({
      ...item,
      posicion: index + 1
    }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const desdeParam = desde || undefined;
      const hastaParam = hasta || undefined;
      const modeloParam = selectedModelo || undefined;
      const tipoParam = selectedTipo || undefined;

      let result = null;
      switch (tipo) {
        case 'ventasModelo':
          result = await reportesService.getVentasPorModelo(desdeParam, hastaParam, modeloParam, tipoParam);
          break;
        case 'ventasVendedor':
          result = await reportesService.getVentasPorVendedor(desdeParam, hastaParam, modeloParam, tipoParam);
          break;
        case 'topClientes':
          result = await reportesService.getTopClientes(20, desdeParam, hastaParam);
          break;
        case 'rentabilidadModelo':
          result = await reportesService.getRentabilidadModelo(desdeParam, hastaParam, modeloParam, tipoParam);
          break;
        case 'tasaConversion':
          result = await reportesService.getTasaConversion(desdeParam, hastaParam);
          break;
        case 'rentabilidadPedido':
          result = await reportesService.getRentabilidadCliente(50, desdeParam, hastaParam);
          break;
        case 'estadoPedidos':
          result = await reportesService.getEstadoPedidos(50, desdeParam, hastaParam, modeloParam, tipoParam);
          break;
      }
      setData(result);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadModelosDisponibles();
  }, [tipo]);

  const loadModelosDisponibles = async () => {
    try {
      const data = await reportesService.getModelosDisponibles();
      setModelos(data.modelos);
      setTipos(data.tipos);
    } catch (error) {
      console.error('Error loading modelos disponibles:', error);
    }
  };

  const getReportConfig = () => {
    switch (tipo) {
      case 'ventasModelo':
        return {
          title: 'Ventas por Modelo',
          description: 'Muestra las ventas totales, cantidad vendida e ingresos brutos por cada modelo',
          columns: [
            { key: 'nombreModelo', label: 'Modelo' },
            { key: 'producto', label: 'Tipo' },
            { key: 'unidad', label: 'Unidad' },
            { key: 'cantidad_vendida', label: 'Cantidad vendida', format: fmtNum },
            { key: 'ingresos_brutos', label: 'Ingresos', format: fmtMoney }
          ],
          data: data?.data || [],
          summary: filterSummary(data?.resumen)
        };
      case 'ventasVendedor':
        return {
          title: 'Ventas por Vendedor + Ranking',
          description: 'Desglose de ventas por vendedor con comparativa de desempeño, pedidos, facturación y posición en ranking',
          columns: [
            { key: 'nombreVendedor', label: 'Vendedor' },
            { key: 'cantidad_pedidos', label: 'Pedidos', format: fmtNum },
            { key: 'total_facturado', label: 'Facturado', format: fmtMoney },
            { key: 'ticket_promedio', label: 'Ticket Prom', format: fmtMoney },
            { key: 'posicion', label: 'Posición', format: fmtNum }
          ],
          data: addRankingsToVendedores(data?.data || []),
          summary: filterSummary(data?.resumen)
        };
      case 'topClientes':
        return {
          title: 'Top Clientes',
          description: 'Ranking de los principales clientes por cantidad de pedidos y monto total gastado',
          columns: [
            { key: 'nombreCliente', label: 'Cliente' },
            { key: 'cantidadPedidos', label: 'Pedidos', format: fmtNum },
            { key: 'totalGastado', label: 'Total', format: fmtMoney },
            { key: 'promedio_por_pedido', label: 'Promedio', format: fmtMoney }
          ],
          data: data?.data || [],
          summary: filterSummary(data?.resumen)
        };
      case 'rentabilidadModelo':
        return {
          title: 'Rentabilidad por Modelo',
          description: 'Análisis de costos, ingresos y márgenes de ganancia neta por modelo de producto',
          columns: [
            { key: 'nombreModelo', label: 'Modelo' },
            { key: 'producto', label: 'Tipo' },
            { key: 'unidad', label: 'Unidad' },
            { key: 'cantidad', label: 'Unidades', format: fmtNum },
            { key: 'costo_total', label: 'Costo', format: fmtMoney },
            { key: 'ingresos_brutos', label: 'Ingresos', format: fmtMoney },
            { key: 'ganancia_bruta', label: 'Ganancia', format: fmtMoney },
            { key: 'margen_neto_pct', label: 'Margen %', format: fmtPct }
          ],
          data: data?.data || [],
          summary: filterSummary(data?.resumen)
        };
      case 'tasaConversion':
        return {
          title: 'Tasa de Conversión',
          description: 'Porcentaje de presupuestos convertidos en pedidos por vendedor',
          columns: [
            { key: 'nombreVendedor', label: 'Vendedor' },
            { key: 'presupuestos', label: 'Presupuestos', format: fmtNum },
            { key: 'pedidos', label: 'Pedidos', format: fmtNum },
            { key: 'tasa_conversion', label: 'Tasa %', format: fmtPct }
          ],
          data: data?.por_vendedor || [],
          summary: filterSummary(data?.tasa_global)
        };
      case 'rentabilidadPedido':
        return {
          title: 'Rentabilidad por Pedido',
          description: 'Detalle de rentabilidad individual por pedido incluyendo cliente, monto, costo y margen obtenido',
          columns: [
            { key: 'nombreCliente', label: 'Cliente' },
            { key: 'ingresos', label: 'Ingresos', format: fmtMoney },
            { key: 'costo_total', label: 'Costo', format: fmtMoney },
            { key: 'ganancia_bruta', label: 'Ganancia', format: fmtMoney },
            { key: 'margen_neto_pct', label: 'Margen %', format: fmtPct }
          ],
          data: data?.data || [],
          summary: filterSummary(data?.resumen)
        };
      case 'estadoPedidos':
        return {
          title: 'Estado de Pedidos',
          description: 'Resumen de pedidos agrupados por estado con montos totales y pendientes de cobro',
          columns: [
            { key: '_id', label: 'Estado' },
            { key: 'producto', label: 'Tipo' },
            { key: 'cantidad', label: 'Cantidad', format: fmtNum },
            { key: 'monto', label: 'Total Facturado', format: fmtMoney },
            { key: 'monto_pendiente', label: 'Pendiente de Cobrar', format: fmtMoney }
          ],
          data: data?.resumen_estado || [],
          summary: {}
        };
      default:
        return {
          title: 'Reporte',
          description: '',
          columns: [],
          data: [],
          summary: {}
        };
    }
  };

  const config = getReportConfig();

  return (
    <div className="reportes-page">
      <div className="reportes-toolbar">
        <button onClick={() => navigate('/home/reportes')} className="btn-back">
          ← Volver a Reportes
        </button>
        <h1>{config.title}</h1>
        <button onClick={loadData} className="btn-refresh" disabled={loading}>
          {loading ? 'Cargando...' : '⟳ Actualizar'}
        </button>
      </div>

      <div className="content-area">
        <div className="phase-section">
          <div className="table-with-filters">
            <div className="table-date-filters">
              <div className="filter-group">
                <label>Desde:</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Hasta:</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
              {(tipo === 'ventasModelo' || tipo === 'ventasVendedor' || tipo === 'rentabilidadModelo' || tipo === 'estadoPedidos') && (
                <>
                  <div className="filter-group">
                    <label>Tipo:</label>
                    <select value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
                      <option value="">Todos los tipos</option>
                      {tipos.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Modelo:</label>
                    <select value={selectedModelo} onChange={(e) => setSelectedModelo(e.target.value)}>
                      <option value="">Todos los modelos</option>
                      {modelosFiltrados.map(m => (
                        <option key={m._id} value={m._id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <button onClick={loadData} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>
                Aplicar
              </button>
            </div>
            {loading ? (
              <div className="empty-state">Cargando...</div>
            ) : (
              <ExportableTable
                title={config.title}
                description={config.description}
                columns={config.columns}
                data={config.data}
                summary={config.summary}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteIndividual;

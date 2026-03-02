import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportableTable from '../../components/ExportableTable';
import { reportesService } from '../../services/reportes.service';
import '../../styles/Reportes.css';

interface ReporteIndividualProps {
  tipo: 'ventasModelo' | 'ventasVendedor' | 'topClientes' | 'rentabilidadModelo' | 'tasaConversion' | 'rentabilidadPedido' | 'estadoPedidos' | 'ventasProcedencia';
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
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedDisponible, setSelectedDisponible] = useState('');
  const [selectedDisponibilidadDetalle, setSelectedDisponibilidadDetalle] = useState('');

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

  const formatRentabilidadSummary = (summary: any) => {
    if (!summary) return {};
    return {
      total_ingresos: fmtMoney(summary.total_ingresos || 0),
      total_costo: fmtMoney(summary.total_costo || 0),
      total_ganancia_bruta: fmtMoney(summary.total_ganancia_bruta || 0),
      total_costos_adicionales: fmtMoney(summary.total_costos_adicionales || 0),
      total_ganancia_neta: fmtMoney(summary.total_ganancia_neta || 0),
      margen_promedio: fmtPct(summary.margen_promedio || 0)
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const desdeParam = desde || undefined;
      const hastaParam = hasta || undefined;
      const modeloParam = selectedModelo || undefined;
      const tipoParam = selectedTipo || undefined;
      const estadoParam = selectedEstado || undefined;
      const disponibleParam = selectedDisponible || undefined;

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
          result = await reportesService.getEstadoPedidos(50, desdeParam, hastaParam, modeloParam, tipoParam, estadoParam);
          break;
        case 'ventasProcedencia':
          result = await reportesService.getVentasPorProcedencia(desdeParam, hastaParam, modeloParam, tipoParam, estadoParam, disponibleParam);
          break;
      }
      setData(result);
      setSelectedDisponibilidadDetalle('');
    } catch (error) {
      console.error('Error loading report:', error);
      setData(null);
      setSelectedDisponibilidadDetalle('');
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
            { key: 'unidad', label: 'Unidad medida' },
            { key: 'cantidad_vendida', label: 'Cantidad vendida (m²)', format: fmtNum },
            { key: 'cantidad_pedidos', label: 'Cantidad pedidos', format: fmtNum },
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
            { key: 'cantidad', label: 'Unidades(m²)', format: fmtNum },
            { key: 'costo_total', label: 'Costo', format: fmtMoney },
            { key: 'ingresos_brutos', label: 'Ingresos', format: fmtMoney },
            { key: 'ganancia_bruta', label: 'Ganancia', format: fmtMoney },
            { key: 'margen_neto_pct', label: 'Margen %', format: fmtPct }
          ],
          data: data?.data || [],
          summary: formatRentabilidadSummary(data?.resumen)
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
          title: 'Rentabilidad por Cliente',
          description: 'Detalle de rentabilidad por cliente incluyendo ingresos, costo y margen obtenido',
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
          description: 'Resumen de pedidos agrupados por disponibilidad: entregado, disponible y pendiente',
          columns: [
            { key: '_id', label: 'Disponibilidad' },
            { key: 'cantidad', label: 'Cantidad', format: fmtNum },
            { key: 'monto', label: 'Total Facturado', format: fmtMoney },
            { key: 'monto_pendiente', label: 'Pendiente de Cobrar', format: fmtMoney }
          ],
          data: data?.resumen_estado || [],
          summary: {}
        };
      case 'ventasProcedencia':
        return {
          title: 'Ventas por Procedencia',
          description: 'Cantidad de ventas por origen de cliente con filtros de tipo, modelo, estado y disponibilidad',
          columns: [
            { key: 'procedencia', label: 'Procedencia' },
            { key: 'cantidad_ventas', label: 'Cantidad Ventas', format: fmtNum },
            { key: 'total_facturado', label: 'Total Facturado', format: fmtMoney },
            { key: 'total_pendiente', label: 'Pendiente de Cobrar', format: fmtMoney },
            { key: 'ticket_promedio', label: 'Ticket Promedio', format: fmtMoney },
            { key: 'porcentaje_ventas', label: '% Ventas', format: fmtPct }
          ],
          data: data?.data || [],
          summary: filterSummary(data?.resumen)
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
  const detalleEstadoSeleccionado = (data?.detalle_pedidos || []).filter((item: any) => item.estado_disponibilidad === selectedDisponibilidadDetalle);

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
              {(tipo === 'ventasModelo' || tipo === 'ventasVendedor' || tipo === 'rentabilidadModelo' || tipo === 'estadoPedidos' || tipo === 'ventasProcedencia') && (
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
                        <option key={m._id} value={m._id}>
                          {m.nombre}{m.activo ? '' : ' (DADO DE BAJA)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(tipo === 'estadoPedidos' || tipo === 'ventasProcedencia') && (
                    <div className="filter-group">
                      <label>Estado:</label>
                      <select value={selectedEstado} onChange={(e) => setSelectedEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="retira">Retira</option>
                        <option value="enviar">Enviar</option>
                        <option value="instalacion">Instalación</option>
                      </select>
                    </div>
                  )}
                  {tipo === 'ventasProcedencia' && (
                    <div className="filter-group">
                      <label>Disponible:</label>
                      <select value={selectedDisponible} onChange={(e) => setSelectedDisponible(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="entregado">Entregado</option>
                        <option value="disponible">Disponible</option>
                        <option value="pendiente">Pendiente</option>
                      </select>
                    </div>
                  )}
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
                onRowClick={tipo === 'estadoPedidos' ? (row: any) => {
                  const rowEstado = row?._id || '';
                  setSelectedDisponibilidadDetalle(prev => prev === rowEstado ? '' : rowEstado);
                } : undefined}
                selectedRowValue={tipo === 'estadoPedidos' ? selectedDisponibilidadDetalle : undefined}
              />
            )}

            {tipo === 'estadoPedidos' && selectedDisponibilidadDetalle && selectedDisponibilidadDetalle !== 'entregado' && (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <div className="table-header">
                  <h2>Detalle ({selectedDisponibilidadDetalle})</h2>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Remito</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleEstadoSeleccionado.length > 0 ? (
                        detalleEstadoSeleccionado.map((item: any, index: number) => (
                          <tr key={`${item.remito}-${index}`}>
                            <td>{item.remito || '-'}</td>
                            <td>{item.cliente_nombre || '-'}</td>
                            <td>{item.productos_concatenados || '-'}</td>
                            <td>{fmtMoney(item.total || 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                            Sin datos para este estado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteIndividual;

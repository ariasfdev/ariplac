import React, { useState, useEffect } from 'react';
import ExportableTable from '../components/ExportableTable';
import { reportesService } from '../services/reportes.service';
import '../styles/Reportes.css';

const Reportes: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [ventasPorModelo, setVentasPorModelo] = useState<any>(null);
  const [ventasPorVendedor, setVentasPorVendedor] = useState<any>(null);
  const [topClientes, setTopClientes] = useState<any>(null);
  const [rentabilidadModelo, setRentabilidadModelo] = useState<any>(null);
  const [tasaConversion, setTasaConversion] = useState<any>(null);
  const [rentabilidadPedido, setRentabilidadPedido] = useState<any>(null);
  const [estadoPedidos, setEstadoPedidos] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fase1');
  
  // Filtros por tabla
  const [tableFilters, setTableFilters] = useState<any>({});

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      // Cargar sin filtros inicialmente
      const [dashboard, ventasMod, ventasVend, topCli] = await Promise.all([
        reportesService.getDashboard().catch(e => { console.error('Dashboard error:', e); return null; }),
        reportesService.getVentasPorModelo().catch(e => { console.error('Ventas error:', e); return null; }),
        reportesService.getVentasPorVendedor().catch(e => { console.error('Vendedor error:', e); return null; }),
        reportesService.getTopClientes(5).catch(e => { console.error('Clientes error:', e); return null; }),
      ]);
      setDashboard(dashboard);
      setVentasPorModelo(ventasMod);
      setVentasPorVendedor(ventasVend);
      setTopClientes(topCli);

      const [rentMod, tasa] = await Promise.all([
        reportesService.getRentabilidadModelo().catch(e => { console.error('RentabilidadModelo error:', e); return null; }),
        reportesService.getTasaConversion().catch(e => { console.error('TasaConversion error:', e); return null; }),
      ]);
      setRentabilidadModelo(rentMod);
      setTasaConversion(tasa);

      const [rentPedido, estado] = await Promise.all([
        reportesService.getRentabilidadCliente(50).catch(e => { console.error('RentabilidadPedido error:', e); return null; }),
        reportesService.getEstadoPedidos(20).catch(e => { console.error('EstadoPedidos error:', e); return null; }),
      ]);
      setRentabilidadPedido(rentPedido);
      setEstadoPedidos(estado);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmtNum = (v: any) => (v || 0).toString();
  const fmtMoney = (v: any) => `$${(v || 0).toLocaleString('es-AR')}`;
  const fmtPct = (v: any) => `${(v || 0).toFixed(2)}%`;

  // Filtrar resumen para solo valores simples
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

  // Aplicar filtros a los datos por tabla (los filtros se aplican en el backend)
  const applyTableFilters = (data: any[], tableId: string) => {
    return data || [];
  };

  const setTableFilter = (tableId: string, field: string, value: string) => {
    setTableFilters((prev: any) => ({
      ...prev,
      [tableId]: { ...prev[tableId], [field]: value }
    }));
  };

  // Recargar datos para una tabla específica con sus filtros de fecha
  const reloadTableData = async (tableId: string) => {
    const filters = tableFilters[tableId] || { desde: '', hasta: '' };
    const desde = filters.desde || undefined;
    const hasta = filters.hasta || undefined;

    try {
      if (tableId === 'ventasPorModelo') {
        const data = await reportesService.getVentasPorModelo(desde, hasta);
        setVentasPorModelo(data);
      } else if (tableId === 'ventasPorVendedor') {
        const data = await reportesService.getVentasPorVendedor(desde, hasta);
        setVentasPorVendedor(data);
      } else if (tableId === 'topClientes') {
        const data = await reportesService.getTopClientes(5, desde, hasta);
        setTopClientes(data);
      } else if (tableId === 'rentabilidadModelo') {
        const data = await reportesService.getRentabilidadModelo(desde, hasta);
        setRentabilidadModelo(data);
      } else if (tableId === 'tasaConversion') {
        const data = await reportesService.getTasaConversion(desde, hasta);
        setTasaConversion(data);
      } else if (tableId === 'rentabilidadPedido') {
        const data = await reportesService.getRentabilidadCliente(50, desde, hasta);
        setRentabilidadPedido(data);
      } else if (tableId === 'estadoPedidos') {
        const data = await reportesService.getEstadoPedidos(20, desde, hasta);
        setEstadoPedidos(data);
      }
    } catch (error) {
      console.error(`Error reloading ${tableId}:`, error);
    }
  };

  // Agregar posiciones basadas en el ranking de ventas
  const addRankingsToVendedores = (data: any[]) => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => (b.total_facturado || 0) - (a.total_facturado || 0));
    return sorted.map((item, index) => ({
      ...item,
      posicion: index + 1
    }));
  };

  return (
    <div className="reportes-page">
      <div className="reportes-toolbar">
        <h1>Reportes</h1>
        <button onClick={loadAllReports} className="btn-refresh" disabled={loading}>
          {loading ? 'Cargando...' : '⟳ Actualizar'}
        </button>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'fase1' ? 'active' : ''}`} onClick={() => setActiveTab('fase1')}>Reportes Principales</button>
        <button className={`tab-btn ${activeTab === 'fase2' ? 'active' : ''}`} onClick={() => setActiveTab('fase2')}>Reportes Estratégicos</button>
        <button className={`tab-btn ${activeTab === 'fase3' ? 'active' : ''}`} onClick={() => setActiveTab('fase3')}>Reportes Detallado</button>
      </div>

      <div className="content-area">
        {activeTab === 'fase1' && (
          <div className="phase-section">
            <div className="section-header"><h2>Reportes Principales</h2></div>
            {dashboard && (
              <div className="dashboard-metrics">
                <div className="metric-card">
                  <label>Ventas Totales</label>
                  <div className="metric-value">${dashboard.resumen.total_ingresos?.toLocaleString('es-AR') || '0'}</div>
                </div>
                <div className="metric-card">
                  <label>Total Pedidos</label>
                  <div className="metric-value">{dashboard.resumen.cantidad_pedidos || '0'}</div>
                </div>
                <div className="metric-card">
                  <label>Pendiente Cobro</label>
                  <div className="metric-value">${dashboard.resumen.total_pendiente?.toLocaleString('es-AR') || '0'}</div>
                </div>
              </div>
            )}
            
            {ventasPorModelo && (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['ventasPorModelo']?.desde || ''} onChange={(e) => setTableFilter('ventasPorModelo', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['ventasPorModelo']?.hasta || ''} onChange={(e) => setTableFilter('ventasPorModelo', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('ventasPorModelo')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Ventas por Modelo" description="Muestra las ventas totales, cantidad vendida e ingresos brutos por cada modelo" columns={[{ key: 'nombreModelo', label: 'Modelo' }, { key: 'cantidad_vendida', label: 'Cantidad vendida', format: fmtNum }, { key: 'ingresos_brutos', label: 'Ingresos', format: fmtMoney }]} data={applyTableFilters(ventasPorModelo.data || [], 'ventasPorModelo')} summary={filterSummary(ventasPorModelo.resumen)} loading={loading} />
              </div>
            )}
            
            {ventasPorVendedor && (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['ventasPorVendedor']?.desde || ''} onChange={(e) => setTableFilter('ventasPorVendedor', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['ventasPorVendedor']?.hasta || ''} onChange={(e) => setTableFilter('ventasPorVendedor', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('ventasPorVendedor')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Ventas por Vendedor + Ranking" description="Desglose de ventas por vendedor con comparativa de desempeño, pedidos, facturación y posición en ranking" columns={[{ key: 'nombreVendedor', label: 'Vendedor' }, { key: 'cantidad_pedidos', label: 'Pedidos', format: fmtNum }, { key: 'total_facturado', label: 'Facturado', format: fmtMoney }, { key: 'ticket_promedio', label: 'Ticket Prom', format: fmtMoney }, { key: 'posicion', label: 'Posición', format: fmtNum }]} data={addRankingsToVendedores(applyTableFilters(ventasPorVendedor.data || [], 'ventasPorVendedor'))} summary={filterSummary(ventasPorVendedor.resumen)} loading={loading} />
              </div>
            )}
            
            {topClientes && (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['topClientes']?.desde || ''} onChange={(e) => setTableFilter('topClientes', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['topClientes']?.hasta || ''} onChange={(e) => setTableFilter('topClientes', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('topClientes')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Top Clientes" description="Ranking de los principales clientes por cantidad de pedidos y monto total gastado" columns={[{ key: 'nombreCliente', label: 'Cliente' }, { key: 'cantidadPedidos', label: 'Pedidos', format: fmtNum }, { key: 'totalGastado', label: 'Total', format: fmtMoney }, { key: 'promedio_por_pedido', label: 'Promedio', format: fmtMoney }]} data={applyTableFilters(topClientes.data || [], 'topClientes')} summary={filterSummary(topClientes.resumen)} loading={loading} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'fase2' && (
          <div className="phase-section">
            <div className="section-header"><h2>Reportes Estratégicos</h2></div>
            {rentabilidadModelo && rentabilidadModelo.data ? (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['rentabilidadModelo']?.desde || ''} onChange={(e) => setTableFilter('rentabilidadModelo', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['rentabilidadModelo']?.hasta || ''} onChange={(e) => setTableFilter('rentabilidadModelo', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('rentabilidadModelo')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Rentabilidad por Modelo" description="Análisis de costos, ingresos y márgenes de ganancia neta por modelo de producto" columns={[{ key: 'nombreModelo', label: 'Modelo' }, { key: 'cantidad', label: 'Unidades', format: fmtNum }, { key: 'costo_total', label: 'Costo', format: fmtMoney }, { key: 'ingresos_brutos', label: 'Ingresos', format: fmtMoney }, { key: 'ganancia_bruta', label: 'Ganancia', format: fmtMoney }, { key: 'margen_neto_pct', label: 'Margen %', format: fmtPct }]} data={applyTableFilters(rentabilidadModelo.data, 'rentabilidadModelo')} summary={filterSummary(rentabilidadModelo.resumen)} loading={loading} />
              </div>
            ) : <div className="empty-state">{loading ? 'Cargando...' : 'Sin datos'}</div>}
            
            {tasaConversion && tasaConversion.por_vendedor ? (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['tasaConversion']?.desde || ''} onChange={(e) => setTableFilter('tasaConversion', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['tasaConversion']?.hasta || ''} onChange={(e) => setTableFilter('tasaConversion', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('tasaConversion')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Tasa de Conversión" description="Porcentaje de presupuestos convertidos en pedidos por vendedor" columns={[{ key: 'nombreVendedor', label: 'Vendedor' }, { key: 'presupuestos', label: 'Presupuestos', format: fmtNum }, { key: 'pedidos', label: 'Pedidos', format: fmtNum }, { key: 'tasa_conversion', label: 'Tasa %', format: fmtPct }]} data={applyTableFilters(tasaConversion.por_vendedor, 'tasaConversion')} summary={filterSummary(tasaConversion.tasa_global)} loading={loading} />
              </div>
            ) : <div className="empty-state">{loading ? 'Cargando...' : 'Sin datos'}</div>}
          </div>
        )}

        {activeTab === 'fase3' && (
          <div className="phase-section">
            <div className="section-header"><h2>Análisis Detallado</h2></div>
            {rentabilidadPedido && rentabilidadPedido.data ? (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['rentabilidadPedido']?.desde || ''} onChange={(e) => setTableFilter('rentabilidadPedido', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['rentabilidadPedido']?.hasta || ''} onChange={(e) => setTableFilter('rentabilidadPedido', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('rentabilidadPedido')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Rentabilidad por Pedido" description="Detalle de rentabilidad individual por pedido incluyendo cliente, monto, costo y margen obtenido" columns={[{ key: 'nombreCliente', label: 'Cliente' }, { key: 'ingresos', label: 'Ingresos', format: fmtMoney }, { key: 'costo_total', label: 'Costo', format: fmtMoney }, { key: 'ganancia_bruta', label: 'Ganancia', format: fmtMoney }, { key: 'margen_neto_pct', label: 'Margen %', format: fmtPct }]} data={applyTableFilters(rentabilidadPedido.data, 'rentabilidadPedido')} summary={filterSummary(rentabilidadPedido.resumen)} loading={loading} />
              </div>
            ) : <div className="empty-state">{loading ? 'Cargando...' : 'Sin datos'}</div>}
            
            {estadoPedidos && estadoPedidos.resumen_estado ? (
              <div className="table-with-filters">
                <div className="table-date-filters">
                  <div className="filter-group">
                    <label>Desde:</label>
                    <input type="date" value={tableFilters['estadoPedidos']?.desde || ''} onChange={(e) => setTableFilter('estadoPedidos', 'desde', e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>Hasta:</label>
                    <input type="date" value={tableFilters['estadoPedidos']?.hasta || ''} onChange={(e) => setTableFilter('estadoPedidos', 'hasta', e.target.value)} />
                  </div>
                  <button onClick={() => reloadTableData('estadoPedidos')} className="btn-apply-filters" style={{ marginTop: '1.5rem' }}>Aplicar</button>
                </div>
                <ExportableTable title="Estado de Pedidos" description="Resumen de pedidos agrupados por estado con montos totales y pendientes de cobro" columns={[{ key: '_id', label: 'Estado' }, { key: 'cantidad', label: 'Cantidad', format: fmtNum }, { key: 'monto', label: 'Monto', format: fmtMoney }, { key: 'monto_pendiente', label: 'Pendiente', format: fmtMoney }]} data={applyTableFilters(estadoPedidos.resumen_estado, 'estadoPedidos')} summary={filterSummary(estadoPedidos.estadisticas_tiempo)} loading={loading} />
              </div>
            ) : <div className="empty-state">{loading ? 'Cargando...' : 'Sin datos'}</div>}
          </div>
        )}

      </div>
    </div>
  );
};

export default Reportes;

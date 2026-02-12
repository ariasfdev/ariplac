import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesService } from '../services/reportes.service';
import '../styles/Reportes.css';

const Reportes: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await reportesService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportes = [
    {
      title: 'Ventas por Modelo',
      description: 'Análisis de ventas totales por cada modelo de producto',
      path: '/home/reportes/ventas-modelo',
      fase: 'Principales'
    },
    {
      title: 'Ventas por Vendedor',
      description: 'Performance y ranking de vendedores',
      path: '/home/reportes/ventas-vendedor',
      fase: 'Principales'
    },
    // {
    //   title: 'Top Clientes',
    //   description: 'Mejores clientes por volumen de compra',
    //   path: '/home/reportes/top-clientes',
    //   fase: 'Principales'
    // },
    {
      title: 'Rentabilidad por Modelo',
      description: 'Márgenes y costos por producto',
      path: '/home/reportes/rentabilidad-modelo',
      fase: 'Estratégicos'
    },
    {
      title: 'Tasa de Conversión',
      description: 'Conversión de presupuestos a pedidos',
      path: '/home/reportes/tasa-conversion',
      fase: 'Estratégicos'
    },
    // {
    //   title: 'Rentabilidad por Pedido',
    //   description: 'Análisis detallado de cada pedido',
    //   path: '/home/reportes/rentabilidad-pedido',
    //   fase: 'Detallado'
    // },
    {
      title: 'Estado de Pedidos',
      description: 'Seguimiento y cartera de cobranza',
      path: '/home/reportes/estado-pedidos',
      fase: 'Detallado'
    }
  ];

  const faseGroups = {
    'Principales': reportes.filter(r => r.fase === 'Principales'),
    'Estratégicos': reportes.filter(r => r.fase === 'Estratégicos'),
    'Detallado': reportes.filter(r => r.fase === 'Detallado')
  };

  return (
    <div className="reportes-page">
      <div className="reportes-toolbar">
        <h1>Reportes</h1>
        <button onClick={loadDashboard} className="btn-refresh" disabled={loading}>
          {loading ? 'Cargando...' : '⟳ Actualizar Dashboard'}
        </button>
      </div>

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

      <div className="reportes-index">
        {Object.entries(faseGroups).map(([fase, items]) => (
          <div key={fase} className="fase-group">
            <h2 className="fase-title">{fase}</h2>
            <div className="reportes-grid">
              {items.map((reporte) => (
                <div
                  key={reporte.path}
                  className="reporte-card"
                  onClick={() => navigate(reporte.path)}
                >
                  <h3>{reporte.title}</h3>
                  <p>{reporte.description}</p>
                  <button className="btn-view">Ver Reporte →</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reportes;

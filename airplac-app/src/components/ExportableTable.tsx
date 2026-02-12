import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/ExportableTable.css';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
  width?: number;
}

interface ExportableTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: any[];
  summary?: Record<string, any>;
  loading?: boolean;
  error?: string;
  rowsPerPage?: number;
}

const ExportableTable: React.FC<ExportableTableProps> = ({
  title,
  description,
  columns,
  data,
  summary,
  loading = false,
  error,
  rowsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const formatSummaryLabel = (rawKey: string) => {
    const withSpaces = rawKey
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    if (!withSpaces) return rawKey;

    return withSpaces
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
      .join(' ');
  };

  const exportToExcel = () => {
    try {
      // Preparar datos para Excel
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((row) => {
          const newRow: Record<string, any> = {};
          columns.forEach((col) => {
            const value = row[col.key];
            newRow[col.label] = col.format ? col.format(value) : value;
          });
          return newRow;
        })
      );

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);

      // Descargar
      XLSX.writeFile(workbook, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Error al exportar a Excel');
    }
  };

  if (loading) {
    return <div className="table-container loading">Cargando...</div>;
  }

  if (error) {
    return <div className="table-container error">Error: {error}</div>;
  }

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <h2>{title}</h2>
          {description && (
            <div className="tooltip-wrapper">
              <span 
                className="table-info-icon" 
                data-tooltip={description}
              >
                ℹ
              </span>
            </div>
          )}
        </div>
        <button onClick={exportToExcel} className="export-btn" disabled={data.length === 0}>
          📥 Exportar a Excel
        </button>
      </div>

      {summary && (
        <div className="table-summary">
          {Object.entries(summary).map(([key, value]) => {
            let displayValue = '-';
            try {
              if (value === null || value === undefined) {
                displayValue = '-';
              } else if (typeof value === 'number') {
                displayValue = value.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              } else if (typeof value === 'string') {
                displayValue = value;
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              } else {
                displayValue = String(value);
              }
            } catch (e) {
              displayValue = '-';
            }

            return (
              <div key={key} className="summary-item">
                <span className="summary-label">{formatSummaryLabel(key)}:</span>
                <span className="summary-value">{displayValue}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              (() => {
                const totalPages = Math.ceil(data.length / rowsPerPage);
                const startIndex = (currentPage - 1) * rowsPerPage;
                const endIndex = startIndex + rowsPerPage;
                const paginatedData = data.slice(startIndex, endIndex);

                return paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => {
                      const value = row[col.key];
                      let displayValue = '-';
                      
                      try {
                        if (value === null || value === undefined) {
                          displayValue = '-';
                        } else if (col.format) {
                          displayValue = col.format(value);
                        } else if (typeof value === 'object') {
                          displayValue = JSON.stringify(value);
                        } else {
                          displayValue = String(value);
                        }
                      } catch (e) {
                        displayValue = '-';
                      }
                      
                      return (
                        <td key={col.key} align={typeof value === 'number' ? 'right' : 'left'}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                  Sin datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-info">
            {(() => {
              const totalPages = Math.ceil(data.length / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage + 1;
              const endIndex = Math.min(currentPage * rowsPerPage, data.length);
              return `Mostrando ${startIndex}-${endIndex} de ${data.length}`;
            })()}
          </span>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ⟨⟨ Primera
          </button>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⟨ Anterior
          </button>

          {(() => {
            const totalPages = Math.ceil(data.length / rowsPerPage);
            const pages = [];
            const maxVisible = 5;
            
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage + 1 < maxVisible) {
              startPage = Math.max(1, endPage - maxVisible + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`page-number ${currentPage === i ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i}
                </button>
              );
            }
            return pages;
          })()}

          <button
            className="pagination-btn"
            onClick={() => {
              const totalPages = Math.ceil(data.length / rowsPerPage);
              setCurrentPage(prev => Math.min(prev + 1, totalPages));
            }}
            disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
          >
            Siguiente ⟩
          </button>

          <button
            className="pagination-btn"
            onClick={() => {
              const totalPages = Math.ceil(data.length / rowsPerPage);
              setCurrentPage(totalPages);
            }}
            disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
          >
            Última ⟩⟩
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportableTable;

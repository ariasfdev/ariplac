import React from "react";
import Modal from "./Modal";
import { FaCheckCircle, FaCog, FaInfoCircle } from "react-icons/fa";

interface ModeloStockCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStockConfig: () => void;
  modelo: {
    _id: string;
    producto: string;
    modelo: string;
    ancho: string;
    alto: string;
    tipo: string;
    placas_por_metro: number;
    fecha_creacion?: string;
  };
  stock: {
    _id: string;
    producto: string;
    modelo: string;
    idModelo?: string;
    stock: number | undefined;
    unidad: string;
    produccion_diaria: number | undefined;
    valor: number | undefined;
    promo1: number | undefined;
    promo2: number | undefined;
    promo3: number | undefined;
    stockActivo: boolean;
    porcentaje_ganancia: number | undefined;
    porcentaje_tarjeta: number | undefined;
    total_redondeo: number | undefined;
  };
}

const ModeloStockCreatedModal: React.FC<ModeloStockCreatedModalProps> = ({
  isOpen,
  onClose,
  onGoToStockConfig,
  modelo,
  stock,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-base-200 p-6 rounded-lg max-w-2xl mx-auto">
        {/* Header con icono de éxito */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Producto Creado Exitosamente!
          </h2>
          <p className="text-gray-600">
            El modelo y stock han sido creados correctamente
          </p>
        </div>

        {/* Información del modelo creado */}
        <div className="bg-white p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" />
            Detalles del Modelo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Modelo:</span>
              <span className="ml-2 text-gray-900">{modelo.modelo}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Producto:</span>
              <span className="ml-2 text-gray-900">{modelo.producto}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Dimensiones:</span>
              <span className="ml-2 text-gray-900">
                {modelo.ancho} x {modelo.alto}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <span className="ml-2 text-gray-900">{modelo.tipo}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Placas/m²:</span>
              <span className="ml-2 text-gray-900">
                {modelo.placas_por_metro}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <span className="ml-2 text-gray-900">
                {modelo.fecha_creacion
                  ? new Date(modelo.fecha_creacion).toLocaleDateString("es-AR")
                  : "No especificada"}
              </span>
            </div>
          </div>
        </div>

        {/* Estado del stock */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <FaCog className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Stock Requiere Configuración
              </h4>
              <p className="text-yellow-700 text-sm mb-3">
                El stock se encuentra <strong>inactivo</strong> hasta que se
                agregue stock inicial y configuren los precios. Es necesario
                establecer la cantidad inicial y los valores de costo, precios y
                configuración de ganancias.
              </p>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <p className="text-xs text-yellow-600 font-medium">
                  Stock actual: {stock.stock || 0} {stock.unidad} | Estado:{" "}
                  <span
                    className={
                      stock.stockActivo ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stock.stockActivo ? "Activo" : "Inactivo"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button className="btn btn-outline btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={onGoToStockConfig}>
            <FaCog className="w-4 h-4 mr-2" />
            Agregar Stock y Configurar Precio
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Puedes agregar stock y configurar precios más tarde desde la sección
            de Stock
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ModeloStockCreatedModal;

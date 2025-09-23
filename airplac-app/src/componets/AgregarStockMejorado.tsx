import React, { useState } from "react";
import { FaBox, FaUser } from "react-icons/fa";
import Modal from "./Modal";

interface AgregarStockMejoradoProps {
  isOpen: boolean;
  onClose: () => void;
  idStock: string;
  stockActual: number;
  stockReservado: number;
  unidad: string;
  producto: string;
  modelo: string;
  onSave: (
    tipo: "add" | "subtract",
    valor: number,
    responsable: string
  ) => void;
}

const AgregarStockMejorado: React.FC<AgregarStockMejoradoProps> = ({
  isOpen,
  onClose,
  idStock,
  stockActual,
  stockReservado,
  unidad,
  producto,
  modelo,
  onSave,
}) => {
  const [valor, setValor] = useState<number | undefined>(undefined);
  const [responsable, setResponsable] = useState<string>("Agustin Fernandez");

  // Calcular stock disponible
  const stockDisponible = stockActual - stockReservado;

  // Calcular el resultado de la operación
  const calcularResultado = (): number => {
    if (!valor) return stockActual;
    return stockActual + valor; // valor puede ser positivo (suma) o negativo (resta)
  };

  const resultado = calcularResultado();
  const isResultadoNegativo = resultado < 0;

  const handleSave = () => {
    if (!valor || !responsable) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    // Determinar si es suma o resta según el signo
    const esSuma = valor >= 0;
    const valorAbsoluto = Math.abs(valor);

    if (!esSuma) {
      // Validar que no se reste más del stock disponible
      // Si el stock disponible es negativo, no se puede restar nada
      if (stockDisponible < 0) {
        alert(
          `No se puede restar cuando el stock disponible es ${stockDisponible}. El stock está sobrerreservado. Solo se puede sumar stock.`
        );
        return;
      }
      
      if (valorAbsoluto > stockDisponible) {
        alert(
          `No se puede restar ${valorAbsoluto} unidades. Stock disponible: ${stockDisponible} (Total: ${stockActual}, Reservado: ${stockReservado})`
        );
        return;
      }
    }

    const operacionReal = esSuma ? "add" : "subtract";
    onSave(operacionReal, valorAbsoluto, responsable);

    // Limpiar formulario
    setValor(undefined);
  };

  const handleClose = () => {
    setValor(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-base-200 p-6 rounded-lg max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">Gestionar Stock</h2>
        
        {/* Información del producto */}
        <div className="bg-base-100 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Producto: <span className="font-medium">{producto}</span></p>
          <p className="text-sm text-gray-600">Modelo: <span className="font-medium">{modelo}</span></p>
          <p className="text-sm text-gray-600">
            Stock total: <span className="font-bold text-lg">{stockActual} {unidad}</span>
          </p>
          <p className="text-sm text-gray-600">
            Stock reservado: <span className="font-medium text-orange-600">{stockReservado} {unidad}</span>
          </p>
          <p className="text-sm text-gray-600">
            Stock disponible: <span className={`font-bold ${stockDisponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stockDisponible} {unidad}
              {stockDisponible < 0 && ' (Sobrerreservado)'}
            </span>
          </p>
        </div>

        {/* Descripción de la operación */}
        <div className="bg-base-100 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            Ingrese un número <strong>positivo</strong> para <span className="text-green-600">sumar</span> o un número <strong>negativo</strong> para <span className="text-red-600">restar</span>
            <br />
            <span className="text-xs text-gray-500">
              Ejemplos: 45 (suma 45), -20 (resta 20)
            </span>
            <br />
            {stockDisponible > 0 ? (
              <span className="text-xs text-orange-500 font-medium">
                ⚠️ Solo se puede restar del stock disponible ({stockDisponible} {unidad})
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium">
                🚫 No se puede restar - Stock sobrerreservado ({stockDisponible} {unidad}). Solo suma permitida.
              </span>
            )}
          </p>
        </div>

        {/* Input de valor */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Cantidad (+/-):
          </label>
          <div className="relative">
            <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            <input
              type="number"
              className="input input-bordered w-full pl-10"
              value={valor || ""}
              onChange={(e) => {
                const value = e.target.value;
                setValor(value === "" ? undefined : Number(value));
              }}
              placeholder="Ej: 45 (suma) o -20 (resta)"
            />
          </div>
        </div>

        {/* Input de responsable */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Responsable:</label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </div>
        </div>

        {/* Preview del resultado */}
        {valor !== undefined && (
          <div className={`p-3 rounded-lg mb-4 ${
            isResultadoNegativo ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resultado:</span>
              <div className="text-right">
                <div className="text-xs text-gray-600">
                  {`${stockActual} ${valor >= 0 ? "+" : ""} ${valor} =`}
                </div>
                <div className={`text-lg font-bold ${
                  isResultadoNegativo ? "text-red-600" : "text-green-600"
                }`}>
                  {resultado} {unidad}
                </div>
              </div>
            </div>
            {isResultadoNegativo && (
              <p className="text-red-600 text-xs mt-1">
                ⚠️ El resultado sería negativo. Esta operación no está permitida.
              </p>
            )}
            {valor !== undefined && valor < 0 && stockDisponible <= 0 && (
              <p className="text-red-600 text-xs mt-1">
                🚫 No se puede restar cuando el stock está sobrerreservado (disponible: {stockDisponible}).
              </p>
            )}
            {valor !== undefined && valor < 0 && stockDisponible > 0 && Math.abs(valor) > stockDisponible && (
              <p className="text-red-600 text-xs mt-1">
                ⚠️ No se puede restar {Math.abs(valor)} del stock disponible ({stockDisponible}).
              </p>
            )}
            {valor !== undefined && (
              <div className="mt-2 text-xs text-gray-600">
                {valor >= 0 ? (
                  <span className="text-green-600">✓ Suma de {valor} unidades</span>
                ) : stockDisponible > 0 && Math.abs(valor) <= stockDisponible ? (
                  <span className="text-orange-600">✓ Resta de {Math.abs(valor)} unidades</span>
                ) : (
                  <span className="text-red-600">✗ Operación no permitida</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button className="btn btn-outline" onClick={handleClose}>
            Cancelar
          </button>
          <button 
            className={`btn ${
              (valor !== undefined && valor >= 0) ? "btn-success" : "btn-warning"
            }`}
            onClick={handleSave}
            disabled={
              valor === undefined || 
              !responsable || 
              isResultadoNegativo ||
              (valor < 0 && stockDisponible <= 0) ||
              (valor < 0 && stockDisponible > 0 && Math.abs(valor) > stockDisponible)
            }
          >
            {(valor !== undefined && valor >= 0) ? "Sumar" : "Restar"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AgregarStockMejorado;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Modal from "./Modal";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";

interface PreciosMasivosProps {
  isOpen: boolean;
  onClose: () => void;
  producto: string;
  tipo: "actualizar" | "adicional";
  onSuccess: () => void;
}

interface Modelo {
  _id: string;
  modelo: string;
  producto: string;
}

interface PreviewData {
  precios_creados: any;
  total_modelos: number;
  exitosos: number;
  no_actualizados: number;
  excluidos: number;
  sin_precio_base?: number;
  actualizados: any[];
  con_pedidos_activos: any[];
  modelos_excluidos: any[];
  sin_precio_base_lista?: any[];
}

const PreciosMasivos: React.FC<PreciosMasivosProps> = ({
  isOpen,
  onClose,
  producto,
  tipo,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [excluidos, setExcluidos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Campos para actualización
  const [costo, setCosto] = useState<string>("");
  const [porcentajeGanancia, setPorcentajeGanancia] = useState<string>("");
  const [ganancia, setGanancia] = useState<number | undefined>(undefined);
  const [gananciaInput, setGananciaInput] = useState<string>("");
  const [porcentajeTarjeta, setPorcentajeTarjeta] = useState<string>("");
  const [totalRedondeo, setTotalRedondeo] = useState<string>("");
  const [editingGanancia, setEditingGanancia] = useState<boolean>(false);
  const [editingPorcentaje, setEditingPorcentaje] = useState<boolean>(false);
  
  // Campos para adicional
  const [nombrePrecio, setNombrePrecio] = useState<string>("");
  
  // Preview y resultados
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  
  // Modales
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (isOpen && producto) {
      fetchModelos();
      resetForm();
    }
  }, [isOpen, producto]);

  const resetForm = () => {
    setStep(1);
    setExcluidos([]);
    setCosto("");
    setPorcentajeGanancia("");
    setGanancia(undefined);
    setGananciaInput("");
    setPorcentajeTarjeta("");
    setTotalRedondeo("");
    setNombrePrecio("");
    setPreviewData(null);
    setResultData(null);
  };

  // Sincronizar ganancia en pesos cuando cambian costo o % de ganancia
  // Helper: format fraction trimming trailing zeros (0.50 -> 0.5)
  const formatFraction = (n: number, decimals = 2) => {
    return Number(n.toFixed(decimals)).toString();
  };

  useEffect(() => {
    const costoNum = costo ? parseFloat(costo) : 0;
    const porcentajeFrac = porcentajeGanancia ? parseFloat(porcentajeGanancia) : 0;

    // porcentajeGanancia is stored as a percentage number (e.g. 50 = 50%) to match ModificarPrecio
    if (!editingPorcentaje && !editingGanancia) {
      if (costoNum > 0 && porcentajeFrac > 0) {
        const gananciaCalculada = costoNum * (porcentajeFrac / 100);
        const g = Number(gananciaCalculada.toFixed(2));
        setGanancia(g);
        setGananciaInput(
          `$${g.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        );
      } else {
        setGanancia(undefined);
        setGananciaInput("");
      }
    }
  }, [costo, porcentajeGanancia, editingGanancia, editingPorcentaje]);

  const handleGananciaChange = (value: number | undefined) => {
    setGanancia(value !== undefined ? Number(value.toFixed(2)) : undefined);

    if (value !== undefined && value > 0 && costo && Number(costo) > 0) {
      // Copy ModificarPrecio behavior: porcentaje = (ganancia / costo) * 100
      const porcentajeCalculado = (value / Number(costo)) * 100;
      setPorcentajeGanancia(Number(porcentajeCalculado.toFixed(2)).toString());
    } else if (value === undefined || value === 0) {
      setPorcentajeGanancia("");
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/modelos/`);
      const modelosDelProducto = response.data.filter(
        (m: any) => m.producto === producto
      );
      setModelos(modelosDelProducto);
    } catch (err) {
      console.error("Error al cargar modelos:", err);
    }
  };

  const validateStep1 = (): boolean => {
    if (tipo === "actualizar") {
      if (!costo && !porcentajeGanancia && !porcentajeTarjeta && !totalRedondeo) {
        setError("Debe ingresar al menos un campo para actualizar");
        return false;
      }
    } else {
      // Para precio adicional, aceptamos que el usuario ingrese porcentaje de ganancia
      // o bien la ganancia en pesos. Por eso validamos cualquiera de los dos.
      if (
        !nombrePrecio ||
        !costo ||
        (!porcentajeGanancia && ganancia === undefined) ||
        !porcentajeTarjeta
      ) {
        setError("Todos los campos son requeridos para crear un precio adicional");
        return false;
      }
    }
    return true;
  };

  const handleVistaPrevia = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const endpoint =
        tipo === "actualizar"
          ? `${API_BASE_URL}/stock/precios/masivo/actualizar?preview=true`
          : `${API_BASE_URL}/stock/precios/masivo/adicional?preview=true`;

      const payload =
        tipo === "actualizar"
          ? {
              producto,
              excluidos,
              actualizacion: {
                ...(costo && { costo: parseFloat(costo) }),
                ...(porcentajeGanancia && { porcentaje_ganancia: parseFloat(porcentajeGanancia) }),
                ...(porcentajeTarjeta && { porcentaje_tarjeta: parseFloat(porcentajeTarjeta) }),
                ...(totalRedondeo && { total_redondeo: parseFloat(totalRedondeo) }),
              },
            }
          : {
              producto,
              excluidos,
              nuevo_precio: {
                nombre_precio: nombrePrecio,
                costo: parseFloat(costo),
                porcentaje_ganancia: parseFloat(porcentajeGanancia),
                porcentaje_tarjeta: parseFloat(porcentajeTarjeta),
                total_redondeo: totalRedondeo ? parseFloat(totalRedondeo) : 0,
              },
            };

      const method = tipo === "actualizar" ? "put" : "post";
      const response = await axios[method](endpoint, payload);

      setPreviewData(response.data.detalles);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al generar vista previa");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarActualizacion = async () => {
    setLoading(true);
    try {
      const endpoint =
        tipo === "actualizar"
          ? `${API_BASE_URL}/stock/precios/masivo/actualizar`
          : `${API_BASE_URL}/stock/precios/masivo/adicional`;

      const payload =
        tipo === "actualizar"
          ? {
              producto,
              excluidos,
              actualizacion: {
                ...(costo && { costo: parseFloat(costo) }),
                ...(porcentajeGanancia && { porcentaje_ganancia: parseFloat(porcentajeGanancia) }),
                ...(porcentajeTarjeta && { porcentaje_tarjeta: parseFloat(porcentajeTarjeta) }),
                ...(totalRedondeo && { total_redondeo: parseFloat(totalRedondeo) }),
              },
            }
          : {
              producto,
              excluidos,
              nuevo_precio: {
                nombre_precio: nombrePrecio,
                costo: parseFloat(costo),
                porcentaje_ganancia: parseFloat(porcentajeGanancia),
                porcentaje_tarjeta: parseFloat(porcentajeTarjeta),
                total_redondeo: totalRedondeo ? parseFloat(totalRedondeo) : 0,
              },
            };

      const method = tipo === "actualizar" ? "put" : "post";
      const response = await axios[method](endpoint, payload);

      setResultData(response.data);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al realizar la actualización");
      setStep(2); // Volver al paso 2 si hay error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleExcluido = (modeloId: string) => {
    setExcluidos((prev) =>
      prev.includes(modeloId)
        ? prev.filter((id) => id !== modeloId)
        : [...prev, modeloId]
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <h2 className="text-2xl font-bold mb-4 text-primary">
            {tipo === "actualizar" ? "Actualizar Precios Masivos" : "Crear Precio Adicional Masivo"}
          </h2>
          <p className="text-base-content/70 mb-6">
            Producto: <span className="font-bold">{producto}</span>
          </p>

          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-base-content/30'}`}>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 hidden sm:inline">Configuración</span>
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-base-content/30'}`}>
              <div className={`w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300'} flex items-center justify-center font-bold`}>
                2
              </div>
              <span className="ml-2 hidden sm:inline">Vista Previa</span>
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-base-content/30'}`}>
              <div className={`w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300'} flex items-center justify-center font-bold`}>
                3
              </div>
              <span className="ml-2 hidden sm:inline">Resultados</span>
            </div>
          </div>

          {/* Step 1: Configuración */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Campos de precio */}
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold mb-4">Configuración de Precios</h3>
                
                {tipo === "adicional" && (
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Nombre del Precio *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={nombrePrecio}
                      onChange={(e) => setNombrePrecio(e.target.value)}
                      placeholder="Ej: Promo Verano 2026"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Costo {tipo === "adicional" && "*"}
                      </span>
                    </label>
                    <div className="relative mb-0">
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={costo ? `$${Number(costo).toLocaleString("es-AR")}` : ""}
                        onChange={(e) => {
                            // Match ModificarPrecio: keep only digits (treat input as integer units)
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            setCosto(raw === "" ? "" : String(Number(raw)));
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Ganancia (ARS)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={gananciaInput}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/\./g, "");
                        value = value.replace(/,/g, ".");
                        value = value.replace(/[^\d.]/g, "");
                        const parts = value.split('.');
                        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
                        setGananciaInput(value);
                        const numValue = value === "" ? undefined : Number(value);
                        handleGananciaChange(numValue);
                      }}
                      onBlur={() => {
                        setEditingGanancia(false);
                        if (ganancia !== undefined && ganancia > 0) {
                          setGananciaInput(
                            `$${ganancia.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          );
                        } else {
                          setGananciaInput("");
                        }
                      }}
                      onFocus={() => {
                        setEditingGanancia(true);
                        if (ganancia !== undefined && ganancia > 0) {
                          setGananciaInput(ganancia.toString());
                        } else {
                          setGananciaInput("");
                        }
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        % Ganancia {tipo === "adicional" && "*"}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={porcentajeGanancia}
                      onChange={(e) => {
                        // allow fractional input like 0.5
                        const v = e.target.value.replace(/,/g, '.').replace(/[^\d.]/g, '');
                        setPorcentajeGanancia(v);
                      }}
                      onFocus={() => setEditingPorcentaje(true)}
                      onBlur={() => {
                        setEditingPorcentaje(false);
                        // format fraction to trimmed decimals (e.g. 0.5000 -> 0.5)
                        if (porcentajeGanancia) {
                          const n = parseFloat(porcentajeGanancia);
                          if (!isNaN(n)) setPorcentajeGanancia(formatFraction(n, 4));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        % Tarjeta {tipo === "adicional" && "*"}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={porcentajeTarjeta}
                      onChange={(e) => setPorcentajeTarjeta(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Redondeo</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={totalRedondeo}
                      onChange={(e) => setTotalRedondeo(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Modelos a excluir */}
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold mb-4">
                  Excluir Modelos <span className="text-sm font-normal text-base-content/60">({excluidos.length} seleccionados)</span>
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {modelos.map((modelo) => (
                    <label key={modelo._id} className="flex items-center gap-2 p-2 hover:bg-base-300 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={excluidos.includes(modelo._id)}
                        onChange={() => toggleExcluido(modelo._id)}
                      />
                      <span>{modelo.modelo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost" onClick={handleClose}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleVistaPrevia}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Vista Previa de Cambios"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Vista Previa */}
          {step === 2 && previewData && (
            <div className="space-y-6">
              {/* Resumen en cards más compacto */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-200 p-4 rounded-lg text-center">
                  <div className="text-sm text-base-content/60">Total Modelos</div>
                  <div className="text-3xl font-bold text-primary">{previewData.total_modelos}</div>
                </div>
                <div className="bg-success/10 p-4 rounded-lg text-center border border-success">
                  <div className="text-sm text-base-content/60">Se Actualizarán</div>
                  <div className="text-3xl font-bold text-success">{previewData.exitosos}</div>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg text-center border border-warning">
                  <div className="text-sm text-base-content/60">Con Pedidos</div>
                  <div className="text-3xl font-bold text-warning">{previewData.no_actualizados}</div>
                </div>
                <div className="bg-error/10 p-4 rounded-lg text-center border border-error">
                  <div className="text-sm text-base-content/60">Excluidos</div>
                  <div className="text-3xl font-bold text-error">{previewData.excluidos}</div>
                </div>
              </div>

              {/* Detalles */}
              <div className="space-y-4">
                {/* Modelos que se actualizarán/crearán */}
                {tipo === "actualizar" && previewData.actualizados?.length > 0 && (
                  <div className="collapse collapse-arrow bg-success/10 border border-success">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title font-bold text-success">
                      ✅ Modelos que se actualizarán ({previewData.actualizados.length})
                    </div>
                    <div className="collapse-content max-h-60 overflow-y-auto">
                      {previewData.actualizados.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-base-100 rounded-lg mb-2">
                          <p className="font-bold text-base">{item.modelo}</p>
                          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                            <div className="text-base-content/60">
                              <p className="font-semibold mb-1">Antes:</p>
                              <p>Precio base: ${item.precio_anterior.precio}</p>
                              <p>Con tarjeta: ${item.precio_anterior.precioTarjeta}</p>
                            </div>
                            <div className="text-success">
                              <p className="font-semibold mb-1">Después:</p>
                              <p>Precio base: ${item.precio_nuevo.precio}</p>
                              <p>Con tarjeta: ${item.precio_nuevo.precioTarjeta}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precios adicionales que se crearán */}
                {tipo === "adicional" && previewData.precios_creados?.length > 0 && (
                  <div className="collapse collapse-arrow bg-success/10 border border-success">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title font-bold text-success">
                      ✅ Precios que se crearán ({previewData.precios_creados.length})
                    </div>
                    <div className="collapse-content max-h-60 overflow-y-auto">
                      {previewData.precios_creados.map((item: any, idx: number) => (
                        <div key={idx} className="p-2 bg-base-100 rounded mb-2">
                          <p className="font-bold">{item.modelo}</p>
                          <div className="text-sm">
                            <p className="text-base-content/60">
                              Nombre: {item.nuevo_precio.nombre_precio}
                            </p>
                            <p className="text-success">
                              ${item.nuevo_precio.precio} / ${item.nuevo_precio.precioTarjeta}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modelos con pedidos activos */}
                {previewData.con_pedidos_activos.length > 0 && (
                  <div className="collapse collapse-arrow bg-warning/10 border border-warning">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title font-bold text-warning">
                      ⚠️ Modelos con pedidos activos - NO se actualizarán ({previewData.con_pedidos_activos.length})
                    </div>
                    <div className="collapse-content max-h-60 overflow-y-auto">
                      {previewData.con_pedidos_activos.map((item: any, idx: number) => (
                        <div key={idx} className="p-2 bg-base-100 rounded mb-2">
                          <p className="font-bold">{item.modelo}</p>
                          <p className="text-sm text-base-content/60">
                            {item.pedidos_activos.length} pedidos activos
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modelos excluidos */}
                {previewData.modelos_excluidos.length > 0 && (
                  <div className="collapse collapse-arrow bg-error/10 border border-error">
                    <input type="checkbox" />
                    <div className="collapse-title font-bold text-error">
                      🚫 Modelos excluidos manualmente ({previewData.modelos_excluidos.length})
                    </div>
                    <div className="collapse-content max-h-60 overflow-y-auto">
                      {previewData.modelos_excluidos.map((item: any, idx: number) => (
                        <div key={idx} className="p-2 bg-base-100 rounded mb-2">
                          <p className="font-bold">{item.modelo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  Volver
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmarActualizacion}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Confirmar Actualización"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Resultados */}
          {step === 3 && resultData && (
            <div className="space-y-6">
              <div className="alert alert-success shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-xl">¡Actualización Completada!</h3>
                  <p className="text-lg">{resultData.resumen.exitosos} modelos actualizados correctamente</p>
                </div>
              </div>

              {/* Resumen detallado */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-success/10 p-4 rounded-lg text-center border-2 border-success">
                  <div className="text-sm text-base-content/60">Exitosos</div>
                  <div className="text-4xl font-bold text-success">{resultData.resumen.exitosos}</div>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg text-center border-2 border-warning">
                  <div className="text-sm text-base-content/60">No Actualizados</div>
                  <div className="text-4xl font-bold text-warning">{resultData.resumen.no_actualizados || 0}</div>
                </div>
                <div className="bg-error/10 p-4 rounded-lg text-center border-2 border-error">
                  <div className="text-sm text-base-content/60">Excluidos</div>
                  <div className="text-4xl font-bold text-error">{resultData.resumen.excluidos}</div>
                </div>
                <div className="bg-base-200 p-4 rounded-lg text-center border-2 border-base-300">
                  <div className="text-sm text-base-content/60">Total</div>
                  <div className="text-4xl font-bold text-primary">{resultData.resumen.total_modelos}</div>
                </div>
              </div>

              {/* Detalles de actualizaciones */}
              {tipo === "actualizar" && resultData.detalles?.actualizados?.length > 0 && (
                <div className="collapse collapse-arrow bg-success/10 border-2 border-success">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title font-bold text-success text-lg">
                    ✅ Modelos actualizados exitosamente ({resultData.detalles.actualizados.length})
                  </div>
                  <div className="collapse-content max-h-80 overflow-y-auto">
                    <div className="space-y-2 mt-2">
                      {resultData.detalles.actualizados.map((item: any, idx: number) => (
                        <div key={idx} className="bg-base-100 p-3 rounded-lg shadow">
                          <p className="font-bold text-lg">{item.modelo}</p>
                          <div className="text-sm mt-2 grid grid-cols-2 gap-4">
                            <div className="text-base-content/60">
                              <p className="font-semibold mb-2">Antes:</p>
                              <p>Costo: ${item.precio_anterior.costo}</p>
                              <p>Precio base: ${item.precio_anterior.precio}</p>
                              <p>Con tarjeta: ${item.precio_anterior.precioTarjeta}</p>
                            </div>
                            <div className="text-success">
                              <p className="font-semibold mb-2">Después:</p>
                              <p className="font-medium">Costo: ${item.precio_nuevo.costo}</p>
                              <p className="font-medium">Precio base: ${item.precio_nuevo.precio}</p>
                              <p className="font-medium">Con tarjeta: ${item.precio_nuevo.precioTarjeta}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Precios adicionales creados */}
              {tipo === "adicional" && resultData.detalles?.precios_creados?.length > 0 && (
                <div className="collapse collapse-arrow bg-success/10 border-2 border-success">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title font-bold text-success text-lg">
                    ✅ Precios adicionales creados ({resultData.detalles.precios_creados.length})
                  </div>
                  <div className="collapse-content max-h-80 overflow-y-auto">
                    <div className="space-y-2 mt-2">
                      {resultData.detalles.precios_creados.map((item: any, idx: number) => (
                        <div key={idx} className="bg-base-100 p-3 rounded-lg shadow">
                          <p className="font-bold text-lg">{item.modelo}</p>
                          <div className="text-sm mt-2">
                            <p className="text-base-content/60">
                              Nombre: {item.nuevo_precio.nombre_precio}
                            </p>
                            <p className="text-base-content/60">
                              Costo: ${item.nuevo_precio.costo}
                            </p>
                            <p className="text-success font-bold">
                              Precio: ${item.nuevo_precio.precio} / Tarjeta: ${item.nuevo_precio.precioTarjeta}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modelos con pedidos activos */}
              {resultData.detalles?.con_pedidos_activos?.length > 0 && (
                <div className="collapse collapse-arrow bg-warning/10 border-2 border-warning">
                  <input type="checkbox" />
                  <div className="collapse-title font-bold text-warning text-lg">
                    ⚠️ No actualizados - Tienen pedidos activos ({resultData.detalles.con_pedidos_activos.length})
                  </div>
                  <div className="collapse-content max-h-60 overflow-y-auto">
                    <div className="space-y-2 mt-2">
                      {resultData.detalles.con_pedidos_activos.map((item: any, idx: number) => (
                        <div key={idx} className="bg-base-100 p-3 rounded-lg shadow">
                          <p className="font-bold">{item.modelo}</p>
                          <p className="text-sm text-warning">{item.pedidos_activos.length} pedidos activos</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modelos excluidos */}
              {resultData.detalles?.modelos_excluidos?.length > 0 && (
                <div className="collapse collapse-arrow bg-error/10 border-2 border-error">
                  <input type="checkbox" />
                  <div className="collapse-title font-bold text-error text-lg">
                    🚫 Excluidos manualmente ({resultData.detalles.modelos_excluidos.length})
                  </div>
                  <div className="collapse-content max-h-60 overflow-y-auto">
                    <div className="space-y-2 mt-2">
                      {resultData.detalles.modelos_excluidos.map((item: any, idx: number) => (
                        <div key={idx} className="bg-base-100 p-3 rounded-lg shadow">
                          <p className="font-bold">{item.modelo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-lg w-full" onClick={() => {
                onSuccess();
                handleClose();
              }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </Modal>

      <ErrorModal message={error} onClose={() => setError("")} />
      <SuccessModal message={success} onClose={() => setSuccess("")} />
    </>
  );
};

export default PreciosMasivos;

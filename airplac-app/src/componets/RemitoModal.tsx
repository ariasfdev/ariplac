import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/img/logo.png";
import { FaDollarSign } from "react-icons/fa";

interface Producto {
  modelo: string;
  materiales: string;
  cantidad: number;
  valorM2: number;
  nombre_precio?: string;
  id_precio?: string;
  preciosModelo?: any[];
  // Nuevos campos para el remito profesional:
  articulo?: string; // código de artículo
  descripcion?: string; // descripción
  peso_individual?: number; // en kg
  peso_total?: number; // en kg
}

interface RemitoData {
  id: string;
  remito: string;
  fecha: string;
  año: string;
  cliente: string;
  direccion: string;
  contacto: string;
  productos: Producto[];
  total: string;
  flete?: string;
  descuento?: string;
  seña?: string;
  valor_instalacion?: string;
  adicional?: string;
  metodo_pago?: string; // <-- agregar propiedad
  dni_cuil: string; // <-- agregar esta línea
}

interface RemitoModalProps {
  remitoData: RemitoData | null;
  onClose: () => void;
}

function calcularSubtotal(remito: RemitoData): number {
  const base = parseFloat(remito.total || "0");
  const flete = parseFloat(remito.flete || "0");
  const adicional = parseFloat(remito.adicional || "0");
  const descuentoPorcentaje = parseFloat(remito.descuento || "0");
  const seña = parseFloat(remito.seña || "0");

  const subtotal = base;
  const descuentoValor = subtotal * (descuentoPorcentaje / 100);
  const instalacion = parseFloat(remito.valor_instalacion || "0");
  const totalFinal = subtotal - descuentoValor - flete - adicional;

  return totalFinal > 0 ? totalFinal : 0;
}

function calcularTotal(remito: RemitoData): number {
  const subtotal = calcularSubtotal(remito);
  const descuentoPorcentaje = parseFloat(remito.descuento || "0");
  const descuentoValor = subtotal * (descuentoPorcentaje / 100);
  const seña = parseFloat(remito.seña || "0");
  const flete = parseFloat(remito.flete || "0");
  const instalacion = parseFloat(remito.valor_instalacion || "0");
  const adicional = parseFloat(remito.adicional || "0");
  const totalFinal =
    subtotal - descuentoValor + flete + instalacion + adicional - seña;
  return totalFinal > 0 ? totalFinal : 0;
}

function formatMoneda(valor: number): string {
  return `$${valor
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

const RemitoModal: React.FC<RemitoModalProps> = ({ remitoData, onClose }) => {
  const [editableRemito, setEditableRemito] = useState<RemitoData | null>(
    remitoData
  );
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    setEditableRemito(remitoData);
  }, [remitoData]);

  useEffect(() => {
    const toBase64 = async () => {
      const response = await fetch(logo);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setLogoBase64(reader.result as string);
      reader.readAsDataURL(blob);
    };
    toBase64();
  }, []);

  const handleInputChange = (field: keyof RemitoData, value: string) => {
    if (editableRemito) {
      setEditableRemito({ ...editableRemito, [field]: value });
    }
  };

  function formatDate(date: any) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const tipoRemito =
    (editableRemito as any)?.tipo === "presupuesto" ? "presupuesto" : "pedido";

  const generatePDF = () => {
    if (!editableRemito) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- ENCABEZADO PROFESIONAL ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AIR PLAC", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("G. Marconi 3747 - Isidro Casanova, CP 1765", margin, 26);
    doc.text(
      "Tel: (011) 11 5485-3893 | Email: airplac.deco@gmail.com",
      margin,
      32
    );
    doc.text("CUIT: 20-42.213.808-1 | Responsable Monotributo", margin, 38);

    // Separador
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 41, pageWidth - margin, 41);

    // --- TIPO (R/P) + TEXTO DERECHA ---
    const tipo =
      (editableRemito as any)?.tipo === "presupuesto"
        ? "Presupuesto"
        : "Remito";
    const abreviado = tipo === "Presupuesto" ? "P" : "R";

    // Letra grande al medio
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text(abreviado, pageWidth / 2, 30, { align: "center" });

    // Texto arriba a la derecha + fecha debajo
    doc.setFontSize(14);
    if (tipo === "Remito") {
      doc.text(`${tipo} Nº: ${editableRemito.remito}`, pageWidth - margin, 20, {
        align: "right",
      });
    } else {
      doc.text(tipo, pageWidth - margin, 20, { align: "right" });
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDate(new Date())}`, pageWidth - margin, 28, {
      align: "right",
    });

    // --- DATOS DEL CLIENTE ---
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFillColor(245, 246, 247);
    doc.rect(margin, 50, pageWidth - margin * 2, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", margin + 5, 58);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cliente: ${editableRemito.cliente}`, margin + 5, 66);
    doc.text(`Dirección: ${editableRemito.direccion}`, margin + 5, 72);
    doc.text(`Contacto: ${editableRemito.contacto}`, margin + 5, 78);
    doc.text(`DNI/CUIL: ${editableRemito.dni_cuil}`, pageWidth - 90, 66);

    // --- TABLA DE PRODUCTOS ---
    autoTable(doc, {
      startY: 90,
      head: [["#", "Modelo", "Tipo Precio", "Cantidad", "Valor m²", "Total"]],
      body: editableRemito.productos.map((prod, idx) => {
        const valorUnitario = getValorM2(prod, editableRemito?.metodo_pago);
        const total = prod.cantidad * valorUnitario;
        return [
          (idx + 1).toString(),
          prod.modelo,
          prod.nombre_precio ? prod.nombre_precio : "Sin tipo de precio",
          prod.cantidad.toString(),
          formatMoneda(valorUnitario),
          formatMoneda(total),
        ];
      }),
      styles: {
        fontSize: 10,
        cellPadding: 2,
        font: "helvetica",
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      theme: "grid",
    });

    // --- IR A LA ÚLTIMA PÁGINA PARA PONER TOTALES AL PIE ---
    const lastPage = (doc as any).getNumberOfPages();
    (doc as any).setPage(lastPage);

    // Valores para el desglose (mismo criterio que venías usando)
    const sub = calcularSubtotal(editableRemito);
    const descPerc = parseFloat(editableRemito.descuento || "0");
    const descVal = sub * (descPerc / 100);
    const senia = parseFloat(editableRemito.seña || "0");
    const flete = parseFloat(editableRemito.flete || "0");
    const inst = parseFloat(editableRemito.valor_instalacion || "0");
    const adicional = parseFloat(editableRemito.adicional || "0");
    const totalFinal = calcularTotal(editableRemito);

    // Armar filas dinámicas del desglose
    const rows: Array<{ label: string; value: string; bold?: boolean }> = [];
    rows.push({ label: "Subtotal productos:", value: formatMoneda(sub) });
    if (descPerc > 0)
      rows.push({
        label: `Descuento (${descPerc}%) :`,
        value: `-${formatMoneda(descVal)}`,
      });
    if (senia > 0)
      rows.push({ label: "Seña:", value: `-${formatMoneda(senia)}` });
    if (flete > 0) rows.push({ label: "Flete:", value: formatMoneda(flete) });
    if (inst > 0)
      rows.push({ label: "Instalación:", value: formatMoneda(inst) });
    if (adicional > 0)
      rows.push({ label: "Adicional:", value: formatMoneda(adicional) });

    // Altura dinámica del recuadro según filas + separador + TOTAL
    const lineH = 6;
    const innerPadY = 6;
    const sepH = 6;
    const totalRows = rows.length + 1; // +1 por la línea TOTAL
    const boxHeight = innerPadY * 2 + rows.length * lineH + sepH + lineH + 2;
    const boxWidth = 90;
    const boxX = pageWidth - margin - boxWidth;
    const boxY =
      pageHeight - margin - 20 /* firma */ - 8 /* espacio */ - boxHeight;

    // Recuadro de totales (derecha, al pie)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.rect(boxX, boxY, boxWidth, boxHeight, "S");

    // Dibujar filas del desglose
    let y = boxY + innerPadY + 2;
    rows.forEach((r) => {
      doc.setFont("helvetica", r.bold ? "bold" : "normal");
      doc.setFontSize(10);
      doc.text(r.label, boxX + 4, y);
      doc.text(r.value, boxX + boxWidth - 4, y, { align: "right" });
      y += lineH;
    });

    // Separador y TOTAL
    doc.line(boxX + 4, y, boxX + boxWidth - 4, y);
    y += sepH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", boxX + 4, y);
    doc.text(formatMoneda(totalFinal), boxX + boxWidth - 4, y, {
      align: "right",
    });

    // --- FIRMA (siempre al pie) ---
    const firmaY = pageHeight - margin - 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Firma del cliente: ____________________________",
      pageWidth - margin,
      firmaY,
      { align: "right" }
    );

    // --- LEYENDA (izquierda, más abajo) ---
    doc.setFontSize(8);
    doc.text(
      "Este documento es un remito de entrega de mercaderías. El cliente confirma la recepción de los productos listados.",
      margin + 5,
      pageHeight - margin / 2, // más arriba de la base, ocupa media hoja
      { maxWidth: pageWidth / 2 } // limita ancho para que no invada la firma
    );

    doc.save(`${tipo}_${editableRemito.remito}.pdf`);
  };

  // Función para obtener el valor del precio según id_precio y método de pago
  const getValorM2 = (prod: Producto, metodo_pago?: string) => {
    let valor = prod.valorM2 || 0;
    // Buscar en preciosModelo si existe
    if (prod.id_precio && prod.preciosModelo && prod.preciosModelo.length > 0) {
      const precioObj = prod.preciosModelo.find(
        (p: any) => String(p._id) === String(prod.id_precio)
      );
      if (precioObj) {
        if (metodo_pago === "credito") {
          valor = precioObj.precioTarjeta ?? precioObj.precio ?? 0;
        } else {
          valor = precioObj.precio ?? 0;
        }
      }
    } else {
      // Si no hay preciosModelo, usar precioTarjeta si corresponde
      if (metodo_pago === "credito" && (prod as any).precioTarjeta) {
        valor = (prod as any).precioTarjeta || 0;
      }
    }
    return valor || 0;
  };

  if (!editableRemito) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="modal-box bg-base-100 w-full max-w-6xl shadow-2xl rounded-xl border border-base-300">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-primary to-primary-focus px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-primary-content text-xl font-bold flex items-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {tipoRemito === "presupuesto"
                ? "Presupuesto"
                : `Remito #${editableRemito.remito}`}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost text-primary-content"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 mx-6 mt-4">
          <button
            className={`tab ${activeTab === "preview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Vista Previa
          </button>
          <button
            className={`tab ${activeTab === "edit" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar Datos
          </button>
        </div>

        <div className="p-6">
          {activeTab === "preview" ? (
            /* Vista Previa */
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="bg-base-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Información del Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Cliente</div>
                    <div className="stat-value text-lg">
                      {typeof editableRemito.cliente === "object"
                        ? editableRemito.cliente
                        : editableRemito.cliente}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">DNI/CUIL</div>
                    <div className="stat-value text-lg">
                      {typeof editableRemito.cliente === "object" &&
                      editableRemito.cliente !== null &&
                      "dni_cuil" in editableRemito.cliente
                        ? (editableRemito.cliente as { dni_cuil?: string })
                            .dni_cuil ||
                          editableRemito.dni_cuil ||
                          ""
                        : editableRemito.dni_cuil || ""}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Dirección</div>
                    <div className="stat-value text-lg">
                      {typeof editableRemito.cliente === "object" &&
                      editableRemito.cliente !== null &&
                      "direccion" in editableRemito.cliente
                        ? (editableRemito.cliente as { direccion?: string })
                            .direccion || editableRemito.direccion
                        : editableRemito.direccion}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Contacto</div>
                    <div className="stat-value text-lg">
                      {typeof editableRemito.cliente === "object" &&
                      editableRemito.cliente !== null &&
                      "contacto" in editableRemito.cliente
                        ? (editableRemito.cliente as { contacto?: string })
                            .contacto || editableRemito.contacto
                        : editableRemito.contacto}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Fecha</div>
                    <div className="stat-value text-lg">
                      {formatDate(new Date())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-base-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Productos
                </h4>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-primary text-primary-content">
                        <th>#</th>
                        <th>Modelo</th>
                        <th>Tipo Precio</th>
                        <th>Cantidad</th>
                        <th>Valor m²</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableRemito.productos.map((prod, index) => {
                        const porcentajeGanancia = (prod as any)
                          .porcentaje_ganancia
                          ? (prod as any).porcentaje_ganancia / 100
                          : 0;
                        const redondeo = (prod as any).total_redondeo || 0;
                        // Usar getValorM2 para mostrar el valor correcto
                        const valorUnitario = getValorM2(
                          prod as Producto,
                          editableRemito?.metodo_pago
                        );
                        const total = prod.cantidad * valorUnitario;

                        return (
                          <tr key={index}>
                            <td className="font-bold">{index + 1}</td>
                            <td>{prod.modelo}</td>
                            <td>
                              {/* Mostrar el tipo de precio en vez de materiales */}
                              {
                                // Si el producto tiene nombre_precio, mostrarlo
                                prod.nombre_precio ? (
                                  <span className="font-bold text-gray-500">
                                    {prod.nombre_precio}
                                  </span>
                                ) : (
                                  <span className="text-xs text-base-content/60">
                                    Sin tipo de precio
                                  </span>
                                )
                              }
                            </td>
                            <td className="text-center">{prod.cantidad}</td>
                            <td className="text-right">
                              {formatMoneda(valorUnitario)}
                            </td>
                            <td className="text-right font-bold">
                              {formatMoneda(total)}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Flete */}
                      {editableRemito.flete &&
                      parseFloat(editableRemito.flete) > 0 ? (
                        <tr>
                          <td className="font-bold">
                            {editableRemito.productos.length + 1}
                          </td>
                          <td colSpan={3} className="font-bold">
                            FLETE
                          </td>
                          <td className="text-right">
                            {formatMoneda(parseFloat(editableRemito.flete))}
                          </td>
                          <td className="text-right font-bold">
                            {formatMoneda(parseFloat(editableRemito.flete))}
                          </td>
                        </tr>
                      ) : null}
                      {/* Instalación */}
                      {editableRemito.valor_instalacion &&
                      parseFloat(editableRemito.valor_instalacion) > 0 ? (
                        <tr className="bg-info text-info-content">
                          <td className="font-bold">
                            {editableRemito.productos.length +
                              (editableRemito.flete ? 2 : 1)}
                          </td>
                          <td colSpan={3} className="font-bold">
                            INSTALACIÓN
                          </td>
                          <td className="text-right">
                            {formatMoneda(
                              parseFloat(editableRemito.valor_instalacion)
                            )}
                          </td>
                          <td className="text-right font-bold">
                            {formatMoneda(
                              parseFloat(editableRemito.valor_instalacion)
                            )}
                          </td>
                        </tr>
                      ) : null}
                      {/* Adicional */}
                      {editableRemito.adicional &&
                      parseFloat(editableRemito.adicional) > 0 ? (
                        <tr>
                          <td className="font-bold">
                            {editableRemito.productos.length +
                              (editableRemito.flete ? 1 : 0) +
                              (editableRemito.valor_instalacion ? 1 : 0) +
                              1}
                          </td>
                          <td colSpan={3} className="font-bold">
                            ADICIONAL
                          </td>
                          <td className="text-right">
                            {formatMoneda(parseFloat(editableRemito.adicional))}
                          </td>
                          <td className="text-right font-bold">
                            {formatMoneda(parseFloat(editableRemito.adicional))}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen de Totales */}
              <div className="bg-base-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Resumen de Totales
                </h4>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">Subtotal</div>
                    <div className="stat-value text-lg">
                      {formatMoneda(calcularSubtotal(editableRemito))}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Descuento</div>
                    <div className="stat-value text-lg text-warning">
                      {editableRemito.descuento || "0"}%
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Seña</div>
                    <div className="stat-value text-lg text-error">
                      {formatMoneda(parseFloat(editableRemito.seña || "0"))}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Flete</div>
                    <div className="stat-value text-lg text-success">
                      {formatMoneda(parseFloat(editableRemito.flete || "0"))}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Instalación</div>
                    <div className="stat-value text-lg text-info">
                      {formatMoneda(
                        parseFloat(editableRemito.valor_instalacion || "0")
                      )}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Adicional</div>
                    <div className="stat-value text-lg text-accent">
                      {formatMoneda(
                        parseFloat(editableRemito.adicional || "0")
                      )}
                    </div>
                  </div>
                  <div className="stat bg-primary text-primary-content">
                    <div className="stat-title">TOTAL</div>
                    <div className="stat-value text-lg">
                      {formatMoneda(calcularTotal(editableRemito))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Formulario de Edición */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Cliente</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editableRemito.cliente || ""}
                    onChange={(e) =>
                      handleInputChange("cliente", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Dirección</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editableRemito.direccion || ""}
                    onChange={(e) =>
                      handleInputChange("direccion", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Contacto</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editableRemito.contacto || ""}
                    onChange={(e) =>
                      handleInputChange("contacto", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Fecha</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={editableRemito.fecha || ""}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                  />
                </div>

                {/* --- AGREGAR CAMPO DNI/CUIL --- */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">DNI/CUIL</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editableRemito.dni_cuil || ""}
                    onChange={(e) =>
                      handleInputChange("dni_cuil", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Flete</span>
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      value={
                        editableRemito.flete &&
                        parseFloat(editableRemito.flete) > 0
                          ? `$${parseFloat(editableRemito.flete).toLocaleString(
                              "es-AR"
                            )}`
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("flete", value === "" ? "" : value);
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Descuento (%)
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={editableRemito.descuento || ""}
                    onChange={(e) =>
                      handleInputChange("descuento", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Seña</span>
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      value={
                        editableRemito.seña &&
                        parseFloat(editableRemito.seña) > 0
                          ? `$${parseFloat(editableRemito.seña).toLocaleString(
                              "es-AR"
                            )}`
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("seña", value === "" ? "" : value);
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Valor Instalación
                    </span>
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      value={
                        editableRemito.valor_instalacion &&
                        parseFloat(editableRemito.valor_instalacion) > 0
                          ? `$${parseFloat(
                              editableRemito.valor_instalacion
                            ).toLocaleString("es-AR")}`
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange(
                          "valor_instalacion",
                          value === "" ? "" : value
                        );
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Adicional</span>
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      value={
                        editableRemito.adicional &&
                        parseFloat(editableRemito.adicional) > 0
                          ? `$${parseFloat(
                              editableRemito.adicional
                            ).toLocaleString("es-AR")}`
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange(
                          "adicional",
                          value === "" ? "" : value
                        );
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-base-300">
            <button
              className="btn btn-outline btn-sm"
              onClick={() =>
                setActiveTab(activeTab === "preview" ? "edit" : "preview")
              }
            >
              {activeTab === "preview" ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Datos
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Vista Previa
                </>
              )}
            </button>
            <button className="btn btn-success btn-sm" onClick={generatePDF}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generar PDF
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemitoModal;

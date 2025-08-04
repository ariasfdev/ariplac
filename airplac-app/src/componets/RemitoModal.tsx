import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/img/logo.png";
import { FaDollarSign } from "react-icons/fa";

interface Producto {
  modelo: string;
  materiales: string;
  cantidad: number;
  valorM2: number;
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
}

interface RemitoModalProps {
  remitoData: RemitoData | null;
  onClose: () => void;
}

function calcularTotal(remito: RemitoData): number {
  const base = parseFloat(remito.total || "0");
  const flete = parseFloat(remito.flete || "0");
  const descuentoPorcentaje = parseFloat(remito.descuento || "0");
  const seña = parseFloat(remito.seña || "0");

  const subtotal = base;
  const descuentoValor = subtotal * (descuentoPorcentaje / 100);
  const instalacion = parseFloat(remito.valor_instalacion || "0");
  const totalFinal = subtotal - descuentoValor - seña + flete + instalacion;

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

  const generatePDF = () => {
    if (!editableRemito) return;

    const totalCalculado = calcularTotal(editableRemito);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Configuración de colores y estilos
    const primaryColor: [number, number, number] = [0, 123, 255];
    const secondaryColor: [number, number, number] = [108, 117, 125];
    const accentColor: [number, number, number] = [40, 167, 69];

    // --- HEADER PROFESIONAL ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, "F");

    // Logo
    if (logoBase64) {
      doc.addImage(logoBase64, "JPEG", 15, 8, 25, 25);
    }

    // Información de la empresa
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AIR PLAC", 50, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("G. Marconi 3749 - Isidro Casanova, CP 1765", 50, 25);
    doc.text("Tel: (011) 1234-5678 | Email: airplac.deco@gmail.com", 50, 30);
    doc.text("CUIT: 20-42.213.808-1 | Responsable Monotributo", 50, 35);

    // Número de remito destacado
    doc.setFillColor(...accentColor);
    doc.rect(pageWidth - 60, 8, 50, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("REMITO", pageWidth - 35, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Nº ${editableRemito.remito}`, pageWidth - 35, 28, {
      align: "center",
    });

    // --- SECCIÓN DE CLIENTE ---
    let currentY = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(248, 249, 250);
    doc.rect(10, currentY, pageWidth - 20, 35, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", 15, currentY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cliente: ${editableRemito.cliente}`, 15, currentY + 18);
    doc.text(`Dirección: ${editableRemito.direccion}`, 15, currentY + 25);
    doc.text(`Contacto: ${editableRemito.contacto}`, 15, currentY + 32);

    // Fecha y condiciones
    doc.text(`Fecha: ${formatDate(new Date())}`, pageWidth - 80, currentY + 18);
    doc.text("Condición: Contado", pageWidth - 80, currentY + 25);
    doc.text("CUIT: ________________", pageWidth - 80, currentY + 32);

    currentY += 45;

    // --- TABLA DE PRODUCTOS MEJORADA ---
    const productosBody = editableRemito.productos.map((prod, index) => {
      const porcentajeGanancia = (prod as any).porcentaje_ganancia
        ? (prod as any).porcentaje_ganancia / 100
        : 0;
      const redondeo = (prod as any).total_redondeo || 0;
      let valorUnitario = prod.valorM2 + redondeo;
      valorUnitario += valorUnitario * porcentajeGanancia;
      const total = prod.cantidad * valorUnitario;
      return [
        (index + 1).toString(),
        prod.cantidad.toString(),
        `${prod.modelo} (${prod.materiales})`,
        formatMoneda(valorUnitario),
        formatMoneda(total),
      ];
    });

    // Agregar flete e instalación
    if (editableRemito.flete && parseFloat(editableRemito.flete) > 0) {
      productosBody.push([
        (productosBody.length + 1).toString(),
        "1",
        "FLETE",
        formatMoneda(parseFloat(editableRemito.flete)),
        formatMoneda(parseFloat(editableRemito.flete)),
      ]);
    }

    if (
      editableRemito.valor_instalacion &&
      parseFloat(editableRemito.valor_instalacion) > 0
    ) {
      productosBody.push([
        (productosBody.length + 1).toString(),
        "1",
        "INSTALACIÓN",
        formatMoneda(parseFloat(editableRemito.valor_instalacion)),
        formatMoneda(parseFloat(editableRemito.valor_instalacion)),
      ]);
    }

    (doc as any).autoTable({
      startY: currentY,
      head: [["#", "CANT.", "DESCRIPCIÓN", "P. UNIT.", "IMPORTE"]],
      body: productosBody,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "left", cellWidth: 80 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- RESUMEN DE TOTALES ---
    currentY = finalY + 10;

    // Fondo para totales
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth - 90, currentY - 5, 80, 50, "F");

    const subtotal = parseFloat(editableRemito.total || "0");
    const descuentoValor =
      subtotal * (parseFloat(editableRemito.descuento || "0") / 100);
    const seña = parseFloat(editableRemito.seña || "0");
    const flete = parseFloat(editableRemito.flete || "0");
    const instalacion = parseFloat(editableRemito.valor_instalacion || "0");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal:", pageWidth - 85, currentY);
    doc.text(formatMoneda(subtotal), pageWidth - 15, currentY, {
      align: "right",
    });

    if (descuentoValor > 0) {
      currentY += 6;
      doc.text("Descuento:", pageWidth - 85, currentY);
      doc.text(`-${formatMoneda(descuentoValor)}`, pageWidth - 15, currentY, {
        align: "right",
      });
    }

    if (seña > 0) {
      currentY += 6;
      doc.text("Seña:", pageWidth - 85, currentY);
      doc.text(`-${formatMoneda(seña)}`, pageWidth - 15, currentY, {
        align: "right",
      });
    }

    if (flete > 0) {
      currentY += 6;
      doc.text("Flete:", pageWidth - 85, currentY);
      doc.text(formatMoneda(flete), pageWidth - 15, currentY, {
        align: "right",
      });
    }

    if (instalacion > 0) {
      currentY += 6;
      doc.text("Instalación:", pageWidth - 85, currentY);
      doc.text(formatMoneda(instalacion), pageWidth - 15, currentY, {
        align: "right",
      });
    }

    // Línea separadora
    currentY += 8;
    doc.setDrawColor(...secondaryColor);
    doc.line(pageWidth - 90, currentY, pageWidth - 10, currentY);

    // Total final
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accentColor);
    doc.text("TOTAL:", pageWidth - 85, currentY);
    doc.text(formatMoneda(totalCalculado), pageWidth - 15, currentY, {
      align: "right",
    });

    // --- PIE DE PÁGINA PROFESIONAL ---
    const footerY = pageHeight - 30;
    doc.setFillColor(...secondaryColor);
    doc.rect(0, footerY, pageWidth, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Este documento es un remito de entrega de mercaderías.",
      15,
      footerY + 8
    );
    doc.text(
      "El cliente confirma la recepción de los productos listados.",
      15,
      footerY + 14
    );
    doc.text(
      "Para consultas: airplac.deco@gmail.com | Tel: (011) 1234-5678",
      15,
      footerY + 20
    );

    doc.text(
      `Remito Nº ${editableRemito.remito}`,
      pageWidth - 15,
      footerY + 8,
      { align: "right" }
    );
    doc.text(`Fecha: ${formatDate(new Date())}`, pageWidth - 15, footerY + 14, {
      align: "right",
    });
    doc.text(
      "Firma del cliente: ________________",
      pageWidth - 15,
      footerY + 20,
      { align: "right" }
    );

    doc.save(`Remito_${editableRemito.remito}.pdf`);
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
              Remito #{editableRemito.remito}
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
                      {editableRemito.cliente}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Dirección</div>
                    <div className="stat-value text-lg">
                      {editableRemito.direccion}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Contacto</div>
                    <div className="stat-value text-lg">
                      {editableRemito.contacto}
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
                        <th>Materiales</th>
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
                        let valorUnitario = prod.valorM2 + redondeo;
                        valorUnitario += valorUnitario * porcentajeGanancia;
                        const total = prod.cantidad * valorUnitario;

                        return (
                          <tr key={index}>
                            <td className="font-bold">{index + 1}</td>
                            <td>{prod.modelo}</td>
                            <td>{prod.materiales}</td>
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
                      {editableRemito.flete &&
                        parseFloat(editableRemito.flete) > 0 && (
                          <tr className="bg-success text-success-content">
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
                        )}
                      {editableRemito.valor_instalacion &&
                        parseFloat(editableRemito.valor_instalacion) > 0 && (
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
                        )}
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
                      {formatMoneda(parseFloat(editableRemito.total || "0"))}
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

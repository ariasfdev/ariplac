import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/img/logo.png";

interface RemitoData {
  id: string;
  remito: string;
  fecha: string;
  año: string;
  cliente: string;
  direccion: string;
  contacto: string;
  cantidadM2: number;
  detalle: string;
  materiales: string;
  /**
   * En este ejemplo, asumimos que "total" es el subtotal base
   * antes de aplicar flete, descuento y seña.
   */
  total: string;
  flete?: string; // Puede ser numérico en string
  descuento?: string; // Porcentaje 1..100 en string
  sena?: string; // Adelanto en string
}

interface RemitoModalProps {
  remitoData: RemitoData | null;
  onClose: () => void;
}

/** Calcula el total final aplicando la lógica de:
 * subtotal base + flete - descuento% - seña
 */
function calcularTotal(remito: RemitoData): number {
  const base = parseFloat(remito.total || "0");
  const flete = parseFloat(remito.flete || "0");
  const descuentoPorcentaje = parseFloat(remito.descuento || "0");
  const sena = parseFloat(remito.sena || "0");

  // Subtotal sumando flete
  const subtotal = base + flete;

  // Descuento en valor monetario
  const descuentoValor = subtotal * (descuentoPorcentaje / 100);

  // Total final
  const totalFinal = subtotal - descuentoValor - sena;

  return totalFinal > 0 ? totalFinal : 0;
}

const RemitoModal: React.FC<RemitoModalProps> = ({ remitoData, onClose }) => {
  const [editableRemito, setEditableRemito] = useState<RemitoData | null>(
    remitoData
  );
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    setEditableRemito(remitoData);
  }, [remitoData]);

  // Convertir el logo a Base64
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

  // Manejo de cambios en los inputs
  const handleInputChange = (field: keyof RemitoData, value: string) => {
    if (editableRemito) {
      setEditableRemito({ ...editableRemito, [field]: value });
    }
  };

  // Generar PDF con la lógica de total
  const generatePDF = () => {
    if (!editableRemito) return;

    // Calculamos el total final (mismo método que en tu “NuevoPedido”)
    const totalCalculado = calcularTotal(editableRemito);

    const doc = new jsPDF();
    const logoWidth = 50;
    const logoHeight = 50;

    // Insertar logo si está disponible
    if (logoBase64) {
      doc.addImage(logoBase64, "JPEG", 10, 10, logoWidth, logoHeight);
    }

    doc.setFontSize(12);
    doc.text("Air Plac", 70, 15);
    doc.text("G. Marconi 3749", 70, 22);
    doc.text("CP 1765 - Isidro Casanova", 70, 29);

    doc.text(`Cliente: ${editableRemito.cliente}`, 10, 70);
    doc.text(`Dirección: ${editableRemito.direccion}`, 10, 75);
    doc.text(`Contacto: ${editableRemito.contacto}`, 10, 80);

    doc.text(`N° Recibo: ${editableRemito.remito}`, 150, 70);
    doc.text(`Fecha: ${editableRemito.fecha}`, 150, 75);

    // Ejemplo de tabla
    (doc as any).autoTable({
      startY: 90,
      head: [["CANTIDAD", "CONCEPTO", "PRECIO", "IMP", "TOTAL"]],
      body: [
        [
          `${editableRemito.cantidadM2} m²`,
          `${editableRemito.detalle} (${editableRemito.materiales})`,
          // Subtotal base (si quieres mostrarlo):
          `$${editableRemito.total || "0"}`,
          "",
          // Subtotal base de la fila (aquí repetimos, depende de tu necesidad)
          `$${editableRemito.total || "0"}`,
        ],
        [
          "1",
          "FLETE",
          `$${editableRemito.flete || "0"}`,
          "",
          `$${editableRemito.flete || "0"}`,
        ],
        ...Array(8).fill(["", "", "", "", ""]),
      ],
      theme: "grid",
      styles: { halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Subtotal, descuento, seña, total final
    // (Si deseas, puedes mostrar el desglose exacto en la tabla)
    doc.text(`SUBTOTAL: $${editableRemito.total || "0"}`, 150, finalY);
    doc.text(`Descuento: ${editableRemito.descuento || "0"}%`, 150, finalY + 5);
    doc.text(`Seña: $${editableRemito.sena || "0"}`, 150, finalY + 10);
    doc.text(`Flete: $${editableRemito.flete || "0"}`, 150, finalY + 15);

    // Muestra el total calculado
    doc.text(`TOTAL: $${totalCalculado}`, 150, finalY + 20);

    // Ejemplo de texto de conformidad
    doc.text(
      `CONFORMIDAD:......................................       DNI:---------------------------------------`,
      10,
      finalY + 30
    );

    doc.save(`Remito_${editableRemito.remito}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="modal-box bg-base-200 w-full max-w-2xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg rounded-lg">
        <h3 className="font-bold text-xl mb-4 text-center">
          Vista previa del Remito
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente:</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={editableRemito?.cliente || ""}
              onChange={(e) => handleInputChange("cliente", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Dirección:</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={editableRemito?.direccion || ""}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Detalle:</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={editableRemito?.detalle || ""}
              onChange={(e) => handleInputChange("detalle", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Flete:</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={editableRemito?.flete || ""}
              onChange={(e) => handleInputChange("flete", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={generatePDF}
          >
            Generar PDF
          </button>
          <button
            className="btn btn-outline w-full sm:w-auto"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemitoModal;

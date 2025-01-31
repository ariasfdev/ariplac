import React from "react";
import Modal from "./Modal";

interface Modelo {
  _id: string;
  producto: string;
  modelo: string;
  ancho: string;
  alto: string;
  tipo: string;
}

interface NuevoModeloProps {
  isOpen: boolean;
  onClose: () => void;
  modelo: Modelo | null;
  onSave: (modelo: Modelo) => void;
}

const NuevoModelo: React.FC<NuevoModeloProps> = ({
  isOpen,
  onClose,
  modelo,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<Modelo>(
    modelo || {
      _id: "",
      producto: "",
      modelo: "",
      ancho: "",
      alto: "",
      tipo: "",
    }
  );

  React.useEffect(() => {
    if (modelo) setFormData(modelo);
  }, [modelo]);

  const handleChange = (field: keyof Modelo, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2 className="text-xl font-bold mb-4">
          {formData._id ? "Editar Modelo" : "Nuevo Modelo"}
        </h2>
        <label className="block mb-2">Modelo:</label>
        <input
          type="text"
          className="input input-bordered w-full mb-4"
          value={formData.modelo}
          onChange={(e) => handleChange("modelo", e.target.value)}
        />

        <label className="block mb-2">Producto:</label>
        <input
          type="text"
          className="input input-bordered w-full mb-4"
          value={formData.producto}
          onChange={(e) => handleChange("producto", e.target.value)}
        />

        <label className="block mb-2">Dimensiones:</label>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ancho"
            value={formData.ancho}
            onChange={(e) => handleChange("ancho", e.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Alto"
            value={formData.alto}
            onChange={(e) => handleChange("alto", e.target.value)}
          />
        </div>

        <label className="block mb-2">Tipo:</label>
        <input
          type="text"
          className="input input-bordered w-full mb-4"
          value={formData.tipo}
          onChange={(e) => handleChange("tipo", e.target.value)}
        />

        <div className="flex justify-end gap-4">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NuevoModelo;

import React, { useEffect, useState } from "react";
import Modal from "./Modal"; // Ajusta la ruta si está en otra carpeta

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose(), 300); // Espera a que termine la animación antes de cerrar
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <Modal isOpen={!!message} onClose={onClose}>
      <div
        className={`p-4 transition-all duration-300 transform ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-2 text-green-600">¡Éxito!</h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-success" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;

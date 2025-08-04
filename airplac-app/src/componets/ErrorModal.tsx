import React, { useEffect, useState } from "react";
import Modal from "./Modal"; // Ajusta la ruta si está en otra carpeta

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
    }
  }, [message]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300); // Espera la animación antes de cerrar
  };

  return (
    <Modal isOpen={!!message} onClose={handleClose}>
      <div
        className={`p-4 transition-all duration-300 transform ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-2 text-red-600">⚠ Error</h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-error" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;

import React, { useEffect, useState } from "react";
import Modal from "./Modal"; // Ajusta la ruta si está en otra carpeta

interface ErrorModalProps {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showConfirm?: boolean;
  title?: string; // Nuevo título opcional
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  message,
  onClose,
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  showConfirm,
  title, // Nuevo título opcional
}) => {
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
        <h2 className="text-xl font-bold mb-2 text-red-600">
          {title || "⚠ Error"}
        </h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          {onConfirm ? (
            <>
              <button className="btn btn-error" onClick={handleClose}>
                {cancelText}
              </button>
              <button className="btn btn-primary" onClick={onConfirm}>
                {confirmText}
              </button>
            </>
          ) : (
            <button className="btn btn-error" onClick={handleClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;

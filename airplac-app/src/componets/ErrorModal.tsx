import React from "react";
import Modal from "./Modal"; // Ajusta la ruta si está en otra carpeta

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <Modal isOpen={!!message} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;

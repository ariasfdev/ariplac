import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = "md" }) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-6xl",
    full: "max-w-7xl"
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className={`modal-box relative w-11/12 ${sizeClasses[size]} text-base-content`}>
        {/* Botón para cerrar el modal */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2 z-10"
        >
          ✕
        </button>
        {/* Contenido que pasamos como children */}
        {children}
      </div>
    </div>
  );
};

export default Modal;

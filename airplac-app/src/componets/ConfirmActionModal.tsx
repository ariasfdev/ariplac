import React from "react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ConfirmActionModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
            onTouchStart={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;

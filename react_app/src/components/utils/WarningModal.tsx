import React from 'react';

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button onClick={onConfirm} className="btn btn-error">
            Confirmar
          </button>
          <button onClick={onClose} className="btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;

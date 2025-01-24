import React, { useEffect } from 'react';

interface AddEditModalProps {
  isOpen: boolean;
  title: string;
  fields: {
    label: string;
    value: string | number;
    type: 'text' | 'number' | 'select';
    onChange: (value: string | number) => void;
    options?: { id: number; label: string }[]; // Para selects
  }[];
  message?: string;
  onSave: () => void;
  onClose: () => void;
  isDisabled: boolean;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  title,
  fields,
  message,
  onSave,
  onClose,
  isDisabled,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="font-bold text-lg pb-4">{title}</h2>
        {message && <p>{message}</p>}
        {fields.map((field, index) => (
          <div key={index} className="mb-4">
            <label className="block font-medium mb-1">{field.label}</label>
            {field.type === 'select' && field.options ? (
              <select
                className="select select-bordered w-full"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                {field.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                className="input input-bordered w-full"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    field.type === 'number'
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
              />
            )}
          </div>
        ))}
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={isDisabled}
          >
            Guardar
          </button>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditModal;

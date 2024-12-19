import React from 'react';
import { AbsenceType } from '../../models/types';

interface AbsenceTypeRowProps {
  type: AbsenceType;
  onEdit: (id: number, type: string) => void;
  onDelete: (id: number) => void;
}

const AbsenceTypeRow: React.FC<AbsenceTypeRowProps> = React.memo(
  ({ type, onDelete, onEdit }) => {
    return (
      <tr className="hover:bg-base-100">
        <td className="text-base">{type.TYPE}</td>
        <td className="flex gap-2">
          <button
            className="btn btn-error btn-sm text-base"
            onClick={() => onEdit(type.ABSENCE_TYPE_ID, type.TYPE)}
          >
            Editar
          </button>
          <button
            className="btn btn-error btn-sm text-base"
            onClick={() => onDelete(type.ABSENCE_TYPE_ID)}
          >
            Eliminar
          </button>
        </td>
      </tr>
    );
  }
);

export default AbsenceTypeRow;

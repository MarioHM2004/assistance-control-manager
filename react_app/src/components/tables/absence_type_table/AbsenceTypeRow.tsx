import React from 'react';
import { AbsenceType } from '../../models/types';

interface AbsenceTypeRowProps {
  type: AbsenceType;
  onDelete: (id: number) => void;
}

const AbsenceTypeRow: React.FC<AbsenceTypeRowProps> = React.memo(
  ({ type, onDelete }) => {
    return (
      <tr className="hover:bg-base-100">
        <td className="text-base">{type.TYPE}</td>
        <td>
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

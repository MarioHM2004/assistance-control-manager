import React from 'react';
import { Absence } from '../../models/types';

interface AbsenceRowProps {
  item: Absence;
  onEdit: (absence: Absence) => void;
  onDelete: (id: number) => void;
}

const AbsenceRow: React.FC<AbsenceRowProps> = React.memo(({ item, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-base-100 text-base">
      <td>{item.employeeName}</td>
      <td>{item.absenceType}</td>
      <td>{item.description}</td>
      <td>{item.hoursAbsent}</td>
      <td>
        {item.date
          ? new Date(item.date).toISOString().split('T')[0]
          : 'Sin fecha'}
      </td>
      <td>
        <button
          className="btn btn-error btn-sm mb-2 text-base"
          onClick={() => onEdit(item)}
        >
          Editar
        </button>
        <button
          className="btn btn-error btn-sm text-base"
          onClick={() => onDelete(item.absenceId)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
});

export default AbsenceRow;

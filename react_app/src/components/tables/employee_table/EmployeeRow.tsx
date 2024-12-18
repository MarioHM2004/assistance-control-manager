import React from 'react';
import { Employees } from '../../models/types';

interface EmployeeRowProps {
  employee: Employees; // Datos del empleado para la fila
  onEdit: (id: number, name: string, statusId: number) => void; // Callback para editar
  onDelete: (id: number) => void; // Callback para eliminar
  statusLabel: string; // Etiqueta del estado del empleado (ej. Activo/Inactivo)
}

const EmployeeRow: React.FC<EmployeeRowProps> = React.memo(
  ({ employee, onEdit, onDelete, statusLabel }) => {
    return (
      <tr className="hover:bg-base-100">
        <td className="text-base">{employee.NAME}</td>
        <td className="text-base">{statusLabel}</td>
        <td>
          <button
            className="btn btn-error btn-sm mr-2 mb-2 text-base"
            onClick={() =>
              onEdit(employee.EMPLOYEE_ID, employee.NAME, employee.STATUS_ID)
            }
          >
            Editar
          </button>
          <button
            className="btn btn-error btn-sm text-base"
            onClick={() => onDelete(employee.EMPLOYEE_ID)}
          >
            Eliminar
          </button>
        </td>
      </tr>
    );
  }
);

export default EmployeeRow;

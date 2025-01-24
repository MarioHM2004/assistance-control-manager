import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Employees } from '../../models/types';
import TableHeader from '../generic_components/TableHeaderFromFront';
import AddEditModal from '../../modals/AddEditModal';
import EmployeeRow from './EmployeeRow';

export const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employees[]>([]);
  const [filters, setFilters] = useState({ name: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeStatus, setNewEmployeeStatus] = useState<number>(1);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null); // Estado para el error de eliminación

  const statusOptions = useMemo(
    () => [
      { id: 1, label: 'Activo' },
      { id: 2, label: 'Inactivo' },
    ],
    []
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-employees');
      setEmployees(result);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const resetModalState = useCallback(() => {
    setNewEmployeeName('');
    setNewEmployeeStatus(1);
    setIsModalOpen(false);
    setEditingEmployeeId(null);
  }, []);

  const handleAddEmployee = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('add-employees', {
        name: newEmployeeName.trim(),
        status_id: newEmployeeStatus,
      });
      if (result > 0) {
        setEmployees((prev) => [
          ...prev,
          {
            EMPLOYEE_ID: result,
            NAME: newEmployeeName.trim(),
            STATUS_ID: newEmployeeStatus,
          },
        ]);
        resetModalState();
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  }, [newEmployeeName, newEmployeeStatus, resetModalState]);

  const handleEditEmployee = useCallback(
    (id: number, name: string, statusId: number) => {
      setEditingEmployeeId(id);
      setNewEmployeeName(name);
      setNewEmployeeStatus(statusId);
      setIsModalOpen(true);
    },
    []
  );

  const handleUpdateEmployee = useCallback(async () => {
    try {
      await window.electron.ipcRenderer.invoke('edit-employees', {
        id: editingEmployeeId,
        name: newEmployeeName.trim(),
        status_id: newEmployeeStatus,
      });

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.EMPLOYEE_ID === editingEmployeeId
            ? {
                ...employee,
                NAME: newEmployeeName.trim(),
                STATUS_ID: newEmployeeStatus,
              }
            : employee
        )
      );
      resetModalState();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  }, [editingEmployeeId, newEmployeeName, newEmployeeStatus, resetModalState]);

  const handleDeleteEmployee = useCallback(async (id: number) => {
    try {
      await window.electron.ipcRenderer.invoke('delete-employees', id);
      setEmployees((prev) =>
        prev.filter((employee) => employee.EMPLOYEE_ID !== id)
      );
      setDeleteError(null); // Limpiar error si la eliminación fue exitosa
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes('foreign key constraint') ||
        errorMessage.includes('related absences')
      ) {
        setDeleteError(
          'No se puede eliminar este empleado porque tiene faltas relacionadas.'
        );
      } else {
        setDeleteError('Error eliminando el empleado. Por favor, inténtalo de nuevo.');
      }
      console.error('Error deleting employee:', errorMessage);
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesName = employee.NAME.toLowerCase().includes(
        filters.name.toLowerCase()
      );
      const statusFilterId = statusOptions.find(
        (option) => option.label.toLowerCase() === filters.status.toLowerCase()
      )?.id;

      const matchesStatus =
        !filters.status || employee.STATUS_ID === statusFilterId;
      return matchesName && matchesStatus;
    });
  }, [employees, filters, statusOptions]);

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lista de Empleados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Añadir Empleado
        </button>
      </div>
      {deleteError && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{deleteError}</span>
        </div>
      )}
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <TableHeader
            filters={filters}
            keyMapping={{ Nombre: 'name', Estado: 'status' }}
            onFilterChange={handleFilterChange}
          />
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <EmployeeRow
                  key={`employee-${employee.EMPLOYEE_ID}`}
                  employee={employee}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  statusLabel={
                    statusOptions.find((s) => s.id === employee.STATUS_ID)
                      ?.label || 'Desconocido'
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddEditModal
        isOpen={isModalOpen}
        title={editingEmployeeId ? 'Editar Empleado' : 'Añadir Empleado'}
        fields={[
          {
            label: 'Nombre',
            value: newEmployeeName,
            type: 'text',
            onChange: (value: string | number) =>
              setNewEmployeeName(String(value)),
          },
          {
            label: 'Estado',
            value: newEmployeeStatus,
            type: 'select',
            onChange: (value: string | number) =>
              setNewEmployeeStatus(Number(value)),
            options: statusOptions,
          },
        ]}
        onSave={editingEmployeeId ? handleUpdateEmployee : handleAddEmployee}
        onClose={resetModalState}
        isDisabled={!newEmployeeName.trim()}
      />
    </div>
  );
};

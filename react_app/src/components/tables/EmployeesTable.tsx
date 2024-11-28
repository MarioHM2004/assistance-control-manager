import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Employees } from '../models/types';

const EmployeeRow = React.memo(
  ({
    employee,
    onEdit,
    onDelete,
    statusLabel,
  }: {
    employee: Employees;
    onEdit: (id: number, name: string, statusId: number) => void;
    onDelete: (id: number) => void;
    statusLabel: string;
  }) => (
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
  )
);

export const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employees[]>([]);
  const [filters, setFilters] = useState({ name: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeStatus, setNewEmployeeStatus] = useState<number>(1);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );

  const statusOptions = useMemo(
    () => [
      { id: 1, label: 'Activo' },
      { id: 2, label: 'Inactivo' },
    ],
    []
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'get-employees'
        );
        setEmployees(result);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

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
          ...prev.filter((e) => e.EMPLOYEE_ID !== result),
          {
            EMPLOYEE_ID: result,
            NAME: newEmployeeName.trim(),
            STATUS_ID: newEmployeeStatus,
          },
        ]);
        resetModalState();
      }
    } catch (error) {
      console.error('Error adding employee:', (error as Error).message);
      alert((error as Error).message);
    }
  }, [newEmployeeName, newEmployeeStatus, resetModalState]);

  const handleDeleteEmployee = useCallback(async (id: number) => {
    try {
      await window.electron.ipcRenderer.invoke('delete-employees', id);
      setEmployees((prev) =>
        prev.filter((employee) => employee.EMPLOYEE_ID !== id)
      );
    } catch (error) {
      console.error('Error deleting employee:', (error as Error).message);
      alert((error as Error).message);
    }
  }, []);

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
      console.error('Error updating employee:', (error as Error).message);
      alert((error as Error).message);
    }
  }, [editingEmployeeId, newEmployeeName, newEmployeeStatus, resetModalState]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesName = employee.NAME.toLowerCase().includes(
        filters.name.toLowerCase()
      );
      const matchesStatus =
        !filters.status || employee.STATUS_ID.toString() === filters.status;
      return matchesName && matchesStatus;
    });
  }, [employees, filters]);

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lista de Empleados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary sm:btn-sm md:btn-md lg:btn-md"
        >
          Añadir Empleado
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              <th className="w-2/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtrar por nombre"
                    className="input input-bordered input-sm ml-2"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Estado</span>
                </div>
              </th>
              <th className="w-1/5">
                <span className="font-extrabold text-base">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <EmployeeRow
                  key={`employee-${employee.EMPLOYEE_ID}`}
                  employee={employee}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  statusLabel={
                    statusOptions.find(
                      (status) => status.id === employee.STATUS_ID
                    )?.label || 'Desconocido'
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

      <input
        type="checkbox"
        id="add-edit-modal"
        className="modal-toggle"
        checked={isModalOpen}
        readOnly
      />
      <div className="modal">
        <div className="modal-box">
          <h2 className="font-bold text-lg pb-4">
            {editingEmployeeId ? 'Editar Empleado' : 'Añadir Empleado'}
          </h2>
          <input
            type="text"
            placeholder="Nombre del empleado"
            className="input input-bordered w-full mb-4"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
          />
          <select
            className="select select-bordered w-full"
            value={newEmployeeStatus}
            onChange={(e) => setNewEmployeeStatus(Number(e.target.value))}
          >
            {statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={
                editingEmployeeId ? handleUpdateEmployee : handleAddEmployee
              }
              disabled={!newEmployeeName.trim()}
            >
              {editingEmployeeId ? 'Actualizar' : 'Añadir'}
            </button>
            <button className="btn" onClick={resetModalState}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

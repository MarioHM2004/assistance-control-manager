import { useState, useEffect } from 'react';
import { Employees } from '../models/types';

export const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employees[]>([]);
  const [filters, setFilters] = useState({ name: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeStatus, setNewEmployeeStatus] = useState<number>(1);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  const statusOptions = [
    { id: 1, label: 'Activo' },
    { id: 2, label: 'Inactivo' },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke('get-employees');
        setEmployees(result);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.NAME.toLowerCase().includes(filters.name.toLowerCase())
  );

  const handleAddEmployee = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('add-employees', {
        name: newEmployeeName,
        status_id: newEmployeeStatus,
      });
      if (result > 0) {
        setEmployees([
          ...employees,
          { EMPLOYEE_ID: result, NAME: newEmployeeName, STATUS_ID: newEmployeeStatus },
        ]);
        resetModalState();
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('delete-employees', id);
      if (result > 0) {
        setEmployees(employees.filter((employee) => employee.EMPLOYEE_ID !== id));
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEditEmployee = (id: number, name: string, statusId: number) => {
    setEditingEmployeeId(id);
    setNewEmployeeName(name);
    setNewEmployeeStatus(statusId);
    setIsModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('edit-employees', {
        id: editingEmployeeId,
        name: newEmployeeName,
        status_id: newEmployeeStatus,
      });
      if (result > 0) {
        setEmployees(
          employees.map((employee) =>
            employee.EMPLOYEE_ID === editingEmployeeId
              ? { ...employee, NAME: newEmployeeName, STATUS_ID: newEmployeeStatus }
              : employee
          )
        );
        resetModalState();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const resetModalState = () => {
    setNewEmployeeName('');
    setNewEmployeeStatus(1);
    setIsModalOpen(false);
    setEditingEmployeeId(null);
  };

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
              <th className="w-1/5">
                <span className="font-extrabold text-base">ID</span>
              </th>
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
                  <input
                    type="text"
                    placeholder="Filtrar por estado"
                    className="input input-bordered input-sm ml-2"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  />
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
                <tr key={employee.EMPLOYEE_ID} className="hover:bg-base-100">
                  <td className="text-base">{employee.EMPLOYEE_ID}</td>
                  <td className="text-base">{employee.NAME}</td>
                  <td className="text-base">
                    {statusOptions.find((status) => status.id === employee.STATUS_ID)?.label ||
                      'Desconocido'}
                  </td>
                  <td>
                    <button
                      className="btn btn-error btn-sm mr-2 text-base"
                      onClick={() =>
                        handleEditEmployee(employee.EMPLOYEE_ID, employee.NAME, employee.STATUS_ID)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-error btn-sm text-base"
                      onClick={() => handleDeleteEmployee(employee.EMPLOYEE_ID)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <input type="checkbox" id="add-edit-modal" className="modal-toggle" checked={isModalOpen} readOnly />
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
              onClick={editingEmployeeId ? handleUpdateEmployee : handleAddEmployee}
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

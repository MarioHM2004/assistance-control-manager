import { useState, useEffect } from 'react';
import { Modal } from 'react-daisyui';

interface Employee {
  EMPLOYEE_ID: number;
  NAME: string;
}

export const EmployeesTable: React.FC = () => {
  const [data, setData] = useState<Employee[]>([]);

  const [filters, setFilters] = useState({
    name: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'get-employees'
        );
        setData(result);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = data.filter((item) =>
    item.NAME.toLowerCase().includes(filters.name.toLowerCase())
  );

  const handleAddEmployee = async () => {
    try {
      const newEmployee = { name: newEmployeeName };
      const result = await window.electron.ipcRenderer.invoke(
        'add-employees',
        newEmployee
      );

      if (result > 0) {

        const addedEmployee = { EMPLOYEE_ID: result, NAME: newEmployeeName };
        setData((prevData) => [...prevData, addedEmployee]);
      }

      setNewEmployeeName('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'delete-employees',
        id
      );

      if (result > 0) {
        setData((prevData) =>
          prevData.filter((employee) => employee.EMPLOYEE_ID !== id)
        );
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEditEmployee = (id: number, name: string) => {
    setEditingEmployeeId(id);
    setNewEmployeeName(name);
    setIsModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const updatedEmployee = {
        id: editingEmployeeId,
        name: newEmployeeName,
      };

      const result = await window.electron.ipcRenderer.invoke(
        'edit-employees',
        updatedEmployee
      );

      if (result > 0) {
        setData((prevData) =>
          prevData.map((employee) =>
            employee.EMPLOYEE_ID === editingEmployeeId
              ? { ...employee, NAME: newEmployeeName }
              : employee
          )
        );
      }

      setNewEmployeeName('');
      setIsModalOpen(false);
      setEditingEmployeeId(null);
    } catch (error) {
      console.error('Error editing employee:', error);
    }
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
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">ID</span>
                </div>
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
                <span className="font-extrabold text-base">Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.EMPLOYEE_ID} className="hover:bg-base-100">
                  <td className="text-base">{item.EMPLOYEE_ID}</td>
                  <td className="text-base">{item.NAME}</td>
                  <td>
                    <button
                      className="btn btn-error btn-sm mr-2 text-base"
                      onClick={() =>
                        handleEditEmployee(item.EMPLOYEE_ID, item.NAME)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-error btn-sm text-base"
                      onClick={() => handleDeleteEmployee(item.EMPLOYEE_ID)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
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

      <Modal
        open={isModalOpen}
        onClickBackdrop={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <Modal.Header className="font-bold text-lg pb-4">
            {editingEmployeeId ? 'Editar Empleado' : 'Añadir Empleado'}
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              placeholder="Nombre del empleado"
              className="input input-bordered w-full"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
            />
          </Modal.Body>
          <Modal.Actions className="flex justify-end pt-4">
            <button
              className="btn btn-primary mr-2"
              onClick={
                editingEmployeeId ? handleUpdateEmployee : handleAddEmployee
              }
              disabled={!newEmployeeName.trim()}
            >
              {editingEmployeeId ? 'Actualizar' : 'Añadir'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEmployeeId(null);
              }}
            >
              Cancelar
            </button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

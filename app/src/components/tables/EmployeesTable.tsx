import { useState } from 'react';
import { Modal } from 'react-daisyui'; // Import the DaisyUI Modal component

export const EmployeesTable: React.FC = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: 'Guest Timons',
    },
    {
      id: 2,
      name: 'Alice Kleyton',
    },
    {
      id: 3,
      name: 'Bob McBob',
    },
  ]);

  const [filters, setFilters] = useState({
    name: '',
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(filters.name.toLowerCase())
  );

  // Function to handle adding a new employee
  const handleAddEmployee = () => {
    const newEmployee = {
      id: data.length + 1,
      name: newEmployeeName,
    };
    setData([...data, newEmployee]);
    setNewEmployeeName(''); // Clear input field
    setIsModalOpen(false); // Close the modal
  };

  // Function to handle deleting an employee
  const handleDeleteEmployee = (id: number) => {
    const updatedData = data.filter((employee) => employee.id !== id);
    setData(updatedData);
  };

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      {/* Header section with Add button */}
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lista de Empleados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary sm:btn-sm md:btn-md lg:btn-md"
        >
          Añadir Empleado
        </button>
      </div>

      {/* Table */}
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          {/* Table Header */}
          <thead className="sticky top-0 bg-base-300">
            <tr>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">ID</span>
                </div>
              </th>
              <th className="w-2/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">Nombre</span>
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
                <span className="font-extrabold">Acciones</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-base-100">
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteEmployee(item.id)}
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

      {/* Modal for adding employee */}
      <Modal
        open={isModalOpen}
        onClickBackdrop={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <Modal.Header className="font-bold text-lg">
            Añadir Empleado
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
          <Modal.Actions className="flex justify-end">
            <button
              className="btn btn-primary mr-2"
              onClick={handleAddEmployee}
              disabled={!newEmployeeName.trim()}
            >
              Añadir
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

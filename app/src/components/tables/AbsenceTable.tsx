import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-daisyui';

interface Absence {
  absenceId: number;
  name: string;
  absenceType: string;
  description: string;
  hoursAbsent: number;
  date: string;
}

interface AbsenceType {
  ABSENCE_TYPE_ID: number;
  TYPE: string;
}

const AssistTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    absenceType: '',
    description: '',
    hoursAbsent: '',
    date: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const result: Absence[] = await window.electron.ipcRenderer.invoke(
          'get-absences'
        );
        const typesResponse = await window.electron.ipcRenderer.invoke(
          'get-absence-types'
        );
        setData(result);
        setAbsenceTypes(typesResponse);
      } catch (error) {
        console.error('Error fetching absences:', error);
      }
    };

    fetchAbsences();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = data.filter((item) => {
    const matchesFilters = Object.keys(filters).every((key) => {
      if (key === 'hoursAbsent') {
        return true;
      }
      return item[key as keyof typeof filters]
        .toString()
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase());
    });

    const matchesHoursAbsent =
      !filters.hoursAbsent ||
      item.hoursAbsent === parseFloat(filters.hoursAbsent);

    return matchesFilters && matchesHoursAbsent;
  });

  const handleEditAbsence = (absence: Absence) => {
    setEditingAbsence(absence);
    setIsModalOpen(true);
  };

  const handleDeleteAbsence = async (absenceId: number) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'delete-absence',
        absenceId
      );
      if (result > 0) {
        setData(data.filter((absence) => absence.absenceId !== absenceId));
      }
    } catch (error) {
      console.error('Error deleting absence:', error);
    }
  };

  const handleUpdateAbsence = async () => {
    if (editingAbsence) {
      const selectedAbsenceType = absenceTypes.find(
        (type) => type.TYPE === editingAbsence.absenceType
      );

      if (!selectedAbsenceType) {
        console.error('Tipo de falta no encontrado para actualización');
        return;
      }

      const absenceData = {
        ...editingAbsence,
        absenceTypeId: selectedAbsenceType.ABSENCE_TYPE_ID,
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'edit-absence',
          absenceData
        );
        if (result > 0) {
          setData(
            data.map((absence) =>
              absence.absenceId === editingAbsence.absenceId
                ? editingAbsence
                : absence
            )
          );
          setIsModalOpen(false);
          setEditingAbsence(null);
        }
      } catch (error) {
        console.error('Error updating absence:', error);
      }
    }
  };

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold pr-4">Tablero</h1>
          </div>
        </div>
        <div>
          <Link
            to="/Absence"
            className="btn sm:btn-sm md:btn-md lg:btn-md btn-primary mr-2"
          >
            Nueva falta
          </Link>
          <Link
            to="/Absence"
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-md btn-secondary"
          >
            Exportar
          </Link>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              <th className="w-1/5">
                <div>
                  <p className="pb-2 font-extrabold text-base">Nombre</p>
                  <input
                    type="text"
                    name="name"
                    placeholder="Filtrar por nombre"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full h-8"
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div>
                  <p className="pb-2 font-extrabold text-base">Tipo de Falta</p>
                  <input
                    type="text"
                    name="absenceType"
                    placeholder="Filtrar por tipo de falta"
                    value={filters.absenceType}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full h-8"
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div>
                  <p className="pb-2 font-extrabold text-base">Descripción</p>
                  <input
                    type="text"
                    name="description"
                    placeholder="Filtrar por descripción"
                    value={filters.description}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full h-8"
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div>
                  <p className="pb-2 font-extrabold text-base">
                    Horas Faltadas
                  </p>
                  <input
                    type="text"
                    name="hoursAbsent"
                    placeholder="Filtrar por horas faltadas"
                    value={filters.hoursAbsent}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full h-8"
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div>
                  <p className="pb-2 font-extrabold text-base">Fecha</p>
                  <input
                    type="text"
                    name="date"
                    placeholder="Filtrar por fecha"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full h-8"
                  />
                </div>
              </th>
              <th className="w-1/5 align-top font-extrabold text-base">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-base-100">
                  <td className="text-base">{item.name}</td>
                  <td className="text-base">{item.absenceType}</td>
                  <td className="text-base">{item.description}</td>
                  <td className="text-base">{item.hoursAbsent}</td>
                  <td className="text-base">{item.date}</td>
                  <td>
                    <button
                      className="btn btn-error btn-sm mb-1"
                      onClick={() => handleEditAbsence(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteAbsence(item.absenceId)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay datos
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
            Editar Ausencia
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              placeholder="Nombre"
              className="input input-bordered w-full mb-4"
              value={editingAbsence?.name || ''}
              onChange={(e) =>
                setEditingAbsence((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
            />
            <select
              className="select select-bordered w-full mb-4"
              value={editingAbsence?.absenceType || ''}
              onChange={(e) =>
                setEditingAbsence((prev) =>
                  prev ? { ...prev, absenceType: e.target.value } : prev
                )
              }
            >
              <option value="" disabled>
                Selecciona el tipo de falta
              </option>
              {absenceTypes.map((type) => (
                <option key={type.ABSENCE_TYPE_ID} value={type.TYPE}>
                  {type.TYPE}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descripción"
              className="input input-bordered w-full mb-4"
              value={editingAbsence?.description || ''}
              onChange={(e) =>
                setEditingAbsence((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
            />
            <input
              type="number"
              placeholder="Horas Faltadas"
              className="input input-bordered w-full mb-4"
              value={editingAbsence?.hoursAbsent || ''}
              onChange={(e) =>
                setEditingAbsence((prev) =>
                  prev ? { ...prev, hoursAbsent: +e.target.value } : prev
                )
              }
            />
            <input
              type="text"
              placeholder="Fecha"
              className="input input-bordered w-full"
              value={editingAbsence?.date || ''}
              onChange={(e) =>
                setEditingAbsence((prev) =>
                  prev ? { ...prev, date: e.target.value } : prev
                )
              }
            />
          </Modal.Body>
          <Modal.Actions className="flex justify-end pt-4">
            <button
              className="btn btn-primary mr-2"
              onClick={handleUpdateAbsence}
            >
              Guardar
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

export default AssistTable;

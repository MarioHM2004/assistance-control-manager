import { useState, useEffect } from 'react';
import { AbsenceType } from '../models/types';

export const AbsenceTypesTable: React.FC = () => {
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [filter, setFilter] = useState('');
  const [newAbsenceType, setNewAbsenceType] = useState('');
  const [error, setError] = useState<String | null>(null);

  useEffect(() => {
    const fetchAbsenceTypes = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke('get-absence-types');
        setAbsenceTypes(result);
      } catch (error) {
        console.error('Error fetching absence types:', error);
      }
    };
    fetchAbsenceTypes();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const filteredAbsenceTypes = absenceTypes.filter((type) =>
    type.TYPE.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAddAbsenceType = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('add-absence-type', {
        type: newAbsenceType,
      });
      if (result > 0) {
        setAbsenceTypes([...absenceTypes, { ABSENCE_TYPE_ID: result, TYPE: newAbsenceType }]);
        resetModalState();
      }
    } catch (error) {
      console.error('Error adding absence type:', error);
    }
  };

  const handleDeleteAbsenceType = async (id: number) => {
    try {
      setError('');
      const result = await window.electron.ipcRenderer.invoke('delete-absence-type', {
        absenceTypeId: id,
      });
      if (result > 0) {
        setAbsenceTypes(absenceTypes.filter((type) => type.ABSENCE_TYPE_ID !== id));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('related absences')) {
        setError(
          'Error: No se puede eliminar este tipo de falta porque tiene faltas relacionadas.'
        );
        setTimeout(() => setError(null), 3000);
      } else {
        console.error('Error deleting absence type:', error);
      }
    }
  };

  const resetModalState = () => {
    setNewAbsenceType('');
    const checkbox = document.getElementById('add-absence-type-modal') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lista de Tipos de Ausencia</h1>
        <label htmlFor="add-absence-type-modal" className="btn btn-primary sm:btn-sm md:btn-md lg:btn-md">
          Añadir Tipo de Ausencia
        </label>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              <th className="w-1/5">
                <span className="font-extrabold text-base">ID</span>
              </th>
              <th className="w-3/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Tipo de Falta</span>
                  <input
                    type="text"
                    placeholder="Filtrar por tipo"
                    className="input input-bordered input-sm ml-2"
                    value={filter}
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
            {filteredAbsenceTypes.length > 0 ? (
              filteredAbsenceTypes.map((type) => (
                <tr key={type.ABSENCE_TYPE_ID} className="hover:bg-base-100">
                  <td className="text-base">{type.ABSENCE_TYPE_ID}</td>
                  <td className="text-base">{type.TYPE}</td>
                  <td>
                    <button
                      className="btn btn-error btn-sm text-base"
                      onClick={() => handleDeleteAbsenceType(type.ABSENCE_TYPE_ID)}
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
      {error && (
        <div className="alert alert-error shadow-lg mb-4 mt-4">
          <span>{error}</span>
        </div>
      )}

      <input type="checkbox" id="add-absence-type-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg pb-4">Añadir Tipo de Ausencia</h3>
          <input
            type="text"
            placeholder="Nombre del tipo de ausencia"
            className="input input-bordered w-full"
            value={newAbsenceType}
            onChange={(e) => setNewAbsenceType(e.target.value)}
          />
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={handleAddAbsenceType}
              disabled={!newAbsenceType.trim()}
            >
              Añadir
            </button>
            <label htmlFor="add-absence-type-modal" className="btn">
              Cancelar
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceTypesTable;

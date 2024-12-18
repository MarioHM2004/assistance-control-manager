import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AbsenceType } from '../../models/types';
import AbsenceTypeRow from './AbsenceTypeRow';
import TableHeader from '../generic_components/TableHeaderFromFront';
import AddEditModal from '../generic_components/AddEditModal';

const AbsenceTypesTable: React.FC = () => {
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [filter, setFilter] = useState('');
  const [newAbsenceType, setNewAbsenceType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAbsenceTypes = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'get-absence-types'
      );
      setAbsenceTypes(result);
    } catch (error) {
      console.error('Error fetching absence types:', error);
    }
  }, []);

  useEffect(() => {
    fetchAbsenceTypes();
  }, [fetchAbsenceTypes]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  const handleAddAbsenceType = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'add-absence-type',
        { type: newAbsenceType.trim() }
      );
      if (result > 0) {
        setAbsenceTypes((prev) => [
          ...prev,
          { ABSENCE_TYPE_ID: result, TYPE: newAbsenceType.trim() },
        ]);
        setNewAbsenceType('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding absence type:', error);
    }
  }, [newAbsenceType]);

  const handleDeleteAbsenceType = useCallback(async (id: number) => {
    try {
      setError(null);
      const result = await window.electron.ipcRenderer.invoke(
        'delete-absence-type',
        { absenceTypeId: id }
      );
      if (result > 0) {
        setAbsenceTypes((prev) =>
          prev.filter((type) => type.ABSENCE_TYPE_ID !== id)
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('related absences')
      ) {
        setError(
          'No se puede eliminar este tipo de falta porque tiene faltas relacionadas.'
        );
      } else {
        console.error('Error deleting absence type:', error);
      }
    }
  }, []);

  const filteredAbsenceTypes = useMemo(() => {
    return absenceTypes.filter((type) =>
      type.TYPE.toLowerCase().includes(filter.toLowerCase())
    );
  }, [absenceTypes, filter]);

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lista de Tipos de Falta</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Añadir Tipo de Falta
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <TableHeader
            filters={{ filter }}
            keyMapping={{ 'Tipo de Falta': 'filter' }}
            onFilterChange={handleFilterChange}
          />
          <tbody>
            {filteredAbsenceTypes.length > 0 ? (
              filteredAbsenceTypes.map((type) => (
                <AbsenceTypeRow
                  key={`absence-type-${type.ABSENCE_TYPE_ID}`}
                  type={type}
                  onDelete={handleDeleteAbsenceType}
                />
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center">
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
      <AddEditModal
        isOpen={isModalOpen}
        title="Añadir Tipo de Falta"
        fields={[
          {
            label: 'Nombre del tipo de falta',
            value: newAbsenceType,
            type: 'text',
            onChange: (value: string | number) => setNewAbsenceType(String(value)),
          },
        ]}
        onSave={handleAddAbsenceType}
        onClose={() => setIsModalOpen(false)}
        isDisabled={!newAbsenceType.trim()}
      />
    </div>
  );
};

export default AbsenceTypesTable;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Absence, AbsenceType } from '../../models/types';
import AddEditModal from '../generic_components/AddEditModal';
import TableHeader from '../generic_components/TableHeaderFromBack';
import AbsenceRow from './AbsenceRow';
import debounce from '../../utils/debounce';

const AbsenceTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    Nombre: '',
    'Tipo de Falta': '',
    Descripción: '',
    'Horas faltadas': '',
    Fecha: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const keyMapping = useMemo(
    () => ({
      Nombre: 'name',
      'Tipo de Falta': 'absenceType',
      Descripción: 'description',
      'Horas faltadas': 'hoursAbsent',
      Fecha: 'date',
    }),
    []
  );

  const fetchData = useCallback(
    async (filters: Record<string, string>) => {
      try {
        const { absences, totalCount } =
          await window.electron.ipcRenderer.invoke('get-absences', {
            page: currentPage,
            limit: recordsPerPage,
            filters,
          });

        const processedData = absences.map((absence: Absence) => ({
          ...absence,
          date: new Date(absence.date).toISOString().split('T')[0], // Formatear fecha
        }));

        setData(processedData); // Establecer datos de la tabla
        setTotalRecords(totalCount); // Actualizar el total de registros
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    [currentPage, recordsPerPage]
  );

  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 500),
    [fetchData]
  );

  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  useEffect(() => {
    fetchData(filters);
  }, [currentPage, fetchData, filters]);

  useEffect(() => {
    const fetchAbsenceTypes = async () => {
      try {
        const types: AbsenceType[] = await window.electron.ipcRenderer.invoke(
          'get-absence-types'
        );
        setAbsenceTypes(types); // Actualizar los tipos de falta en el estado
      } catch (error) {
        console.error('Error fetching absence types:', error);
      }
    };

    fetchAbsenceTypes();
  }, []);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      setCurrentPage(1);
    },
    []
  );

  const handleEditAbsence = useCallback((absence: Absence) => {
    setEditingAbsence(absence);
    setIsModalOpen(true);
  }, []);

  const handleDeleteAbsence = useCallback(
    async (absenceId: number) => {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-absence',
          absenceId
        );
        if (result > 0) {
          console.log('Ausencia eliminada correctamente');
          fetchData(filters); // Refrescar datos después de la eliminación
        }
      } catch (error) {
        console.error('Error deleting absence:', error);
      }
    },
    [fetchData, filters]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAbsence(null);
  }, []);

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
        absenceTypeId: selectedAbsenceType.ABSENCE_TYPE_ID, // Mapear ID del tipo de falta
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'edit-absence',
          absenceData
        );
        if (result > 0) {
          console.log('Ausencia actualizada correctamente');
          fetchData(filters); // Refrescar datos después de la actualización
          setEditingAbsence(null); // Reiniciar ausencia en edición
        }
      } catch (error) {
        console.error('Error updating absence:', error);
      }
    }
  };

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tablero</h1>
        <div>
          <Link to="/Absence" className="btn btn-primary mr-2">
            Nueva falta
          </Link>
          <button
            onClick={async () => {
              try {
                const allFilteredAbsences =
                  await window.electron.ipcRenderer.invoke(
                    'export-all-absences',
                    filters
                  );

                window.electron.ipcRenderer.invoke(
                  'export-excel',
                  allFilteredAbsences
                );
              } catch (error) {
                console.error('Error exporting absences:', error);
              }
            }}
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-md btn-secondary"
          >
            Exportar
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <TableHeader
            filters={filters}
            onFilterChange={handleFilterChange}
            keyMapping={keyMapping}
          />
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <AbsenceRow
                  key={item.absenceId}
                  item={item}
                  onEdit={handleEditAbsence}
                  onDelete={handleDeleteAbsence}
                />
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
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-primary"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {Math.ceil(totalRecords / recordsPerPage)}
        </span>
        <button
          className="btn btn-primary"
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(totalRecords / recordsPerPage) ? prev + 1 : prev
            )
          }
          disabled={currentPage === Math.ceil(totalRecords / recordsPerPage)}
        >
          Siguiente
        </button>
      </div>
      <AddEditModal
        isOpen={isModalOpen}
        title={'Editar Ausencia'}
        fields={[
          {
            label: 'Nombre del empleado',
            value: editingAbsence?.employeeName || '',
            type: 'text',
            onChange: (value: string | number) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, employeeName: value as string } : prev
              ),
          },
          {
            label: 'Tipo de falta',
            value: editingAbsence?.absenceType || '',
            type: 'select',
            onChange: (value: string | number) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, absenceType: value as string } : prev
              ),
            options: absenceTypes.map((type) => ({
              id: type.ABSENCE_TYPE_ID, // Usa ABSENCE_TYPE_ID como valor del select
              label: type.TYPE,
            })),
          },
          {
            label: 'Descripción',
            value: editingAbsence?.description || '',
            type: 'text',
            onChange: (value: string | number) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, description: value as string } : prev
              ),
          },
          {
            label: 'Horas Faltadas',
            value: editingAbsence?.hoursAbsent || 0,
            type: 'number',
            onChange: (value) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, hoursAbsent: Number(value) } : prev
              ),
          },
          {
            label: 'Fecha',
            value: editingAbsence?.date || '',
            type: 'text',
            onChange: (value) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, date: value as string } : prev
              ),
          },
        ]}
        onSave={handleUpdateAbsence}
        onClose={closeModal}
        isDisabled={
          !editingAbsence?.employeeName?.trim() ||
          !editingAbsence?.absenceType?.trim()
        }
      />
    </div>
  );
};

export default AbsenceTable;

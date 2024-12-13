import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Absence, AbsenceType } from '../models/types';

// Utility function to debounce a given function. It delays execution until after a specified time.
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// Component to render a single row of the absence table.
const AbsenceRow = React.memo(
  ({
    item,
    onEdit,
    onDelete,
  }: {
    item: Absence; // Absence object for the row
    onEdit: (absence: Absence) => void; // Callback for edit button
    onDelete: (id: number) => void; // Callback for delete button
  }) => (
    <tr className="hover:bg-base-100">
      <td>{item.employeeName}</td>
      <td>{item.absenceType}</td>
      <td>{item.description}</td>
      <td>{item.hoursAbsent}</td>
      <td>
        {item.date
          ? new Date(item.date).toISOString().split('T')[0] // Format date
          : 'Sin fecha'}
      </td>
      <td>
        <button
          className="btn btn-error btn-sm mb-2"
          onClick={() => onEdit(item)}
        >
          Editar
        </button>
        <button
          className="btn btn-error btn-sm"
          onClick={() => onDelete(item.absenceId)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  )
);

// Main component for rendering and managing the absence table.
const AbsenceTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]); // Table data
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]); // List of absence types
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [filters, setFilters] = useState({
    Nombre: '', // Employee name filter
    'Tipo de Falta': '', // Absence type filter
    Descripción: '', // Description filter
    'Horas faltadas': '', // Hours absent filter
    Fecha: '', // Date filter
  });

  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null); // Absence being edited
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const recordsPerPage = 10; // Number of records per page

  // Map column headers to their respective keys for filtering
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

  // Fetch data with the current filters and pagination state
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
          date: new Date(absence.date).toISOString().split('T')[0], // Format date
        }));

        setData(processedData); // Set table data
        setTotalRecords(totalCount); // Update total records count
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    [currentPage, recordsPerPage]
  );

  // Debounced fetch function to optimize filter-based data fetching
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 500),
    [fetchData]
  );

  // Fetch data when filters change
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  // Fetch data when the page changes
  useEffect(() => {
    fetchData(filters);
  }, [currentPage, fetchData, filters]);

  // Fetch absence types on component mount
  useEffect(() => {
    const fetchAbsenceTypes = async () => {
      try {
        const types = await window.electron.ipcRenderer.invoke(
          'get-absence-types'
        );
        setAbsenceTypes(types);
      } catch (error) {
        console.error('Error fetching absence types:', error);
      }
    };
    fetchAbsenceTypes();
  }, []);

  // Handle filter changes and reset pagination
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [e.target.name]: e.target.value, // Update specific filter
      }));
      setCurrentPage(1); // Reset to the first page
    },
    []
  );

  // Handle absence deletion
  const handleDeleteAbsence = useCallback(
    async (absenceId: number) => {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-absence',
          absenceId
        );
        if (result > 0) {
          fetchData(filters); // Refresh table after deletion
        }
      } catch (error) {
        console.error('Error deleting absence:', error);
      }
    },
    [fetchData, filters]
  );

  // Open edit modal with selected absence
  const handleEditAbsence = useCallback((absence: Absence) => {
    setEditingAbsence(absence);
    setIsModalOpen(true); // Open modal
  }, []);

  // Close the edit modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false); // Close modal
    setEditingAbsence(null); // Reset editing absence
  }, []);

  // Handle absence update
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
        absenceTypeId: selectedAbsenceType.ABSENCE_TYPE_ID, // Map absence type ID
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'edit-absence',
          absenceData
        );
        if (result > 0) {
          fetchData(filters); // Refresh table after update
          document
            .getElementById('edit-absence-modal')
            ?.removeAttribute('checked');
          setEditingAbsence(null);
        }
      } catch (error) {
        console.error('Error updating absence:', error);
      }
    }
  };

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      {/* Header with actions */}
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tablero</h1>
        <div>
          <Link
            to="/Absence"
            className="btn sm:btn-sm md:btn-md lg:btn-md btn-primary mr-2"
          >
            Nueva falta
          </Link>
          <button
            onClick={async () => {
              try {
                // Export absences with current filters
                const allFilteredAbsences =
                  await window.electron.ipcRenderer.invoke(
                    'export-all-absences',
                    filters
                  );

                // Export data to Excel
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
      {/* Table for displaying absences */}
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              {/* Render headers with filter inputs */}
              {Object.keys(keyMapping).map((header) => (
                <th key={header} className="w-1/5">
                  <div>
                    <p className="pb-2 font-extrabold text-base">{header}</p>
                    <input
                      type="text"
                      name={header}
                      placeholder={`Filtrar por ${header}`}
                      value={filters[header as keyof typeof filters]}
                      onChange={handleFilterChange}
                      className="input input-bordered w-full h-8"
                    />
                  </div>
                </th>
              ))}
              <th className="w-1/5 font-extrabold text-base">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Render data rows or a message if no data is available */}
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
      {/* Pagination controls */}
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
      {/* Edit modal */}
      <input type="checkbox" id="edit-absence-modal" className="modal-toggle" />
      <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Editar Ausencia</h3>
          {/* Input fields for editing absence */}
          <input
            type="text"
            placeholder="Nombre"
            className="input input-bordered w-full mb-4"
            value={editingAbsence?.employeeName || ''}
            onChange={(e) =>
              setEditingAbsence((prev) =>
                prev ? { ...prev, employeeName: e.target.value } : prev
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
            <option disabled>Selecciona el tipo de falta</option>
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
          {/* Modal action buttons */}
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={async () => {
                await handleUpdateAbsence();
                closeModal();
              }}
            >
              Guardar
            </button>
            <button className="btn" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceTable;

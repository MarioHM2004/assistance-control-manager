import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Absence, AbsenceType } from '../models/types';

const AbsenceRow = React.memo(
  ({
    item,
    onEdit,
    onDelete,
  }: {
    item: Absence;
    onEdit: (absence: Absence) => void;
    onDelete: (id: number) => void;
  }) => (
    <tr className="hover:bg-base-100">
      <td>{item.name}</td>
      <td>{item.absenceType}</td>
      <td>{item.description}</td>
      <td>{item.hoursAbsent}</td>
      <td>{item.date}</td>
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

const AbsenceTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    absenceType: '',
    description: '',
    hoursAbsent: '',
    date: '',
  });
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);

  const keyMapping = useMemo(
    () => ({
      name: 'name',
      absenceType: 'absenceType',
      description: 'description',
      hoursAbsent: 'hoursAbsent',
      date: 'date',
    }),
    []
  );

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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        Object.keys(filters).every((key) => {
          if (key === 'hoursAbsent') return true;
          const keyTyped = key as keyof typeof keyMapping;
          const value = item[keyMapping[keyTyped] as keyof Absence];
          const filterValue = filters[key as keyof typeof filters];

          if (!filterValue) return true;
          return value
            ?.toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }) &&
        (!filters.hoursAbsent ||
          item.hoursAbsent === parseFloat(filters.hoursAbsent))
      );
    });
  }, [data, filters, keyMapping]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const handleEditAbsence = useCallback((absence: Absence) => {
    setEditingAbsence(absence);
    document
      .getElementById('edit-absence-modal')
      ?.setAttribute('checked', 'true');
  }, []);

  const handleDeleteAbsence = useCallback(async (absenceId: number) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'delete-absence',
        absenceId
      );
      if (result > 0) {
        setData((prevData) =>
          prevData.filter((absence) => absence.absenceId !== absenceId)
        );
      }
    } catch (error) {
      console.error('Error deleting absence:', error);
    }
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
        absenceTypeId: selectedAbsenceType.ABSENCE_TYPE_ID,
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'edit-absence',
          absenceData
        );
        if (result > 0) {
          setData((prevData) =>
            prevData.map((absence) =>
              absence.absenceId === editingAbsence.absenceId
                ? editingAbsence
                : absence
            )
          );
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
            onClick={() => {
              const filteredExportData = filteredData.map(
                ({ absenceId, employeeStatus, ...rest }) => rest
              );
              window.electron.ipcRenderer.invoke(
                'export-excel',
                filteredExportData
              );
            }}
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-md btn-secondary"
          >
            Exportar
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              {[
                'name',
                'absenceType',
                'description',
                'hoursAbsent',
                'date',
              ].map((header) => (
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
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
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

      <input type="checkbox" id="edit-absence-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Editar Ausencia</h3>
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
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleUpdateAbsence}>
              Guardar
            </button>
            <label htmlFor="edit-absence-modal" className="btn">
              Cancelar
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceTable;

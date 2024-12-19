import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

interface EmployeeRanking {
  employeeId: number;
  employeeName: string;
  absenceCount: number;
  totalHoursAbsent: number;
}

const EmployeeRow = React.memo(
  ({ employee, index }: { employee: EmployeeRanking; index: number }) => (
    <tr className="hover:bg-base-100">
      <td className="text-base">{index + 1}</td>
      <td className="text-base">{employee.employeeName}</td>
      <td className="text-base">{employee.totalHoursAbsent}</td>
      <td className="text-base">{employee.absenceCount}</td>
    </tr>
  )
);

const EmployeeRankingTable: React.FC = () => {
  const [ranking, setRanking] = useState<EmployeeRanking[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'week' | 'month' | 'year' | ''>('');

  const fetchRanking = useCallback(async (start?: string, end?: string) => {
    const finalStartDate = start || startDate;
    const finalEndDate = end || endDate;

    if (!finalStartDate || !finalEndDate) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }

    try {
      const response = await window.electron.ipcRenderer.invoke(
        'get-employee-ranking',
        { startDate: finalStartDate, endDate: finalEndDate }
      );
      setRanking(response);
      setError(null);
    } catch (err) {
      setError('Error al obtener el ranking.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const quickFilters = useMemo(
    () => ({
      week: { start: format(startOfWeek(new Date()), 'yyyy-MM-dd'), end: format(endOfWeek(new Date()), 'yyyy-MM-dd') },
      month: { start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') },
      year: { start: format(startOfYear(new Date()), 'yyyy-MM-dd'), end: format(endOfYear(new Date()), 'yyyy-MM-dd') },
    }),
    []
  );

  // Función para aplicar filtros rápidos
  const applyQuickFilter = useCallback(
    (range: 'week' | 'month' | 'year') => {
      const { start, end } = quickFilters[range];
      setStartDate(start);
      setEndDate(end);
      setActiveFilter(range); // Marcar el filtro activo
      fetchRanking(start, end);
    },
    [fetchRanking, quickFilters]
  );

  useEffect(() => {
    if (isLoading) {
      applyQuickFilter('month');
    }
  }, [applyQuickFilter, isLoading]);

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Ranking de Empleados</h1>
        <div className="flex gap-4 items-end justify-end pb-4 pt-4">
          <button
            onClick={() => applyQuickFilter('week')}
            className={`btn ${activeFilter === 'week' ? 'btn-accent' : 'btn-secondary'}`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => applyQuickFilter('month')}
            className={`btn ${activeFilter === 'month' ? 'btn-accent' : 'btn-secondary'}`}
          >
            Este Mes
          </button>
          <button
            onClick={() => applyQuickFilter('year')}
            className={`btn ${activeFilter === 'year' ? 'btn-accent' : 'btn-secondary'}`}
          >
            Este Año
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error shadow-lg">{error}</div>}

      <div className="max-h-96 overflow-y-auto bg-base-200 shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300">
            <tr>
              <th className="text-left font-extrabold text-base">Ranking</th>
              <th className="text-left font-extrabold text-base">Nombre</th>
              <th className="text-left font-extrabold text-base">Horas Totales Faltadas</th>
              <th className="text-left font-extrabold text-base">Total de Faltas</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length > 0 ? (
              ranking.map((employee, index) => (
                <EmployeeRow key={`employee-${employee.employeeId}`} employee={employee} index={index} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No se encontraron resultados para el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-4 gap-4 flex items-end justify-end">
        <input
          type="date"
          className="input input-bordered"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Fecha Inicio"
        />
        <input
          type="date"
          className="input input-bordered"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Fecha Fin"
        />
        <button onClick={() => fetchRanking()} className="btn btn-primary">
          Obtener Ranking
        </button>
      </div>
    </div>
  );
};

export default EmployeeRankingTable;

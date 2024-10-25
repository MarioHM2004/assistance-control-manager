import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Absence {
  name: string;
  absenceType: string;
  description: string;
  hoursAbsent: number;
  date: string;
}

const AssistTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    absenceType: '',
    description: '',
    hoursAbsent: '',
    date: '',
  });

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const result: Absence[] = await window.electron.ipcRenderer.invoke(
          'get-absences'
        );
        setData(result);
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
      !filters.hoursAbsent || item.hoursAbsent === parseFloat(filters.hoursAbsent);

    return matchesFilters && matchesHoursAbsent;
  });

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
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-md btn-secondary mr-2"
          >
            Importar
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
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtro"
                    className="input input-bordered input-sm w-36 ml-2"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">
                    Tipo de Falta
                  </span>
                  <input
                    type="text"
                    placeholder="Filtro"
                    className="input input-bordered input-sm w-36 ml-2"
                    name="absenceType"
                    value={filters.absenceType}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Descripción</span>
                  <input
                    type="text"
                    placeholder="Filtro"
                    className="input input-bordered input-sm w-36 ml-2"
                    name="description"
                    value={filters.description}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">
                    Horas Faltadas
                  </span>
                  <input
                    type="number"
                    placeholder="Filtro"
                    className="input input-bordered input-sm w-32"
                    name="hoursAbsent"
                    value={filters.hoursAbsent}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base">Fecha</span>
                  <input
                    type="text"
                    placeholder="Filtro"
                    className="input input-bordered input-sm w-36 ml-2"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-base-100">
                  <td>
                    <div className="whitespace-nowrap max-w-xs">
                      <div className="overflow-x-auto text-base">
                        {item.name}
                      </div>
                    </div>
                  </td>
                  <td className="text-base">{item.absenceType}</td>
                  <td>
                    <div className="whitespace-nowrap max-w-xs">
                      <div className="overflow-x-auto text-base">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="text-base">{item.hoursAbsent}</td>
                  <td className="text-base">{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No hay datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssistTable;

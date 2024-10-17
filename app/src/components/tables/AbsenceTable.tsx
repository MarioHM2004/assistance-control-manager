import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Absence {
  nombre: string;
  tipoFalta: string;
  descripcion: string;
  horas: number;
  fecha: string;
  estado: string;
}

const AssistTable: React.FC = () => {
  const [data, setData] = useState<Absence[]>([]);
  const [filters, setFilters] = useState({
    nombre: '',
    tipoFalta: '',
    descripcion: '',
    fecha: '',
    horas: '',
    estado: 'Todos',
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
      if (key === 'horas' || key === 'estado') {
        return true;
      }
      return item[key as keyof typeof filters]
        .toString()
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase());
    });

    const matchesHoras =
      !filters.horas || item.horas === parseFloat(filters.horas);

    const matchesEstado =
      filters.estado === 'Todos' || item.estado === filters.estado;

    return matchesFilters && matchesHoras && matchesEstado;
  });

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold pr-4">Tablero</h1>
          </div>
          <details className="dropdown">
            <summary className="btn m-1 rounded-lg flex items-center text-base btn-secondary">
              <span className="mr-2">Estado</span>
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 011.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <button
                  onClick={() => setFilters({ ...filters, estado: 'Activo' })}
                >
                  Activos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFilters({ ...filters, estado: 'Inactivo' })}
                >
                  Inactivos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFilters({ ...filters, estado: 'Todos' })}
                >
                  Todos
                </button>
              </li>
            </ul>
          </details>
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
                    name="nombre"
                    value={filters.nombre}
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
                    name="tipoFalta"
                    value={filters.tipoFalta}
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
                    name="descripcion"
                    value={filters.descripcion}
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
                    name="horas"
                    value={filters.horas}
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
                    name="fecha"
                    value={filters.fecha}
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
                        {item.nombre}
                      </div>
                    </div>
                  </td>
                  <td className="text-base">{item.tipoFalta}</td>
                  <td>
                    <div className="whitespace-nowrap max-w-xs">
                      <div className="overflow-x-auto text-base">
                        {item.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="text-base">{item.horas}</td>
                  <td className="text-base">{item.fecha}</td>
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

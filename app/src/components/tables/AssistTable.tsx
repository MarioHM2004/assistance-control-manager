import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AssistTable: React.FC = () => {
  const [data] = useState([
    {
      nombre: 'Mario Alessandro Herranz Machado',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó tarde',
      horas: 0.5,
      fecha: '2023-10-01',
    },
    {
      nombre: 'Malcolm Gutierrez',
      tipoFalta: 'Falta',
      descripcion: 'No asistió',
      horas: 8,
      fecha: '2023-09-30',
    },
    {
      nombre: 'Frida',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó tarde',
      horas: 1,
      fecha: '2023-09-29',
    },
    {
      nombre: 'Jonathan',
      tipoFalta: 'Falta',
      descripcion: 'No asistió',
      horas: 7,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Alice',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó muy tarde',
      horas: 2,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Alice',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó muy tarde',
      horas: 2,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Jonathan',
      tipoFalta: 'Falta',
      descripcion: 'No asistió',
      horas: 7,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Alice',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó muy tarde',
      horas: 2,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Jonathan',
      tipoFalta: 'Falta',
      descripcion: 'No asistió',
      horas: 7,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Alice',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó muy tarde',
      horas: 2,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Jonathan',
      tipoFalta: 'Falta',
      descripcion: 'No asistió',
      horas: 7,
      fecha: '2023-09-28',
    },
    {
      nombre: 'Alice',
      tipoFalta: 'Retraso',
      descripcion: 'Llegó muy tarde',
      horas: 2,
      fecha: '2023-09-28',
    },
  ]);

  const [filters, setFilters] = useState({
    nombre: '',
    tipoFalta: '',
    descripcion: '',
    fecha: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = data.filter((item) =>
    Object.keys(filters).every((key) =>
      item[key as keyof typeof filters]
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase())
    )
  );

  return (
    <div className="container mx-auto pt-8 xl:pr-16 xl:pl-16 sm:pl-2 pb-8">
      <div className="pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tablero</h1>
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
                <span className="font-extrabold text-base">Horas Faltadas</span>
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
                  No se encontraron resultados
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

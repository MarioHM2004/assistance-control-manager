import React, { useState } from 'react';

const AssistTable: React.FC = () => {
  const [data] = useState([
    { nombre: 'Guest', tipoFalta: 'Retraso', descripcion: 'Llegó tarde', fecha: '2023-10-01' },
    { nombre: 'Malcolm', tipoFalta: 'Falta', descripcion: 'No asistió', fecha: '2023-09-30' },
    { nombre: 'Frida', tipoFalta: 'Retraso', descripcion: 'Llegó tarde', fecha: '2023-09-29' },
    { nombre: 'Jonathan', tipoFalta: 'Falta', descripcion: 'No asistió', fecha: '2023-09-28' },
    { nombre: 'Guest', tipoFalta: 'Retraso', descripcion: 'Llegó tarde', fecha: '2023-10-01' },
    { nombre: 'Malcolm', tipoFalta: 'Falta', descripcion: 'No asistió', fecha: '2023-09-30' },
    { nombre: 'Frida', tipoFalta: 'Retraso', descripcion: 'Llegó tarde', fecha: '2023-09-29' },
    { nombre: 'Jonathan', tipoFalta: 'Falta', descripcion: 'No asistió', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
    { nombre: 'Alice', tipoFalta: 'Retraso', descripcion: 'Llegó muy tarde', fecha: '2023-09-28' },
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

  const filteredData = data.filter(item =>
    Object.keys(filters).every(key =>
      item[key as keyof typeof filters]
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase())
    )
  );

  return (
    <div className="container mx-auto pt-8 xl:pr-24 xl:pl-24 sm:pl-2 pb-8">
      <div className='pb-4'>
        <button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-md btn-primary">Nueva Falta</button>
      </div>

      <div className="max-h-96 overflow-y-auto overflow-x-auto bg-base-200 shadow-lg">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-200">
            <tr>
              <th className="w-1/4">
                <div className="flex items-center justify-between">
                  <span className='font-extrabold'>Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtrar por nombre"
                    className="input input-bordered input-sm w-35 ml-2"
                    name="nombre"
                    value={filters.nombre}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/4">
                <div className="flex items-center justify-between">
                  <span className='font-extrabold'>Tipo de Falta</span>
                  <input
                    type="text"
                    placeholder="Filtrar por tipo de falta"
                    className="input input-bordered input-sm w-35 ml-2"
                    name="tipoFalta"
                    value={filters.tipoFalta}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/4">
                <div className="flex items-center justify-between">
                  <span className='font-extrabold'>Descripción</span>
                  <input
                    type="text"
                    placeholder="Filtrar por descripción"
                    className="input input-bordered input-sm w-35 ml-2"
                    name="descripcion"
                    value={filters.descripcion}
                    onChange={handleFilterChange}
                  />
                </div>
              </th>
              <th className="w-1/4">
                <div className="flex items-center justify-between">
                  <span className='font-extrabold'>Fecha</span>
                  <input
                    type="text"
                    placeholder="Filtrar por fecha"
                    className="input input-bordered input-sm w-35 ml-2"
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
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{item.tipoFalta}</td>
                  <td>
                    <div className=" whitespace-nowrap max-w-xs">
                      <div className="overflow-x-auto">{item.descripcion}</div>
                    </div>
                  </td>
                  <td>{item.fecha}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
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

import React from 'react';

const TableHeader: React.FC<{
  filters: Record<string, string>;
  keyMapping: Record<string, string>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChangeComplete?: () => void; // Prop opcional para acciones adicionales
}> = ({ filters, keyMapping, onFilterChange, onFilterChangeComplete }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e); // Actualizar los filtros
    if (onFilterChangeComplete) {
      onFilterChangeComplete(); // Ejecutar lógica adicional si es necesario
    }
  };

  return (
    <thead className="sticky top-0 bg-base-300">
      <tr>
        {Object.keys(keyMapping).map((header) => (
          <th key={header}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base">{header}</span>
              <input
                type="text"
                placeholder={`Filtrar por ${header}`}
                className="input input-bordered input-sm ml-2"
                name={keyMapping[header]}
                value={filters[keyMapping[header]] || ''}
                onChange={handleChange}
              />
            </div>
          </th>
        ))}
        <th className="w-1/5">
        <span className="font-extrabold text-base">Acciones</span>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;

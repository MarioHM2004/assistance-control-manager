import React from 'react';

interface TableHeaderProps {
  filters: Record<string, string>;
  keyMapping: Record<string, string>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  filters,
  keyMapping,
  onFilterChange,
}) => (
  <thead className="sticky top-0 bg-base-300">
    <tr>
      {Object.keys(keyMapping).map((header) => (
        <th key={header} className="w-1/5">
          <div className="flex flex-col items-start">
            <span className="font-extrabold text-base">{header}</span>
            <input
              type="text"
              name={header}
              placeholder={`Filtrar por ${header}`}
              className="input input-bordered input-sm mt-1"
              value={filters[header] || ''}
              onChange={onFilterChange}
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

export default TableHeader;

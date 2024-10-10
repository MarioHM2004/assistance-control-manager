import React, { useState, useEffect } from 'react';

interface Option {
  id: number;
  name: string;
}

export const AbsenceForm: React.FC = () => {
  const [names, setNames] = useState<Option[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    tipoFalta: '',
    descripcion: '',
    horasFaltadas: 0.5,
    fecha: '',
  });

  // Simulación de fetch para obtener datos de la API
  useEffect(() => {
    // Suponiendo que se hace un fetch a la API para obtener los nombres y tipos de faltas
    setNames([
      { id: 1, name: 'Malcolm' },
      { id: 2, name: 'Frida' },
      { id: 3, name: 'Jonathan' },
    ]);

    setAbsenceTypes([
      { id: 1, name: 'Retraso' },
      { id: 2, name: 'Falta' },
    ]);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // Aquí iría la lógica para enviar los datos a la API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
    <div className="container mx-auto pt-8 xl:pr-20 xl:pl-20 sm:pl-2 pb-8 max-w-2xl bg-base-200 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Registrar Falta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nombre</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="Escribe un nombre"
            required
          />
          {formData.nombre && (
            <ul className="bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto mt-2">
              {names
                .filter((name) =>
                  name.name.toLowerCase().includes(formData.nombre.toLowerCase())
                )
                .map((filteredName) => (
                  <li
                    key={filteredName.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      setFormData((prevData) => ({
                        ...prevData,
                        nombre: filteredName.name,
                      }))
                    }
                  >
                    {filteredName.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Tipo de Falta */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tipo de Falta</span>
          </label>
          <select
            name="tipoFalta"
            value={formData.tipoFalta}
            onChange={handleInputChange}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>Selecciona el tipo de falta</option>
            {absenceTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción de la falta */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Descripción de la falta</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            className="textarea textarea-bordered w-full"
            placeholder="Ingresa una descripción"
            required
          ></textarea>
        </div>

        {/* Horas faltadas */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Horas faltadas</span>
          </label>
          <select
            name="horasFaltadas"
            value={formData.horasFaltadas}
            onChange={handleInputChange}
            className="select select-bordered w-full"
            required
          >
            {[...Array(16)].map((_, i) => {
              const hours = (i + 1) * 0.5;
              return (
                <option key={hours} value={hours}>
                  {hours} horas
                </option>
              );
            })}
          </select>
        </div>

        {/* Fecha */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Fecha</span>
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Botón de añadir */}
        <button type="submit" className="btn btn-primary w-full">
          Añadir Falta
        </button>
      </form>
    </div>
  </div>
  );
};

export default AbsenceForm;

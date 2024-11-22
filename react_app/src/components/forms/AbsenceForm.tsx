import React, { useState, useEffect } from 'react';
import { AbsenceType, Employees } from '../models/types';
import { useNavigate } from 'react-router-dom';

export const AbsenceForm: React.FC = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState<Employees[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    absenceType: '',
    description: '',
    hoursAbsent: 0.5,
    date: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const namesResponse = await window.electron.ipcRenderer.invoke(
          'get-employees'
        );
        const typesResponse = await window.electron.ipcRenderer.invoke(
          'get-absence-types'
        );
        setNames(namesResponse);
        setAbsenceTypes(typesResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedAbsenceType = absenceTypes.find(
      (type) => type.TYPE === formData.absenceType
    );

    if (!selectedAbsenceType) {
      console.error('Tipo de falta no seleccionado correctamente');
      return;
    }

    try {
      const absenceData = {
        ...formData,
        employeeId: names.find((name) => name.NAME === formData.name)
          ?.EMPLOYEE_ID,
        absenceTypeId: selectedAbsenceType.ABSENCE_TYPE_ID,
      };

      await window.electron.ipcRenderer.invoke('create-absence', absenceData);
      console.log('Form Data Submitted:', absenceData);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const filteredNames = names.filter(
    (name) =>
      name.NAME && name.NAME.toLowerCase().includes(formData.name.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="container mx-auto pt-8 xl:pr-20 xl:pl-20 sm:pl-2 pb-8 max-w-2xl bg-base-200 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Registrar Falta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Empleado</span>
            </label>
            <input
              type="text"
              name="name"
              value={
                names.find((n) => n.NAME === formData.name)?.NAME ||
                formData.name
              }
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Escribe un nombre"
              required
            />
            {formData.name && (
              <ul className="bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto mt-2">
                {filteredNames.map((filteredName) => (
                  <li
                    key={filteredName.EMPLOYEE_ID}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      setFormData((prevData) => ({
                        ...prevData,
                        name: filteredName.NAME,
                      }))
                    }
                  >
                    {filteredName.NAME}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Tipo de Falta</span>
            </label>
            <select
              name="absenceType"
              value={formData.absenceType}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
                Selecciona el tipo de falta
              </option>
              {absenceTypes.map((type) => (
                <option key={type.ABSENCE_TYPE_ID} value={type.TYPE}>
                  {type.TYPE}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción de la falta</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full"
              placeholder="Ingresa una descripción"
              required
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Horas faltadas</span>
            </label>
            <select
              name="hoursAbsent"
              value={formData.hoursAbsent}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              {[...Array(16)].map((_, i) => {
                const hoursAbsent = (i + 1) * 0.5;
                return (
                  <option key={hoursAbsent} value={hoursAbsent}>
                    {hoursAbsent} horas
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Fecha</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Añadir Falta
          </button>
        </form>
      </div>
    </div>
  );
};

export default AbsenceForm;

import React, { useState, useEffect } from 'react';
import { AbsenceType, Employees } from '../models/types';
import { useNavigate } from 'react-router-dom';

// AbsenceForm component allows users to register an absence for an employee.
export const AbsenceForm: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [names, setNames] = useState<Employees[]>([]); // Stores list of employees
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]); // Stores list of absence types
  const [formData, setFormData] = useState({
    name: '', // Selected employee name
    absenceType: '', // Selected absence type
    description: '', // Description of the absence
    hoursAbsent: 0.5, // Number of hours absent
    date: '', // Date of the absence
  });

  // Fetch employee names and absence types from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees list
        const namesResponse = await window.electron.ipcRenderer.invoke(
          'get-employees'
        );
        // Fetch absence types list
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

  // Handles changes in form inputs and updates state
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Dynamically update formData field
    });
  };

  // Submits the form data to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submission

    // Find the selected employee and absence type from the lists
    const selectedEmployee = names.find((name) => name.NAME === formData.name);
    const selectedAbsenceType = absenceTypes.find(
      (type) => type.TYPE === formData.absenceType
    );

    // Validate if selected employee exists
    if (!selectedEmployee) {
      console.error('Empleado no encontrado');
      alert('Selecciona un empleado válido');
      return;
    }

    // Validate if selected absence type exists
    if (!selectedAbsenceType) {
      console.error('Tipo de falta no encontrado');
      alert('Selecciona un tipo de falta válido');
      return;
    }

    // Formats the date input into YYYY-MM-DD
    const formatDate = (date: string): string | null => {
      return date ? new Date(date).toISOString().split('T')[0] : null;
    };

    // Constructs the final absence data to be sent to backend
    const absenceData = {
      ...formData,
      employeeId: selectedEmployee?.EMPLOYEE_ID || null,
      absenceTypeId: selectedAbsenceType?.ABSENCE_TYPE_ID || null,
      date: formatDate(formData.date),
      hoursAbsent: parseFloat(formData.hoursAbsent.toString()),
    };

    console.log('Datos enviados:', absenceData);

    // Ensure all required parameters are present
    if (!absenceData.employeeId || !absenceData.absenceTypeId) {
      console.error('Faltan parámetros requeridos');
      alert('Completa todos los campos requeridos');
      return;
    }

    try {
      // Send absence data to backend
      await window.electron.ipcRenderer.invoke('create-absence', absenceData);
      navigate('/dashboard'); // Navigate to dashboard on success
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Filters employee names based on user input in the form
  const filteredNames = names.filter(
    (name) =>
      name.NAME && name.NAME.toLowerCase().includes(formData.name.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="container mx-auto pt-8 xl:pr-20 xl:pl-20 sm:pl-2 pb-8 max-w-2xl bg-base-200 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Registrar Falta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee selection input with autocomplete */}
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
            {/* Autocomplete suggestions */}
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

          {/* Absence type dropdown */}
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

          {/* Absence description */}
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

          {/* Hours absent dropdown */}
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

          {/* Absence date picker */}
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

          {/* Submit button */}
          <button type="submit" className="btn btn-primary w-full">
            Añadir Falta
          </button>
        </form>
      </div>
    </div>
  );
};

export default AbsenceForm;

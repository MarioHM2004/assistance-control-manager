const { ipcMain } = require('electron');

function handleGetAbsences(db) {
  ipcMain.handle('get-absences', (event) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const query = `
        SELECT
          Employees.NAME as nombre,
          AbsenceTypes.TYPE as tipoFalta,
          Absences.DESCRIPTION as descripcion,
          Absences.HOURS_ABSENT as horas,
          Absences.ABSENCE_DATE as fecha,
          Employees.STATUS_ID as estadoEmpleado
        FROM Absences
        JOIN Employees ON Absences.EMPLOYEE_ID = Employees.EMPLOYEE_ID
        JOIN AbsenceTypes ON Absences.ABSENCE_TYPE_ID = AbsenceTypes.ABSENCE_TYPE_ID
        ORDER BY Absences.ABSENCE_DATE DESC
      `;
      const stmt = db.prepare(query);
      const absences = stmt.all();
      return absences;
    } catch (error) {
      console.error('Error getting absences:', error.message);
      throw error;
    }
  });
}


function handleCreateAbsence(db) {
  ipcMain.handle('create-absence', (event, absence) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO Absences (ABSENCE_ID, ABSENCE_TYPE_ID, DESCRIPTION, HOURS_ABSENT, ABSENCE_DATE) VALUES (@absence_id, @absence_type_id, @description, @hours_absent, @absence_date)'
      );
      const result = stmt.run(
        absence.absence_id,
        absence.absence_type_id,
        absence.description,
        absence.hours_absent,
        absence.absence_date
      );
      return result;
    } catch (error) {
      console.error('Error creating absence:', error.message);
      throw error;
    }
  });
}

function handleEditAbsence(db) {
  ipcMain.handle('edit-absence', (event, absence) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare(
        'UPDATE Absences SET ABSENCE_TYPE_ID = @absence_type_id, DESCRIPTION = @description, HOURS_ABSENT = @hours_absent, ABSENCE_DATE = @absence_date WHERE ABSENCE_ID = @absence_id'
      );
      const result = stmt.run(
        absence.absence_type_id,
        absence.description,
        absence.hours_absent,
        absence.absence_date,
        absence.absence_id
      );
      return result;
    } catch (error) {
      console.error('Error editing absence:', error.message);
      throw error;
    }
  });
}

function handleDeleteAbsence(db) {
  ipcMain.handle('delete-absence', (event, id) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare('DELETE FROM Absences WHERE ABSENCE_ID = @id');
      const result = stmt.run(id);
      return result;
    } catch (error) {
      console.error('Error deleting absence:', error.message);
      throw error;
    }
  });
}

function handleAbsences(db) {
  handleGetAbsences(db);
  handleCreateAbsence(db);
  handleEditAbsence(db);
  handleDeleteAbsence(db);
}

module.exports = { handleAbsences };

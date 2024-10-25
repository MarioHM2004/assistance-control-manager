const { ipcMain } = require('electron');

function handleGetAbsences(db) {
  ipcMain.handle('get-absences', (event) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const query = `
        SELECT
          Employees.NAME as name,
          AbsenceTypes.TYPE as absenceType,
          Absences.DESCRIPTION as description,
          Absences.HOURS_ABSENT as hoursAbsent,
          Absences.ABSENCE_DATE as date,
          Employees.STATUS_ID as employeeStatus
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
        `INSERT INTO Absences (EMPLOYEE_ID, ABSENCE_TYPE_ID, DESCRIPTION, HOURS_ABSENT, ABSENCE_DATE, STATUS_ID)
        VALUES (?, ?, ?, ?, ?, ?)`
      );
      const result = stmt.run(
        absence.employeeId,
        absence.absenceTypeId,
        absence.description,
        absence.hoursAbsent,
        absence.date,
        absence.statusId
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

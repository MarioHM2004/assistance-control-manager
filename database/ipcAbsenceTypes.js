const { ipcMain } = require('electron');

function handleGetAbsenceTypes(db) {
  ipcMain.handle('get-absence-types', (event) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare('SELECT * FROM AbsenceTypes');
      const absenceTypes = stmt.all();
      return absenceTypes;
    } catch (error) {
      console.error('Error getting absence types:', error.message);
      throw error;
    }
  });
}

function handleAddAbsenceType(db) {
  ipcMain.handle('add-absence-type', (event, absenceType) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare('INSERT INTO AbsenceTypes (TYPE) VALUES (?)');
      const result = stmt.run( absenceType.type );
      return result.changes > 0 ? 1 : 0;
    } catch (error) {
      console.error('Error adding absence type:', error.message);
      throw error;
    }
  });
}

function handleDeleteAbsenceType(db) {
  ipcMain.handle('delete-absence-type', (event, absenceType) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      // Check if there are related records in Absences
      const checkStmt = db.prepare('SELECT COUNT(*) AS count FROM Absences WHERE ABSENCE_TYPE_ID = ?');
      const { count } = checkStmt.get(absenceType.absenceTypeId);

      if (count > 0) {
        throw new Error('Cannot delete: this absence type has related absences.');
      }

      // Delete from AbsenceTypes if there are no related records
      const stmt = db.prepare('DELETE FROM AbsenceTypes WHERE ABSENCE_TYPE_ID = ?');
      const result = stmt.run(absenceType.absenceTypeId);

      return result.changes > 0 ? 1 : 0;
    } catch (error) {
      console.error('Error deleting absence type:', error.message);
      throw error;
    }
  });
}



function handleAbsenceTypes(db) {
  handleGetAbsenceTypes(db);
  handleAddAbsenceType(db);
  handleDeleteAbsenceType(db);
}

module.exports = { handleAbsenceTypes };

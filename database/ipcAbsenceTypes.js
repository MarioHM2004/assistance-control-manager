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

module.exports = { handleGetAbsenceTypes };

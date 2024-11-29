const { ipcMain } = require('electron');
const cache = require('./cache'); // Import the generic cache utility

function handleGetAbsenceTypes(db) {
  ipcMain.handle('get-absence-types', (event) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Check the cache for existing data
    const cachedAbsenceTypes = cache.get('absenceTypes');
    if (cachedAbsenceTypes) {
      return cachedAbsenceTypes;
    }

    try {
      const stmt = db.prepare('SELECT * FROM AbsenceTypes');
      const absenceTypes = stmt.all();

      // Store the result in the cache
      cache.set('absenceTypes', absenceTypes);

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

    if (!absenceType || !absenceType.type) {
      throw new Error('Missing required field: type');
    }

    try {
      const stmt = db.prepare('INSERT INTO AbsenceTypes (TYPE) VALUES (?)');
      const result = stmt.run(absenceType.type);

      db.exec("PRAGMA foreign_keys = ON;");

      // Invalidate the cache after adding a new absence type
      cache.invalidate('absenceTypes');

      return result.lastInsertRowid;
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
      const checkStmt = db.prepare('SELECT COUNT(*) AS count FROM Absences WHERE ABSENCE_TYPE_ID = ?');
      const { count } = checkStmt.get(absenceType.absenceTypeId);

      if (count > 0) {
        throw new Error('Cannot delete: this absence type has related absences.');
      }

      const stmt = db.prepare('DELETE FROM AbsenceTypes WHERE ABSENCE_TYPE_ID = ?');
      const result = stmt.run(absenceType.absenceTypeId);

      // Invalidate the cache after deleting an absence type
      cache.invalidate('absenceTypes');

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

const { ipcMain } = require("electron");
const cache = require("./cache");

function handleGetAbsenceTypes(dbConnection) {
  ipcMain.handle("get-absence-types", async (event) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    const cachedAbsenceTypes = cache.get("absenceTypes");
    if (cachedAbsenceTypes) {
      return cachedAbsenceTypes;
    }

    try {
      const [absenceTypes] = await dbConnection.execute("SELECT * FROM AbsenceTypes");

      cache.set("absenceTypes", absenceTypes);

      return absenceTypes;
    } catch (error) {
      console.error("Error getting absence types:", error.message);
      throw error;
    }
  });
}

function handleAddAbsenceType(dbConnection) {
  ipcMain.handle("add-absence-type", async (event, absenceType) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    if (!absenceType || !absenceType.type) {
      throw new Error("Missing required field: type");
    }

    try {
      const [result] = await dbConnection.execute(
        "INSERT INTO AbsenceTypes (TYPE) VALUES (?)",
        [absenceType.type]
      );

      cache.invalidate("absenceTypes");

      return result.insertId;
    } catch (error) {
      console.error("Error adding absence type:", error.message);
      throw error;
    }
  });
}

function handleDeleteAbsenceType(dbConnection) {
  ipcMain.handle("delete-absence-type", async (event, absenceType) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    if (!absenceType || !absenceType.absenceTypeId) {
      throw new Error("Missing required field: absenceTypeId");
    }

    try {
      const [relatedAbsences] = await dbConnection.execute(
        "SELECT COUNT(*) AS count FROM Absences WHERE ABSENCE_TYPE_ID = ?",
        [absenceType.absenceTypeId]
      );

      if (relatedAbsences[0].count > 0) {
        throw new Error(
          "Cannot delete: this absence type has related absences."
        );
      }

      const [result] = await dbConnection.execute(
        "DELETE FROM AbsenceTypes WHERE ABSENCE_TYPE_ID = ?",
        [absenceType.absenceTypeId]
      );

      cache.invalidate("absenceTypes");

      return result.affectedRows > 0 ? 1 : 0;
    } catch (error) {
      console.error("Error deleting absence type:", error.message);
      throw error;
    }
  });
}

function handleAbsenceTypes(dbConnection) {
  handleGetAbsenceTypes(dbConnection);
  handleAddAbsenceType(dbConnection);
  handleDeleteAbsenceType(dbConnection);
}

module.exports = { handleAbsenceTypes };

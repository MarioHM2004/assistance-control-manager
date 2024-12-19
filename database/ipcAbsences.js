const { ipcMain } = require("electron");
const cache = require("./cache");

function handleGetAbsences(dbConnection) {
  ipcMain.handle("get-absences", async (event, { page, limit, filters }) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    const validPage = Number.isInteger(Number(page)) && page > 0 ? parseInt(page, 10) : 1;
    const validLimit = Number.isInteger(Number(limit)) && limit > 0 ? parseInt(limit, 10) : 10;
    const offset = (validPage - 1) * validLimit;

    const whereClauses = [];
    const queryParams = [];

    if (filters) {
      if (filters.Nombre) {
        whereClauses.push("Employees.NAME LIKE ?");
        queryParams.push(`%${filters.Nombre}%`);
      }
      if (filters["Tipo de Falta"]) {
        whereClauses.push("AbsenceTypes.TYPE LIKE ?");
        queryParams.push(`%${filters["Tipo de Falta"]}%`);
      }
      if (filters.Descripción) {
        whereClauses.push("Absences.DESCRIPTION LIKE ?");
        queryParams.push(`%${filters.Descripción}%`);
      }
      if (filters["Horas faltadas"]) {
        whereClauses.push("Absences.HOURS_ABSENT = ?");
        queryParams.push(filters["Horas faltadas"]);
      }
      if (filters.Fecha) {
        whereClauses.push("DATE_FORMAT(Absences.ABSENCE_DATE, '%Y-%m-%d') LIKE ?");
        queryParams.push(`${filters.Fecha}%`);
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    try {
      const query = `
        SELECT
          Absences.ABSENCE_ID AS absenceId,
          Employees.NAME AS employeeName,
          AbsenceTypes.TYPE AS absenceType,
          Absences.DESCRIPTION AS description,
          Absences.HOURS_ABSENT AS hoursAbsent,
          DATE_FORMAT(Absences.ABSENCE_DATE, '%Y-%m-%d') AS date
        FROM Absences
        JOIN Employees ON Absences.EMPLOYEE_ID = Employees.EMPLOYEE_ID
        JOIN AbsenceTypes ON Absences.ABSENCE_TYPE_ID = AbsenceTypes.ABSENCE_TYPE_ID
        ${whereClause}
        ORDER BY Absences.ABSENCE_DATE DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(validLimit, offset);

      const [absences] = await dbConnection.query(query, queryParams);

      const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM Absences
        JOIN Employees ON Absences.EMPLOYEE_ID = Employees.EMPLOYEE_ID
        JOIN AbsenceTypes ON Absences.ABSENCE_TYPE_ID = AbsenceTypes.ABSENCE_TYPE_ID
        ${whereClause}
      `;

      const [[{ totalCount }]] = await dbConnection.query(countQuery, queryParams.slice(0, -2));

      return { absences, totalCount };
    } catch (error) {
      console.error("Error getting absences:", error.message);
      throw error;
    }
  });
}

function handleGetAllAbsences(dbConnection) {
  ipcMain.handle('export-all-absences', async (event, filters) => {
    if (!dbConnection) {
      throw new Error('Database not initialized');
    }

    try {
      const filterConditions = [];
      const params = [];

      if (filters.Nombre) {
        filterConditions.push('Employees.NAME LIKE ?');
        params.push(`%${filters.Nombre}%`);
      }
      if (filters['Tipo de Falta']) {
        filterConditions.push('AbsenceTypes.TYPE LIKE ?');
        params.push(`%${filters['Tipo de Falta']}%`);
      }
      if (filters.Descripción) {
        filterConditions.push('Absences.DESCRIPTION LIKE ?');
        params.push(`%${filters.Descripción}%`);
      }
      if (filters['Horas faltadas']) {
        filterConditions.push('Absences.HOURS_ABSENT = ?');
        params.push(filters['Horas faltadas']);
      }
      if (filters.Fecha) {
        filterConditions.push('DATE_FORMAT(Absences.ABSENCE_DATE, "%Y-%m-%d") LIKE ?');
        params.push(`${filters.Fecha}%`);
      }

      const whereClause =
        filterConditions.length > 0
          ? `WHERE ${filterConditions.join(' AND ')}`
          : '';

      const query = `
        SELECT
          Absences.ABSENCE_ID as absenceId,
          Employees.NAME as name,
          AbsenceTypes.TYPE as absenceType,
          Absences.DESCRIPTION as description,
          Absences.HOURS_ABSENT as hoursAbsent,
          DATE_FORMAT(Absences.ABSENCE_DATE, '%Y-%m-%d') AS date
        FROM Absences
        JOIN Employees ON Absences.EMPLOYEE_ID = Employees.EMPLOYEE_ID
        JOIN AbsenceTypes ON Absences.ABSENCE_TYPE_ID = AbsenceTypes.ABSENCE_TYPE_ID
        ${whereClause}
        ORDER BY Absences.ABSENCE_DATE DESC
      `;

      const [results] = await dbConnection.execute(query, params);
      console.log('Exported absences:', results.length);

      return results;
    } catch (error) {
      console.error('Error exporting absences:', error.message);
      throw error;
    }
  });
}

function handleCreateAbsence(dbConnection) {
  ipcMain.handle("create-absence", async (event, absence) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    try {
      const query = `
        INSERT INTO Absences (EMPLOYEE_ID, ABSENCE_TYPE_ID, DESCRIPTION, HOURS_ABSENT, ABSENCE_DATE, STATUS_ID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const statusId = absence.statusId || 1;
      const [result] = await dbConnection.execute(query, [
        absence.employeeId,
        absence.absenceTypeId,
        absence.description,
        absence.hoursAbsent,
        absence.date,
        statusId,
      ]);

      cache.invalidate("absences");
      cache.invalidatePrefix("employee-ranking-"); // Invalidar ranking de empleados
      console.log("[CACHE] Invalidated 'absences' and 'employee-ranking'");
      return result.insertId;
    } catch (error) {
      console.error("Error creating absence:", error.message);
      throw error;
    }
  });
}

function handleEditAbsence(dbConnection) {
  ipcMain.handle("edit-absence", async (event, absence) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    try {
      const query = `
        UPDATE Absences
        SET ABSENCE_TYPE_ID = ?, DESCRIPTION = ?, HOURS_ABSENT = ?, ABSENCE_DATE = ?
        WHERE ABSENCE_ID = ?
      `;
      const [result] = await dbConnection.execute(query, [
        absence.absenceTypeId,
        absence.description,
        absence.hoursAbsent,
        absence.date,
        absence.absenceId,
      ]);

      cache.invalidate("absences");
      cache.invalidatePrefix("employee-ranking-"); // Invalidar ranking de empleados
      console.log("[CACHE] Invalidated 'absences' and 'employee-ranking'");
      return result.affectedRows > 0 ? 1 : 0;
    } catch (error) {
      console.error("Error editing absence:", error.message);
      throw error;
    }
  });
}

function handleDeleteAbsence(dbConnection) {
  ipcMain.handle("delete-absence", async (event, id) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    try {
      const query = "DELETE FROM Absences WHERE ABSENCE_ID = ?";
      const [result] = await dbConnection.execute(query, [id]);

      cache.invalidate("absences");
      cache.invalidatePrefix("employee-ranking-"); // Invalidar ranking de empleados
      console.log("[CACHE] Invalidated 'absences' and 'employee-ranking's");
      return result.affectedRows > 0 ? 1 : 0;
    } catch (error) {
      console.error("Error deleting absence:", error.message);
      throw error;
    }
  });
}

function handleAbsences(dbConnection) {
  handleGetAbsences(dbConnection);
  handleGetAllAbsences(dbConnection);
  handleCreateAbsence(dbConnection);
  handleEditAbsence(dbConnection);
  handleDeleteAbsence(dbConnection);
}

module.exports = { handleAbsences };

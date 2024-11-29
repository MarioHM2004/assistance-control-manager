const { ipcMain } = require('electron');
const cache = require('./cache'); // Import the generic cache utility

function handleGetEmployees(db) {
  ipcMain.handle("get-employees", (event) => {
    if (!db) {
      throw new Error("Database not initialized");
    }
    // Check if the data is already cached
    const cachedEmployees = cache.get("employees");
    if (cachedEmployees) {
      return cachedEmployees;
    }

    try {
      const stmt = db.prepare("SELECT * FROM Employees");
      const employees = stmt.all();

      // Cache the query result
      cache.set("employees", employees);

      return employees;
    } catch (error) {
      console.error("Error getting employees:", error.message);
      throw error;
    }
  });
}

function handleAddEmployees(db) {
  ipcMain.handle("add-employees", (event, employee) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    if (!employee || !employee.name || !employee.status_id) {
      throw new Error("Missing required fields: name or status_id");
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO Employees (NAME, STATUS_ID) VALUES (@name, @status_id)"
      );
      const result = stmt.run({
        name: employee.name,
        status_id: employee.status_id,
      });

      db.exec("PRAGMA foreign_keys = ON;");

      // Invalidate the cache after adding a new employee
      cache.invalidate("employees");

      return result.lastInsertRowid;
    } catch (error) {
      console.error("Error adding employee:", error.message);
      throw error;
    }
  });
}

function handleEditEmployees(db) {
  ipcMain.handle("edit-employees", async (event, employee) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    if (!employee || !employee.id || !employee.name || !employee.status_id) {
      throw new Error("Missing required fields: id, name, or status_id");
    }

    try {
      const checkStmt = db.prepare("SELECT 1 FROM Employees WHERE EMPLOYEE_ID = @id");
      const exists = checkStmt.get({ id: employee.id });

      if (!exists) {
        throw new Error("No employee found with the given ID.");
      }

      const stmt = db.prepare(
        "UPDATE Employees SET NAME = @name, STATUS_ID = @status_id WHERE EMPLOYEE_ID = @id"
      );
      const result = stmt.run({
        id: employee.id,
        name: employee.name,
        status_id: employee.status_id,
      });

      if (result.changes === 0) {
        throw new Error("No changes were made to the employee.");
      }

      // Invalidate the cache after editing an employee
      cache.invalidate("employees");

      return result.changes;
    } catch (error) {
      console.error("Error editing employee:", error.message);
      throw error;
    }
  });
}

function handleDeleteEmployees(db) {
  ipcMain.handle("delete-employees", async (event, id) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    try {
      const checkStmt = db.prepare("SELECT 1 FROM Employees WHERE EMPLOYEE_ID = @id");
      const exists = checkStmt.get({ id });

      if (!exists) {
        throw new Error("No employee found with the given ID.");
      }

      const stmt = db.prepare("DELETE FROM Employees WHERE EMPLOYEE_ID = @id");
      const result = stmt.run({ id });

      if (result.changes === 0) {
        throw new Error("Failed to delete the employee.");
      }

      // Invalidate the cache after deleting an employee
      cache.invalidate("employees");

      return result.changes;
    } catch (error) {
      console.error("Error deleting employee:", error.message);
      throw error;
    }
  });
}

function handleEmployees(db) {
  handleGetEmployees(db);
  handleAddEmployees(db);
  handleEditEmployees(db);
  handleDeleteEmployees(db);
}

module.exports = { handleEmployees };

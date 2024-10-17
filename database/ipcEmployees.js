const { ipcMain } = require('electron');

function handleGetEmployees(db) {
  ipcMain.handle("get-employees", (event) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    try {
      const stmt = db.prepare("SELECT * FROM Employees");
      const employees = stmt.all();
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
      const result = stmt.run({ name: employee.name, status_id: employee.status_id });
      return result.changes;
    } catch (error) {
      console.error("Error adding employee:", error.message);
      throw error;
    }
  });
}

function handleEditEmployees(db) {
  ipcMain.handle("edit-employees", (event, employee) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    if (!employee || !employee.id || !employee.name || !employee.status_id) {
      throw new Error("Missing required fields: id, name or status_id");
    }

    try {
      const stmt = db.prepare(
        "UPDATE Employees SET NAME = @name, STATUS_ID = @status_id WHERE EMPLOYEE_ID = @id"
      );
      const result = stmt.run({ id: employee.id, name: employee.name, status_id: employee.status_id });
      return result.changes;
    } catch (error) {
      console.error("Error editing employee:", error.message);
      throw error;
    }
  });
}

function handleDeleteEmployees(db) {
  ipcMain.handle("delete-employees", (event, id) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    try {
      const stmt = db.prepare("DELETE FROM Employees WHERE EMPLOYEE_ID = @id");
      const result = stmt.run({ id });
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

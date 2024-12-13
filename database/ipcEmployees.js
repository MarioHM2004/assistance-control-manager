const { ipcMain } = require("electron");
const cache = require("./cache");

function handleGetEmployees(dbConnection) {
  ipcMain.handle("get-employees", async (event) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    const cachedEmployees = cache.get("employees");
    if (cachedEmployees) {
      return cachedEmployees;
    }

    try {
      const [employees] = await dbConnection.execute("SELECT * FROM Employees");

      cache.set("employees", employees);

      return employees;
    } catch (error) {
      console.error("Error getting employees:", error.message);
      throw error;
    }
  });
}

function handleAddEmployees(dbConnection) {
  ipcMain.handle("add-employees", async (event, employee) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    if (!employee || !employee.name || !employee.status_id) {
      throw new Error("Missing required fields: name or status_id");
    }

    try {
      const [result] = await dbConnection.execute(
        "INSERT INTO Employees (NAME, STATUS_ID) VALUES (?, ?)",
        [employee.name, employee.status_id]
      );

      cache.invalidate("employees");

      return result.insertId;
    } catch (error) {
      console.error("Error adding employee:", error.message);
      throw error;
    }
  });
}

function handleEditEmployees(dbConnection) {
  ipcMain.handle("edit-employees", async (event, employee) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    if (!employee || !employee.id || !employee.name || !employee.status_id) {
      throw new Error("Missing required fields: id, name, or status_id");
    }

    try {
      const [exists] = await dbConnection.execute(
        "SELECT 1 FROM Employees WHERE EMPLOYEE_ID = ?",
        [employee.id]
      );

      if (exists.length === 0) {
        throw new Error("No employee found with the given ID.");
      }

      const [result] = await dbConnection.execute(
        "UPDATE Employees SET NAME = ?, STATUS_ID = ? WHERE EMPLOYEE_ID = ?",
        [employee.name, employee.status_id, employee.id]
      );

      if (result.affectedRows === 0) {
        throw new Error("No changes were made to the employee.");
      }

      cache.invalidate("employees");

      return result.affectedRows;
    } catch (error) {
      console.error("Error editing employee:", error.message);
      throw error;
    }
  });
}

function handleDeleteEmployees(dbConnection) {
  ipcMain.handle("delete-employees", async (event, id) => {
    if (!dbConnection) {
      throw new Error("Database not initialized");
    }

    try {
      const [exists] = await dbConnection.execute(
        "SELECT 1 FROM Employees WHERE EMPLOYEE_ID = ?",
        [id]
      );

      if (exists.length === 0) {
        throw new Error("No employee found with the given ID.");
      }

      const [result] = await dbConnection.execute(
        "DELETE FROM Employees WHERE EMPLOYEE_ID = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Failed to delete the employee.");
      }

      cache.invalidate("employees");

      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting employee:", error.message);
      throw error;
    }
  });
}

function handleEmployees(dbConnection) {
  handleGetEmployees(dbConnection);
  handleAddEmployees(dbConnection);
  handleEditEmployees(dbConnection);
  handleDeleteEmployees(dbConnection);
}

module.exports = { handleEmployees };

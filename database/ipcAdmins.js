const { ipcMain } = require('electron');
const bcrypt = require('bcrypt');

function handleLoginAdmin(db) {
  ipcMain.handle('login-admin', async (event, { username, password }) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare('SELECT * FROM Admins WHERE username = ?');
      const admin = stmt.get(username);

      if (!admin) {
        return { success: false, message: 'Admin not found' };
      }
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password' };
      }
      return { success: true, message: 'Login successful', adminId: admin.id };
    } catch (error) {
      throw error;
    }
  });
}

module.exports = { handleLoginAdmin };

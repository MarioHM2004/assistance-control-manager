const { ipcMain } = require('electron');
const bcrypt = require('bcrypt');
const cache = require('./cache'); // Import the generic cache utility

function handleLoginAdmin(db) {
  ipcMain.handle('login-admin', async (event, { username, password }) => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      // Check if admin data is cached
      const cacheKey = `admin-${username}`;
      let admin = cache.get(cacheKey);

      if (!admin) {
        // Fetch admin from the database if not in cache
        const stmt = db.prepare('SELECT * FROM Admins WHERE username = ?');
        admin = stmt.get(username);

        if (!admin) {
          return { success: false, message: 'Admin not found' };
        }

        // Cache the admin data
        cache.set(cacheKey, admin);
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password' };
      }

      return { success: true, message: 'Login successful', adminId: admin.id };
    } catch (error) {
      console.error('Error during admin login:', error.message);
      throw error;
    }
  });
}

module.exports = { handleLoginAdmin };

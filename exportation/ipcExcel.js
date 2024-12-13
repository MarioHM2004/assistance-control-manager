const { ipcMain, dialog, app } = require('electron');
const ExcelJS = require('exceljs');
const path = require('path');

function handleExportation() {
  ipcMain.handle('export-excel', async (event, data) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Guardar archivo Excel',
        defaultPath: path.join(app.getPath('documents'), 'Faltas_filtradas.xlsx'),
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
      });

      if (!filePath) {
        return;
      }

      const workbook = new ExcelJS.Workbook();

      // Main page with absence details
      const detailWorksheet = workbook.addWorksheet("Faltas");

      detailWorksheet.columns = [
        { header: 'Nombre', key: 'name', width: 25 },
        { header: 'Tipo de Falta', key: 'absenceType', width: 20 },
        { header: 'Descripción', key: 'description', width: 35 },
        { header: 'Horas Faltadas', key: 'hoursAbsent', width: 20 },
        { header: 'Fecha', key: 'date', width: 20 },
      ];

      detailWorksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7A3E2B' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      data.forEach(item => {
        detailWorksheet.addRow({
          name: item.name,
          absenceType: item.absenceType,
          description: item.description,
          hoursAbsent: item.hoursAbsent,
          date: item.date,
        });
      });

      // Create a sheet for each employee with the summary of hours
      const employees = data.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = [];
        }
        acc[item.name].push(item);
        return acc;
      }, {});

      Object.entries(employees).forEach(([employeeName, absences]) => {
        const employeeWorksheet = workbook.addWorksheet(employeeName.substring(0, 31)); // Limit to 31 characters

        employeeWorksheet.columns = [
          { header: 'Tipo de Falta', key: 'absenceType', width: 20 },
          { header: 'Horas Faltadas', key: 'hoursAbsent', width: 20 },
        ];

        employeeWorksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '7A3E2B' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Calculate total hours by type of absence
        const hoursByType = absences.reduce((acc, absence) => {
          if (!acc[absence.absenceType]) {
            acc[absence.absenceType] = 0;
          }
          acc[absence.absenceType] += absence.hoursAbsent || 0;
          return acc;
        }, {});

        Object.entries(hoursByType).forEach(([type, hours]) => {
          employeeWorksheet.addRow({ absenceType: type, hoursAbsent: hours });
        });

        // Add row with total hours absent
        const totalRow = employeeWorksheet.addRow({
          absenceType: 'Total',
          hoursAbsent: absences.reduce((total, a) => total + (a.hoursAbsent || 0), 0),
        });

        // Style the total row
        totalRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Bold and white text
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5733' }, // Orange background
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Center text
        });
      });

      await workbook.xlsx.writeFile(filePath);

      return filePath;
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw error;
    }
  });
}

module.exports = { handleExportation };

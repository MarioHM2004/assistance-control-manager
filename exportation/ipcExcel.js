
const { ipcMain, dialog, app } = require('electron');
const ExcelJS = require('exceljs');
const path = require('path');

function handleExportation() {
  ipcMain.handle('export-excel', async (event, data) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Guardar archivo Excel',
        defaultPath: path.join(app.getPath('documents'), 'Ausencias_Filtradas.xlsx'),
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
      });

      if (!filePath) {
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Ausencias");

      worksheet.columns = [
        { header: 'Nombre', key: 'name', width: 25 },
        { header: 'Tipo de Falta', key: 'absenceType', width: 20 },
        { header: 'Descripción', key: 'description', width: 35 },
        { header: 'Horas Faltadas', key: 'hoursAbsent', width: 20 },
        { header: 'Fecha', key: 'date', width: 20 },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7A3E2B' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      data.forEach(item => {
        worksheet.addRow({
          name: item.name,
          absenceType: item.absenceType,
          description: item.description,
          hoursAbsent: item.hoursAbsent,
          date: item.date,
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

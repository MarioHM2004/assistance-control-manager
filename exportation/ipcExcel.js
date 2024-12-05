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

      // Segunda hoja: Resumen de horas por empleado
      const summaryWorksheet = workbook.addWorksheet("Resumen de Horas");

      summaryWorksheet.columns = [
        { header: 'Nombre', key: 'name', width: 25 },
        { header: 'Horas Totales', key: 'totalHours', width: 20 },
      ];

      summaryWorksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7A3E2B' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      const totalHoursByEmployee = data.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = 0;
        }
        acc[item.name] += item.hoursAbsent || 0;
        return acc;
      }, {});

      Object.entries(totalHoursByEmployee).forEach(([name, totalHours]) => {
        summaryWorksheet.addRow({ name, totalHours });
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

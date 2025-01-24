const { ipcMain, dialog, app } = require('electron');
const ExcelJS = require('exceljs');
const path = require('path');

function handleExportation() {
  ipcMain.handle('export-excel', async (event, data) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Guardar archivo Excel',
        defaultPath: path.join(
          app.getPath('documents'),
          'Faltas_filtradas.xlsx'
        ),
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
      });

      if (!filePath) {
        return;
      }

      const workbook = new ExcelJS.Workbook();

      // Create a ranking page
      const rankingWorksheet = workbook.addWorksheet('Ranking');

      // Calculate total hours and absence counts per employee
      const employeeStats = data.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = { totalHours: 0, totalAbsences: 0 };
        }
        acc[item.name].totalHours += item.hoursAbsent || 0;
        acc[item.name].totalAbsences += 1;
        return acc;
      }, {});

      // Convert to array and sort by total hours in descending order
      const rankingData = Object.entries(employeeStats)
        .map(([name, stats]) => ({
          name,
          totalHours: stats.totalHours,
          totalAbsences: stats.totalAbsences,
        }))
        .sort((a, b) => b.totalHours - a.totalHours);

      // Define columns for the ranking worksheet
      rankingWorksheet.columns = [
        { header: 'Ranking', key: 'ranking', width: 10 },
        { header: 'Nombre', key: 'name', width: 35 },
        { header: 'Horas Faltadas', key: 'totalHours', width: 20 },
        { header: 'Total Faltas', key: 'totalAbsences', width: 15 },
      ];

      // Style header row
      rankingWorksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7A3E2B' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Add ranking data to the worksheet
      rankingData.forEach((employee, index) => {
        const row = rankingWorksheet.addRow({
          ranking: index + 1,
          name: employee.name,
          totalHours: employee.totalHours,
          totalAbsences: employee.totalAbsences,
        });

        // Align cells in the row
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });

      // Main page with absence details
      const detailWorksheet = workbook.addWorksheet('Faltas');

      detailWorksheet.columns = [
        { header: 'Nombre', key: 'name', width: 35 },
        { header: 'Tipo de Falta', key: 'absenceType', width: 30 },
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

      data.forEach((item) => {
        const row = detailWorksheet.addRow({
          name: item.name,
          absenceType: item.absenceType,
          description: item.description,
          hoursAbsent: item.hoursAbsent,
          date: item.date,
        });

        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
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
        const employeeWorksheet = workbook.addWorksheet(
          employeeName.substring(0, 31)
        );

        const summaryColumns = [
          { header: 'Tipo de Falta', key: 'absenceType', width: 30 },
          { header: 'Horas Faltadas', key: 'hoursAbsent', width: 20 },
        ];

        employeeWorksheet.columns = summaryColumns;

        employeeWorksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '7A3E2B' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const hoursByType = absences.reduce((acc, absence) => {
          if (!acc[absence.absenceType]) {
            acc[absence.absenceType] = 0;
          }
          acc[absence.absenceType] += absence.hoursAbsent || 0;
          return acc;
        }, {});

        let currentRow = 2;
        Object.entries(hoursByType).forEach(([type, hours]) => {
          const row = employeeWorksheet.addRow({
            absenceType: type,
            hoursAbsent: hours,
          });

          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          });
          currentRow++;
        });

        const totalRow = employeeWorksheet.addRow({
          absenceType: 'Total',
          hoursAbsent: absences.reduce(
            (total, a) => total + (a.hoursAbsent || 0),
            0
          ),
        });

        totalRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5733' },
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        currentRow += 2;

        const detailHeaders = ['Tipo de Falta', 'Descripción', 'Horas Faltadas', 'Fecha'];
        const detailWidths = [30, 40, 20, 20];
        detailHeaders.forEach((header, index) => {
          const cell = employeeWorksheet.getRow(currentRow).getCell(index + 1);
          cell.value = header;
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '7A3E2B' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          employeeWorksheet.getColumn(index + 1).width = detailWidths[index];
        });

        currentRow++;

        absences.forEach((absence) => {
          const row = employeeWorksheet.getRow(currentRow);
          row.getCell(1).value = absence.absenceType || 'Sin tipo';
          row.getCell(2).value = absence.description || 'Sin descripción';
          row.getCell(3).value = absence.hoursAbsent || 0;
          row.getCell(4).value = absence.date || 'Sin fecha';

          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          });

          currentRow++;
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

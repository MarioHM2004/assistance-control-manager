import { format } from 'date-fns';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error(`Invalid date value: ${dateString}`);
    return 'Fecha inválida';
  }

  return format(date, 'dd-MM-yyyy');
};

export const parseDate = (date: string): string => {
  const dateParts = date.split('-');

  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;

    if (!isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  console.error(`Formato de fecha inválido: ${date}`);
  return date;
};

export const preprocessDateForBackend = (input: string): string => {
  const parts = input.split('-').map((part) => part.padStart(2, '0'));

  if (parts.length === 1 && parts[0]) {
    // Solo día: Filtra por cualquier mes/año
    return `%-${parts[0]}`;
  }

  if (parts.length === 2 && parts[1]) {
    // Día y mes: Filtra por cualquier año
    return `%-${parts[1]}-${parts[0]}`;
  }

  if (parts.length === 3 && parts[2]) {
    // Día, mes y año completos
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return ''; // Caso inválido o vacío
};

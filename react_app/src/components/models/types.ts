export interface Absence {
  absenceId: number;
  employeeName: string;
  absenceType: string;
  description: string;
  hoursAbsent: number;
  date: string;
  employeeStatus: number;
}

export interface AbsenceType {
  ABSENCE_TYPE_ID: number;
  TYPE: string;
}

export interface Employees {
  EMPLOYEE_ID: number;
  NAME: string;
  STATUS_ID: number;
}

// src/types/employee.ts
export type Employee = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  biometricTemplate?: string;
  ticketBalance: number;
  createdAt?: string;
};
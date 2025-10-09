
import type { Employee } from '@/lib/types';

export const departments = ["Production", "Logistics", "Quality Assurance", "Human Resources", "Maintenance"];

export const employees: Employee[] = [
  { id: 'E-001', name: 'Alice Johnson', department: 'Production', ticketBalance: 10 },
  { id: 'E-002', name: 'Bob Williams', department: 'Logistics', ticketBalance: 15 },
  { id: 'E-003', name: 'Charlie Brown', department: 'Production', ticketBalance: 20 },
  { id: 'E-004', name: 'Diana Miller', department: 'Quality Assurance', ticketBalance: 5 },
  { id: 'E-005', name: 'Ethan Garcia', department: 'Human Resources', ticketBalance: 12 },
  { id: 'E-006', name: 'Fiona Rodriguez', department: 'Maintenance', ticketBalance: 8 },
  { id: 'E-007', name: 'George Smith', department: 'Production', ticketBalance: 22 },
  { id: 'E-008', name: 'Hannah Davis', department: 'Logistics', ticketBalance: 3 },
  { id: 'E-009', name: 'Ian Martinez', department: 'Quality Assurance', ticketBalance: 18 },
  { id: 'E-010', name: 'Jane Wilson', department: 'Human Resources', ticketBalance: 30 },
];

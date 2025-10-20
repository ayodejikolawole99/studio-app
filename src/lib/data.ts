
import type { Employee, FeedingRecord } from './types';
import { Timestamp } from 'firebase/firestore';

export const departments = ["Production", "Logistics", "Quality Assurance", "Human Resources", "Maintenance", "IT", "Finance"];

export const mockEmployees: Employee[] = [
    { id: "E-001", name: "John Doe", department: "Production", ticketBalance: 15, hasBiometric: true },
    { id: "E-002", name: "Jane Smith", department: "Logistics", ticketBalance: 20, hasBiometric: true },
    { id: "E-003", name: "Peter Jones", department: "IT", ticketBalance: 5, hasBiometric: false },
    { id: "E-004", name: "Mary Williams", department: "Human Resources", ticketBalance: 22, hasBiometric: true },
    { id: "E-005", name: "David Brown", department: "Finance", ticketBalance: 18, hasBiometric: true },
    { id: "E-006", name: "Susan Garcia", department: "Quality Assurance", ticketBalance: 30, hasBiometric: false },
];

export const mockFeedingRecords: FeedingRecord[] = [
    { id: 'FR-001', employeeId: 'E-001', employeeName: 'John Doe', department: 'Production', timestamp: new Date() },
    { id: 'FR-002', employeeId: 'E-002', employeeName: 'Jane Smith', department: 'Logistics', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'FR-003', employeeId: 'E-004', employeeName: 'Mary Williams', department: 'Human Resources', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    { id: 'FR-004', employeeId: 'E-001', employeeName: 'John Doe', department: 'Production', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 'FR-005', employeeId: 'E-005', employeeName: 'David Brown', department: 'Finance', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
];

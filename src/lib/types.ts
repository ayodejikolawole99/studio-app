import { Timestamp } from "firebase/firestore";

export type Employee = {
  id: string; // Document ID from Firestore, which is the employeeId
  name: string;
  department: string;
  ticketBalance: number;
  hasBiometric?: boolean;
};

export type FeedingRecord = {
  id: string; // Document ID from Firestore
  employeeId: string;
  employeeName: string;
  department: string;
  timestamp: Timestamp | Date; // Firestore returns Timestamp, we convert to Date
};

export type TicketData = {
  ticketId: string;
  employeeName:string;
  department: string;
  timestamp: Date;
};

export type AnalysisData = {
  trends: string;
  peakHours: string;
  overallAnalysis: string;
};

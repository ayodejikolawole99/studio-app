import { Timestamp } from "firebase/firestore";

export type Employee = {
  id: string; // Document ID from Firestore, which is the employeeId
  name: string;
  department: string;
  ticketBalance: number;
};

export type Biometric = {
  id: string; // Document ID, same as employeeId
  employeeId: string;
  template: string; // The biometric data template
  enrolledAt: Timestamp | Date;
}

export type FeedingRecord = {
  id: string; // Document ID from Firestore
  employeeId: string;
  employeeName: string;
  department: string;
  timestamp: Timestamp | Date; // Firestore returns Timestamp, we convert to Date for client use
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

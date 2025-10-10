
export type Employee = {
  id: string;
  name: string;
  department: string;
  ticketBalance: number;
};

export type FeedingRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  timestamp: Date;
};

export type TicketData = {
  ticketId: string;
  employeeName: string;
  timestamp: Date;
};

export type AnalysisData = {
  trends: string;
  peakHours: string;
  overallAnalysis: string;
};

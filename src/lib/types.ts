export type Employee = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type FeedingRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: Date;
};

export type TicketData = {
  ticketId: string;
  employeeName: string;
  employeeAvatarUrl: string;
  timestamp: Date;
};

export type AnalysisData = {
  trends: string;
  peakHours: string;
  popularFoodItems: string;
  overallAnalysis: string;
};

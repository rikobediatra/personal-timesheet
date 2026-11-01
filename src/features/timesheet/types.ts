export type TimesheetHistoryItem = {
  workDate: string;
  taskCount: number;
  snippet: string;
  lastUpdated: string;
  fileName: string;
};

export type TimesheetHistoryStats = {
  totalDays: number;
  totalTasks: number;
  latestUpdated: string | null;
  from: string;
  to: string;
};

export type TimesheetHistoryResult = {
  items: TimesheetHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: TimesheetHistoryStats;
};

export type TimesheetHistoryQuery = {
  from: string;
  to: string;
  page?: number;
  limit?: number;
  q?: string;
};

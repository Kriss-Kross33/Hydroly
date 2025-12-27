export type DailySummary = {
  date: string; // YYYY-MM-DD
  totalIntake: number;
  goalTarget: number;
  goalReached: boolean;
  completionRate: number;
  entriesCount: number;
};

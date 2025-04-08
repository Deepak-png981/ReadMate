export type GoalType = 'daily' | 'monthly';

export interface ReadingGoal {
  id: string;
  type: GoalType;
  pagesPerPeriod: number;
  createdAt: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface ReadingLog {
  id: string;
  date: string;
  pagesRead: number;
  bookId: string;
  bookTitle: string;
}

export interface DailyProgress {
  date: string;
  pagesRead: number;
}

export interface GoalProgress {
  goalId: string;
  dailyProgress: DailyProgress[];
} 
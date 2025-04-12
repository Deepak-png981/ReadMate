import { ReadingGoal, GoalProgress, DailyProgress, GoalType } from '@/types/goals';

const GOALS_KEY = 'reading_goals';
const PROGRESS_KEY = 'goal_progress';

export function getGoals(): ReadingGoal[] {
  if (typeof window === 'undefined') return [];
  const goalsJson = localStorage.getItem(GOALS_KEY);
  return goalsJson ? JSON.parse(goalsJson) : [];
}

export function getGoalProgress(): GoalProgress[] {
  if (typeof window === 'undefined') return [];
  const progressJson = localStorage.getItem(PROGRESS_KEY);
  return progressJson ? JSON.parse(progressJson) : [];
}

export function addGoal(type: GoalType, pagesPerPeriod: number): ReadingGoal {
  const goals = getGoals();
  
  // If there's an active goal, complete it first
  const activeGoal = goals.find(g => g.status === 'active');
  if (activeGoal) {
    updateGoalStatus(activeGoal.id, 'completed');
  }
  
  const newGoal: ReadingGoal = {
    id: crypto.randomUUID(),
    type,
    pagesPerPeriod,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  localStorage.setItem(GOALS_KEY, JSON.stringify([newGoal, ...goals]));
  
  // Initialize progress tracking
  const progress = getGoalProgress();
  const newProgress: GoalProgress = {
    goalId: newGoal.id,
    dailyProgress: []
  };
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...progress, newProgress]));
  
  return newGoal;
}

export function updateGoalStatus(goalId: string, status: ReadingGoal['status']): void {
  const goals = getGoals();
  const updatedGoals = goals.map(g => 
    g.id === goalId ? { ...g, status } : g
  );
  
  localStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
}

export function getActiveGoal(): ReadingGoal | undefined {
  const goals = getGoals();
  return goals.find(g => g.status === 'active');
}

export function getGoalById(goalId: string): ReadingGoal | undefined {
  const goals = getGoals();
  return goals.find(g => g.id === goalId);
}

export function getGoalProgressById(goalId: string): GoalProgress | undefined {
  const progress = getGoalProgress();
  return progress.find(p => p.goalId === goalId);
}

export function updateGoalProgress(goalId: string, date: string, pagesRead: number): void {
  const progress = getGoalProgress();
  const goalProgressIndex = progress.findIndex(p => p.goalId === goalId);
  
  if (goalProgressIndex === -1) {
    throw new Error('Goal progress not found');
  }
  
  const dailyProgress = progress[goalProgressIndex].dailyProgress;
  const dayProgressIndex = dailyProgress.findIndex(p => p.date === date);
  
  if (dayProgressIndex === -1) {
    dailyProgress.push({ date, pagesRead });
  } else {
    dailyProgress[dayProgressIndex].pagesRead += pagesRead;
  }
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

  const goal = getGoalById(goalId);
  if (goal && goal.status === 'active') {
    const goalProgress = getProgressStats(goal, progress[goalProgressIndex]);
    if (goalProgress.percentage >= 100) {
      updateGoalStatus(goalId, 'completed');
    }
  }
}

export function getProgressStats(goal: ReadingGoal, progress: GoalProgress) {
  const now = new Date();
  const dailyProgress = progress.dailyProgress;
  
  if (goal.type === 'daily') {
    const today = now.toISOString().split('T')[0];
    const todayProgress = dailyProgress.find(p => p.date === today);
    const currentPages = todayProgress?.pagesRead || 0;
    return {
      target: goal.pagesPerPeriod,
      current: currentPages,
      percentage: Math.min(100, (currentPages / goal.pagesPerPeriod) * 100)
    };
  } else {
    // Monthly progress
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthProgress = dailyProgress.filter(p => {
      const date = new Date(p.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalPagesRead = monthProgress.reduce((sum, p) => sum + p.pagesRead, 0);
    return {
      target: goal.pagesPerPeriod,
      current: totalPagesRead,
      percentage: Math.min(100, (totalPagesRead / goal.pagesPerPeriod) * 100)
    };
  }
}

export function calculateStreak(dailyProgress: DailyProgress[]): number {
  if (dailyProgress.length === 0) return 0;
  
  const sortedProgress = [...dailyProgress].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const today = new Date().toISOString().split('T')[0];
  if (sortedProgress[0].date !== today) return 0;
  
  let streak = 1;
  for (let i = 1; i < sortedProgress.length; i++) {
    const currentDate = new Date(sortedProgress[i].date);
    const previousDate = new Date(sortedProgress[i - 1].date);
    const dayDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
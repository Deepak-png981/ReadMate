'use client';

import { useState, useEffect } from 'react';
import { addGoal, getGoals, updateGoalStatus, getGoalProgressById, getProgressStats } from '@/lib/goals';
import { ReadingGoal, GoalProgress, GoalType } from '@/types/goals';
import { FiTarget, FiCalendar, FiBook, FiTrendingUp } from 'react-icons/fi';

export default function GoalsPage() {
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [goalsProgress, setGoalsProgress] = useState<GoalProgress[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'daily' as GoalType,
    pagesPerPeriod: 20
  });

  const refreshGoalsProgress = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      const progress = activeGoals.map(goal => getGoalProgressById(goal.id)).filter(Boolean) as GoalProgress[];
      setGoalsProgress(progress);
    }
  };

  useEffect(() => {
    const loadedGoals = getGoals();
    setGoals(loadedGoals);
    if (loadedGoals.length > 0) {
      const activeGoals = loadedGoals.filter(g => g.status === 'active');
      if (activeGoals.length > 0) {
        const progress = activeGoals.map(goal => getGoalProgressById(goal.id)).filter(Boolean) as GoalProgress[];
        setGoalsProgress(progress);
      }
    }
  }, []);

  // Add interval to check for progress updates
  useEffect(() => {
    const interval = setInterval(refreshGoalsProgress, 1000);
    return () => clearInterval(interval);
  }, [goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newGoal = addGoal(formData.type, formData.pagesPerPeriod);
      setGoals(prev => [newGoal, ...prev]);
      setFormData({
        type: 'daily',
        pagesPerPeriod: 20
      });
    } catch (error) {
      console.error('Failed to add goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = (goalId: string, status: ReadingGoal['status']) => {
    try {
      updateGoalStatus(goalId, status);
      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, status } : g
      ));
      // Refresh progress after status update
      refreshGoalsProgress();
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Reading Goals</h1>
      
      {/* Set Goal Form */}
      <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800/50 p-8 mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FiTarget className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Set New Reading Goal</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'daily' }))}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.type === 'daily'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Daily Goal
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'monthly' }))}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.type === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Monthly Goal
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pages {formData.type === 'daily' ? 'per Day' : 'per Month'}
            </label>
            <input
              type="number"
              min="1"
              value={formData.pagesPerPeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, pagesPerPeriod: Number(e.target.value) }))}
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-xl shadow-lg disabled:cursor-not-allowed transition-all duration-200 mt-4"
          >
            {isSubmitting ? 'Setting Goal...' : 'Set Goal'}
          </button>
        </form>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => {
              const goalProgress = goalsProgress.find(p => p.goalId === goal.id);
              const progress = goalProgress
                ? getProgressStats(goal, goalProgress)
                : { target: goal.pagesPerPeriod, current: 0, percentage: 0 };
              
              return (
                <div
                  key={goal.id}
                  className={`bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border ${
                    goal.status === 'active'
                      ? 'border-indigo-500/50'
                      : goal.status === 'completed'
                      ? 'border-green-500/50'
                      : 'border-gray-200 dark:border-gray-700/50'
                  } p-6 transition-all duration-200 hover:border-opacity-75 hover:shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {goal.type === 'daily' ? 'Daily' : 'Monthly'} Reading Goal
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'active'
                        ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/30'
                        : goal.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-green-500/30'
                        : 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-1 ring-gray-500/30'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FiBook className="w-4 h-4" />
                        Target
                      </span>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {goal.pagesPerPeriod} pages {goal.type === 'daily' ? 'per day' : 'per month'}
                      </span>
                    </div>
                    
                    {goal.status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className={`font-medium ${
                            progress.current >= progress.target 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {progress.current} / {progress.target} pages
                            {progress.current > progress.target && ` (+${progress.current - progress.target})`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              progress.current >= progress.target
                                ? 'bg-green-600 dark:bg-green-500'
                                : 'bg-indigo-600 dark:bg-indigo-500'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {goal.status === 'active' && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleStatusUpdate(goal.id, 'completed')}
                          className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg border border-green-500/30 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(goal.id, 'abandoned')}
                          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-600/20 hover:bg-gray-200 dark:hover:bg-gray-600/30 text-gray-700 dark:text-gray-400 text-sm font-medium rounded-lg border border-gray-500/30 transition-colors"
                        >
                          Abandon
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-400 mb-4">
            <FiTrendingUp className="w-8 h-8" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No reading goals set yet. Create your first goal above!
          </p>
        </div>
      )}
    </div>
  );
} 
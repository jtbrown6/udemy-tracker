import React, { useMemo } from 'react';
import { Course, CourseStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Target, Trophy, Minus, Plus, Calendar } from 'lucide-react';

interface MonthlyGoalTrackerProps {
  courses: Course[];
  monthlyGoal: number;
  onGoalChange: (newGoal: number) => void;
}

export const MonthlyGoalTracker: React.FC<MonthlyGoalTrackerProps> = ({ 
  courses, 
  monthlyGoal, 
  onGoalChange 
}) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    
    // Get days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Calculate progress through the month (0-100)
    const monthProgress = Math.round((currentDay / daysInMonth) * 100);
    
    // Days remaining
    const daysRemaining = daysInMonth - currentDay;
    
    // Get month name
    const monthName = now.toLocaleString('default', { month: 'long' });

    // Courses completed this month
    const completedThisMonth = courses.filter(c => {
      if (c.status !== CourseStatus.COMPLETED) return false;
      const courseDate = new Date(c.date);
      return courseDate.getMonth() === currentMonth && courseDate.getFullYear() === currentYear;
    }).length;

    // Goal progress percentage
    const goalProgress = Math.min(100, Math.round((completedThisMonth / monthlyGoal) * 100));
    
    // Are we on track? (completed/goal should be >= day/daysInMonth)
    const expectedProgress = (currentDay / daysInMonth) * monthlyGoal;
    const isOnTrack = completedThisMonth >= expectedProgress;
    const isAhead = completedThisMonth > expectedProgress;

    return {
      monthName,
      currentDay,
      daysInMonth,
      daysRemaining,
      monthProgress,
      completedThisMonth,
      goalProgress,
      isOnTrack,
      isAhead
    };
  }, [courses, monthlyGoal]);

  const handleIncrement = () => {
    if (monthlyGoal < 10) onGoalChange(monthlyGoal + 1);
  };

  const handleDecrement = () => {
    if (monthlyGoal > 1) onGoalChange(monthlyGoal - 1);
  };

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-800 to-indigo-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target size={18} className="text-indigo-400" />
            {stats.monthName} Goal
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={12} />
            <span>{stats.daysRemaining} days left</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Goal Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
              <button
                onClick={handleDecrement}
                disabled={monthlyGoal <= 1}
                className={`p-1.5 rounded transition-colors ${
                  monthlyGoal <= 1 
                    ? 'text-slate-600 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-white min-w-[2.5rem] text-center">
                {monthlyGoal}
              </span>
              <button
                onClick={handleIncrement}
                disabled={monthlyGoal >= 10}
                className={`p-1.5 rounded transition-colors ${
                  monthlyGoal >= 10 
                    ? 'text-slate-600 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-slate-400">courses this month</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy size={18} className={stats.completedThisMonth >= monthlyGoal ? 'text-emerald-400' : 'text-slate-500'} />
            <span className={`text-2xl font-bold ${
              stats.completedThisMonth >= monthlyGoal 
                ? 'text-emerald-400' 
                : stats.isOnTrack 
                ? 'text-white' 
                : 'text-amber-400'
            }`}>
              {stats.completedThisMonth}
            </span>
            <span className="text-sm text-slate-400">completed</span>
          </div>
        </div>

        {/* Timeline Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{stats.monthName} 1</span>
            <span>{stats.monthName} {stats.daysInMonth}</span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="relative">
            {/* Background track */}
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              {/* Goal progress (how many courses completed vs goal) */}
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.completedThisMonth >= monthlyGoal 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                    : stats.isOnTrack
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                }`}
                style={{ width: `${stats.goalProgress}%` }}
              />
            </div>
            
            {/* Current day marker */}
            <div 
              className="absolute top-0 w-0.5 h-5 -mt-1 bg-white shadow-lg"
              style={{ left: `${stats.monthProgress}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white bg-slate-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                Day {stats.currentDay}
              </div>
            </div>

            {/* Goal markers */}
            {Array.from({ length: monthlyGoal }, (_, i) => {
              const position = ((i + 1) / monthlyGoal) * 100;
              const isCompleted = i < stats.completedThisMonth;
              return (
                <div
                  key={i}
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-emerald-400 border-emerald-400' 
                      : 'bg-slate-800 border-slate-500'
                  }`}
                  style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
                  title={`Course ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Status message */}
          <div className="text-center text-sm">
            {stats.completedThisMonth >= monthlyGoal ? (
              <span className="text-emerald-400">🎉 Goal achieved! Keep going!</span>
            ) : stats.isAhead ? (
              <span className="text-indigo-400">You're ahead of schedule!</span>
            ) : stats.isOnTrack ? (
              <span className="text-slate-400">On track to meet your goal</span>
            ) : (
              <span className="text-amber-400">
                {Math.ceil((monthlyGoal - stats.completedThisMonth) / (stats.daysRemaining / 7))} course{Math.ceil((monthlyGoal - stats.completedThisMonth) / (stats.daysRemaining / 7)) !== 1 ? 's' : ''}/week needed to catch up
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


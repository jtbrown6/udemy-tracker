import React, { useMemo } from 'react';
import { Course, CourseStatus } from '../../types';
import { Card, CardContent } from '../common/Card';
import { TrendingUp, Trophy, BookOpen } from 'lucide-react';

interface ProgressSummaryProps {
  courses: Course[];
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ courses }) => {
  const stats = useMemo(() => {
    // Total completed
    const totalCompleted = courses.filter(c => c.status === CourseStatus.COMPLETED).length;

    // In progress
    const inProgress = courses.filter(c => c.status === CourseStatus.IN_PROGRESS).length;

    // Average progress of in-progress courses
    const inProgressCourses = courses.filter(c => c.status === CourseStatus.IN_PROGRESS);
    const avgProgress = inProgressCourses.length > 0
      ? Math.round(inProgressCourses.reduce((sum, c) => sum + c.completionRatio, 0) / inProgressCourses.length)
      : 0;

    return {
      totalCompleted,
      inProgress,
      avgProgress
    };
  }, [courses]);

  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
      <CardContent className="py-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Total Completed */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Trophy size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Completed</p>
              <p className="text-lg font-semibold text-white">{stats.totalCompleted}</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <BookOpen size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="text-lg font-semibold text-white">{stats.inProgress}</p>
            </div>
          </div>

          {/* Average Progress */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <TrendingUp size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg Progress</p>
              <p className="text-lg font-semibold text-white">{stats.avgProgress}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


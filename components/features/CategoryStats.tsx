import React, { useMemo } from 'react';
import { Course, CourseStatus } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Trophy, BookOpen, Clock } from 'lucide-react';

interface CategoryStatsProps {
  courses: Course[];
  categoryName: string;
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ courses, categoryName }) => {
  const stats = useMemo(() => {
    const categoryCourses = courses.filter(c => c.category === categoryName);
    const total = categoryCourses.length;
    const completed = categoryCourses.filter(c => c.status === CourseStatus.COMPLETED).length;
    const inProgress = categoryCourses.filter(c => c.status === CourseStatus.IN_PROGRESS).length;
    
    const avgProgress = total > 0
      ? Math.round(categoryCourses.reduce((sum, c) => sum + c.completionRatio, 0) / total)
      : 0;

    return { total, completed, inProgress, avgProgress };
  }, [courses, categoryName]);

  if (stats.total === 0) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{categoryName}</h3>
          <p className="text-sm text-slate-400">{stats.total} courses</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-emerald-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-emerald-400">{stats.completed}</span> completed
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-amber-400">{stats.inProgress}</span> in progress
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Avg:</span>
            <div className="w-24">
              <ProgressBar value={stats.avgProgress} size="sm" variant="gradient" />
            </div>
            <span className="text-sm font-semibold text-white">{stats.avgProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};


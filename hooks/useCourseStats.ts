import { useMemo } from 'react';
import { Course, CourseStatus } from '../types';

export interface CourseStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  upNext: number;
  completionRate: number;
  averageProgress: number;
  categoryBreakdown: Array<{ name: string; count: number }>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  inProgressCourses: Course[];
  recentlyAdded: Course[];
  overdueCourses: Course[];
  upcomingDeadlines: Course[];
}

export const useCourseStats = (courses: Course[]): CourseStats => {
  return useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.status === CourseStatus.COMPLETED).length;
    const inProgress = courses.filter(c => c.status === CourseStatus.IN_PROGRESS).length;
    const pending = courses.filter(c => c.status === CourseStatus.PENDING).length;
    const upNext = courses.filter(c => c.status === CourseStatus.UP_NEXT).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const totalProgress = courses.reduce((sum, c) => sum + (c.completionRatio || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    // Category breakdown
    const categoryCounts: { [key: string]: number } = {};
    courses.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Status breakdown for charts
    const statusBreakdown = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#6366f1' },
      { name: 'Pending', value: pending + upNext, color: '#64748b' },
    ];

    // In-progress courses (for dashboard)
    const inProgressCourses = courses.filter(c => c.status === CourseStatus.IN_PROGRESS);

    // Recently added (last 3 courses by date)
    const recentlyAdded = [...courses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    // Overdue courses
    const today = new Date();
    const overdueCourses = courses.filter(c => {
      if (!c.deadline) return false;
      const deadline = new Date(c.deadline);
      return deadline < today && c.status !== CourseStatus.COMPLETED;
    });

    // Upcoming deadlines (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingDeadlines = courses.filter(c => {
      if (!c.deadline) return false;
      const deadline = new Date(c.deadline);
      return deadline >= today && deadline <= sevenDaysFromNow && c.status !== CourseStatus.COMPLETED;
    });

    return {
      total,
      completed,
      inProgress,
      pending,
      upNext,
      completionRate,
      averageProgress,
      categoryBreakdown,
      statusBreakdown,
      inProgressCourses,
      recentlyAdded,
      overdueCourses,
      upcomingDeadlines
    };
  }, [courses]);
};


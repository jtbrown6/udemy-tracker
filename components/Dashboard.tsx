import React from 'react';
import { Course, CourseStatus } from '../types';
import { StatCards } from './features/StatCards';
import { ActiveCourses } from './features/ActiveCourses';
import { UpNextCourses } from './features/UpNextCourses';
import { MonthlyGoalTracker } from './features/MonthlyGoalTracker';
import { useCourseStats } from '../hooks/useCourseStats';

interface DashboardProps {
  courses: Course[];
  onNavigateToCourses: (status?: CourseStatus | 'all') => void;
  onEditCourse: (course: Course) => void;
  onMoveCourse: (courseId: string, direction: 'up' | 'down') => void;
  monthlyGoal: number;
  onGoalChange: (newGoal: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, onNavigateToCourses, onEditCourse, onMoveCourse, monthlyGoal, onGoalChange }) => {
  const stats = useCourseStats(courses);

  return (
    <div className="space-y-8">
      {/* Monthly Goal Tracker */}
      <MonthlyGoalTracker 
        courses={courses} 
        monthlyGoal={monthlyGoal} 
        onGoalChange={onGoalChange} 
      />

      {/* Clickable Stat Cards */}
      <StatCards stats={stats} onStatClick={onNavigateToCourses} />

      {/* Active Learning Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Active Learning</h2>
        <ActiveCourses 
          courses={courses} 
          onEditCourse={onEditCourse}
          onNavigateToCourse={() => onNavigateToCourses(CourseStatus.IN_PROGRESS)}
          onMoveCourse={onMoveCourse}
          maxDisplay={3}
        />
      </div>

      {/* Up Next Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Up Next</h2>
        <UpNextCourses 
          courses={courses} 
          onEditCourse={onEditCourse}
          onNavigateToCourses={() => onNavigateToCourses(CourseStatus.UP_NEXT)}
          maxDisplay={3}
        />
      </div>
    </div>
  );
};
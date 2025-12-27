import React from 'react';
import { Course, CourseStatus } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Clock, Play, ChevronUp, ChevronDown } from 'lucide-react';
import { calculateDaysRemaining } from '../../utils';

interface ActiveCoursesProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onNavigateToCourse: () => void;
  maxDisplay?: number;
  onMoveCourse?: (courseId: string, direction: 'up' | 'down') => void;
}

export const ActiveCourses: React.FC<ActiveCoursesProps> = ({ 
  courses, 
  onEditCourse,
  onNavigateToCourse,
  maxDisplay = 3,
  onMoveCourse
}) => {
  // Show courses pinned to dashboard, sorted by sortOrder
  const pinnedCourses = courses
    .filter(c => c.pinnedToDashboard === true)
    .sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
  const displayCourses = pinnedCourses.slice(0, maxDisplay);
  const hasMore = pinnedCourses.length > maxDisplay;

  if (pinnedCourses.length === 0) {
    return (
      <Card className="border-dashed border-slate-600">
        <CardContent className="py-12 text-center">
          <Play size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Pinned Courses</h3>
          <p className="text-sm text-slate-400 mb-4">Pin courses to your dashboard by clicking the "Pin to Dashboard" button on any course</p>
          <button
            onClick={onNavigateToCourse}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Browse Courses
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {displayCourses.map((course, index) => {
          const daysRemaining = calculateDaysRemaining(course.deadline);
          const canMoveUp = index > 0;
          const canMoveDown = index < displayCourses.length - 1;
          
          return (
            <Card key={course.id} className="hover:border-indigo-500/50 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  {/* Reorder buttons */}
                  {onMoveCourse && (
                    <div className="flex flex-col gap-0.5 flex-shrink-0 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onMoveCourse(course.id, 'up'); }}
                        disabled={!canMoveUp}
                        className={`p-1 rounded transition-colors ${
                          canMoveUp 
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                            : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onMoveCourse(course.id, 'down'); }}
                        disabled={!canMoveDown}
                        className={`p-1 rounded transition-colors ${
                          canMoveDown 
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                            : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <CardTitle className="text-sm line-clamp-2 leading-tight mt-1 group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pb-3">
                <ProgressBar 
                  value={course.completionRatio} 
                  showLabel 
                  variant="gradient"
                  size="sm"
                />
                
                {course.deadline && (
                  <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                    daysRemaining !== null && daysRemaining < 0 
                      ? 'bg-red-900/20 border border-red-800 text-red-400' 
                      : daysRemaining !== null && daysRemaining <= 7
                      ? 'bg-amber-900/20 border border-amber-800 text-amber-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    <Clock size={12} />
                    <span>
                      {daysRemaining !== null 
                        ? (daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} days overdue` 
                          : daysRemaining === 0
                          ? 'Due today!'
                          : `${daysRemaining} days left`) 
                        : 'No deadline'}
                    </span>
                  </div>
                )}

                {course.totalLessons && course.totalLessons > 0 && (
                  <div className="text-xs text-slate-400">
                    {course.completedLessons || 0} / {course.totalLessons} lessons
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-slate-700/50 pt-3">
                <div className="flex justify-end items-center w-full">
                  <button 
                    onClick={() => onEditCourse(course)}
                    className="text-xs px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors font-medium"
                  >
                    Manage
                  </button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={onNavigateToCourse}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            View All {pinnedCourses.length} Pinned Courses
          </button>
        </div>
      )}
    </div>
  );
};


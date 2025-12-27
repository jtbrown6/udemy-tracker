import React from 'react';
import { Course, CourseStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { ArrowRight } from 'lucide-react';

interface UpNextCoursesProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onNavigateToCourses: () => void;
  maxDisplay?: number;
}

export const UpNextCourses: React.FC<UpNextCoursesProps> = ({ 
  courses, 
  onEditCourse,
  onNavigateToCourses,
  maxDisplay = 3
}) => {
  // Show courses marked as "Up Next" status
  const upNextCourses = courses
    .filter(c => c.status === CourseStatus.UP_NEXT)
    .sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
  const displayCourses = upNextCourses.slice(0, maxDisplay);
  const hasMore = upNextCourses.length > maxDisplay;

  if (upNextCourses.length === 0) {
    return (
      <Card className="border-dashed border-slate-600">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-400">No courses marked as "Up Next"</p>
          <p className="text-xs text-slate-500 mt-1">Change a course's status to "Up Next" to see it here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {displayCourses.map((course) => (
        <Card key={course.id} className="hover:border-amber-500/50 transition-all group">
          <button
            onClick={() => onEditCourse(course)}
            className="w-full text-left p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {course.category}
                </span>
                <h4 className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors mt-1">
                  {course.title}
                </h4>
              </div>
              <div className="flex items-center gap-3">
                {course.completionRatio > 0 && (
                  <div className="w-20">
                    <ProgressBar value={course.completionRatio} size="sm" variant="gradient" />
                  </div>
                )}
                <ArrowRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          </button>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={onNavigateToCourses}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all {upNextCourses.length} up next →
          </button>
        </div>
      )}
    </div>
  );
};


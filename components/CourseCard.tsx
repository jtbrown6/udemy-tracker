import React from 'react';
import { Course, CourseStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './common/Card';
import { StatusBadge } from './common/StatusBadge';
import { ProgressBar } from './common/ProgressBar';
import { Star, Clock, Calendar, ExternalLink, ChevronUp, ChevronDown, Pin } from 'lucide-react';
import { calculateDaysRemaining } from '../utils';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onToggleFavorite: (id: string) => void;
  onToggleDashboardPin?: (id: string) => void;
  onUpdateProgress?: (id: string, newProgress: number) => void;
  variant?: 'grid' | 'list';
  onMoveCourse?: (courseId: string, direction: 'up' | 'down') => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEdit, 
  onToggleFavorite,
  onToggleDashboardPin,
  onUpdateProgress,
  variant = 'grid',
  onMoveCourse,
  canMoveUp = true,
  canMoveDown = true
}) => {
  const daysRemaining = calculateDaysRemaining(course.deadline);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;

  // List variant - horizontal layout
  if (variant === 'list') {
    return (
      <Card className={`group relative hover:border-indigo-500/50 transition-all ${
        isOverdue ? 'border-red-500/50 animate-pulse-subtle' : ''
      } ${isUrgent ? 'border-amber-500/50' : ''}`}>
        <div className="flex items-center gap-4 p-4">
          {/* Reorder Buttons */}
          {onMoveCourse && (
            <div className="flex flex-col gap-0.5 flex-shrink-0">
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
                <ChevronUp size={16} />
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
                <ChevronDown size={16} />
              </button>
            </div>
          )}

          {/* Star/Favorite */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(course.id); }}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              course.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:bg-slate-700'
            }`}
          >
            <Star size={18} fill={course.isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {course.category}
                  </span>
                  <StatusBadge status={course.status} size="sm" />
                </div>
                <h3 className="text-base font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {course.title}
                </h3>
              </div>
            </div>

            {/* Progress and Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-2">
                <ProgressBar 
                  value={course.completionRatio} 
                  showLabel 
                  variant="gradient" 
                  size="sm"
                  onQuickUpdate={onUpdateProgress ? (val) => onUpdateProgress(course.id, val) : undefined}
                />
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                {course.deadline && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                    isOverdue 
                      ? 'bg-red-900/20 text-red-400' 
                      : isUrgent
                      ? 'bg-amber-900/20 text-amber-400'
                      : 'text-slate-400'
                  }`}>
                    <Clock size={12} className={isOverdue ? 'animate-pulse' : ''} />
                    <span className="font-medium whitespace-nowrap">
                      {daysRemaining !== null 
                        ? (daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)}d overdue` 
                          : daysRemaining === 0
                          ? 'Due today'
                          : `${daysRemaining}d left`) 
                        : 'No deadline'}
                    </span>
                  </div>
                )}
                
                {course.notes && (
                  <div className="flex items-center gap-1 text-indigo-400">
                    <ExternalLink size={12} />
                    <span className="hidden lg:inline">Notes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} />
              <span className="hidden sm:inline">{course.date}</span>
            </div>
            {onToggleDashboardPin && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleDashboardPin(course.id); }}
                className={`p-2 rounded transition-colors ${
                  course.pinnedToDashboard 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                title={course.pinnedToDashboard ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
              >
                <Pin size={16} fill={course.pinnedToDashboard ? "currentColor" : "none"} />
              </button>
            )}
            <button 
              onClick={() => onEdit(course)}
              className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors font-medium"
            >
              Manage
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant - original vertical layout
  return (
    <Card className={`group relative flex flex-col h-full hover:border-indigo-500/50 transition-all ${
      isOverdue ? 'border-red-500/50 animate-pulse-subtle' : ''
    } ${isUrgent ? 'border-amber-500/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {course.category}
            </span>
            <CardTitle className="text-base line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
              {course.title}
            </CardTitle>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(course.id); }}
            className={`p-1.5 rounded-full transition-colors ${
              course.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:bg-slate-700'
            }`}
          >
            <Star size={18} fill={course.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Progress Section */}
        <ProgressBar value={course.completionRatio} showLabel variant="gradient" />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
           <div className="col-span-2">
             <StatusBadge status={course.status} />
           </div>
           
           {course.deadline && (
             <div className={`col-span-2 flex items-center gap-2 px-2 py-1 rounded border transition-all ${
               isOverdue 
                 ? 'bg-red-900/20 border-red-800 text-red-400' 
                 : isUrgent
                 ? 'bg-amber-900/20 border-amber-800 text-amber-400'
                 : 'bg-slate-700/50 border-slate-700 text-slate-400'
             }`}>
               <Clock size={14} className={isOverdue ? 'animate-pulse' : ''} />
               <span className="font-medium">
                 {daysRemaining !== null 
                   ? (daysRemaining < 0 
                     ? `${Math.abs(daysRemaining)} days overdue!` 
                     : daysRemaining === 0
                     ? '⚠️ Due today!'
                     : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`) 
                   : 'No deadline'}
               </span>
             </div>
           )}
        </div>
        
        {course.notes && (
             <div className="flex items-center gap-2 text-xs text-indigo-400 mt-2">
                <ExternalLink size={12} />
                <span className="truncate max-w-[200px]">{course.notes}</span>
             </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-slate-700/50 mt-auto">
        <div className="flex justify-between items-center w-full text-xs text-slate-500">
            <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{course.date}</span>
            </div>
            <button 
                onClick={() => onEdit(course)}
                className="hover:text-white transition-colors px-2 py-1 hover:bg-slate-700 rounded"
            >
                Manage
            </button>
        </div>
      </CardFooter>
    </Card>
  );
};
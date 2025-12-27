import React from 'react';
import { CourseStatus } from '../../types';
import { CheckCircle2, Clock, PlayCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: CourseStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true,
  className = '' 
}) => {
  const statusConfig = {
    [CourseStatus.COMPLETED]: {
      colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      label: 'Completed'
    },
    [CourseStatus.IN_PROGRESS]: {
      colors: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: PlayCircle,
      label: 'In Progress'
    },
    [CourseStatus.UP_NEXT]: {
      colors: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Clock,
      label: 'Up Next'
    },
    [CourseStatus.PENDING]: {
      colors: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: Circle,
      label: 'Pending'
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded border ${config.colors} ${sizeClasses[size]} ${className}`}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span className="font-medium">{config.label}</span>
    </div>
  );
};


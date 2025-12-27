import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { BookOpen, Trophy, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { CourseStats } from '../../hooks/useCourseStats';
import { CourseStatus } from '../../types';

interface StatCardsProps {
  stats: CourseStats;
  onStatClick: (status: CourseStatus | 'all') => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onStatClick }) => {
  const statCards = [
    {
      title: 'Total Courses',
      value: stats.total,
      icon: BookOpen,
      gradient: 'from-slate-800 to-indigo-900/20',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
      subtitle: 'In your library',
      subtitleColor: 'text-indigo-400/80',
      onClick: () => onStatClick('all')
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: Trophy,
      gradient: 'from-slate-800 to-emerald-900/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      subtitle: `${stats.completionRate}% Completion Rate`,
      subtitleColor: 'text-emerald-400/80',
      onClick: () => onStatClick(CourseStatus.COMPLETED)
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      gradient: 'from-slate-800 to-amber-900/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      subtitle: 'Active Learning',
      subtitleColor: 'text-amber-400/80',
      onClick: () => onStatClick(CourseStatus.IN_PROGRESS)
    },
    {
      title: 'Backlog',
      value: stats.pending,
      icon: AlertCircle,
      gradient: 'from-slate-800 to-rose-900/20',
      borderColor: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      subtitle: 'Ready to start',
      subtitleColor: 'text-rose-400/80',
      onClick: () => onStatClick(CourseStatus.PENDING)
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <button
            key={index}
            onClick={card.onClick}
            className="text-left w-full group"
          >
            <Card className={`${card.borderColor} bg-gradient-to-br ${card.gradient} cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Icon size={18} className={card.iconColor} />
                  <ArrowRight size={14} className={`${card.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className={`text-xs ${card.subtitleColor} mt-1`}>{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
};


import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
  animate?: boolean;
  onQuickUpdate?: (newValue: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className = '', 
  showLabel = false,
  size = 'md',
  variant = 'default',
  animate = true,
  onQuickUpdate
}) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const getBarColor = () => {
    if (variant === 'gradient') {
      if (value >= 75) return 'bg-gradient-to-r from-emerald-500 to-green-400';
      if (value >= 50) return 'bg-gradient-to-r from-indigo-500 to-blue-400';
      if (value >= 25) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
      return 'bg-gradient-to-r from-slate-500 to-slate-400';
    }
    return 'bg-indigo-500';
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickUpdate) {
      onQuickUpdate(Math.min(100, value + 5));
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickUpdate) {
      onQuickUpdate(Math.max(0, value - 5));
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <div className="flex items-center gap-1">
            {onQuickUpdate && (
              <>
                <button
                  onClick={handleDecrement}
                  className="p-0.5 rounded hover:bg-slate-600 text-slate-500 hover:text-white transition-colors"
                  title="Decrease 5%"
                >
                  <Minus size={12} />
                </button>
              </>
            )}
            <span className="min-w-[2rem] text-center">{value}%</span>
            {onQuickUpdate && (
              <button
                onClick={handleIncrement}
                className="p-0.5 rounded hover:bg-slate-600 text-slate-500 hover:text-white transition-colors"
                title="Increase 5%"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${getBarColor()} rounded-full ${sizeClasses[size]} ${animate ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};


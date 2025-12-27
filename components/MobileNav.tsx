import React from 'react';
import { LayoutDashboard, BookOpen, User, PlusCircle, MoreHorizontal } from 'lucide-react';
import { ViewType } from './Sidebar';

interface MobileNavProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onAddCourse: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView, onAddCourse }) => {
  const navItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
    { id: 'personal' as const, icon: User, label: 'Personal' },
    { id: 'courses' as const, icon: BookOpen, label: 'All' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onAddCourse}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-emerald-400"
        >
          <PlusCircle size={20} />
          <span className="text-xs">Add</span>
        </button>
      </div>
    </div>
  );
};


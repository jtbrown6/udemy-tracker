import React from 'react';
import { LayoutDashboard, BookOpen, PlusCircle, User, TrendingUp, Cloud, Bot, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

export type ViewType = 'dashboard' | 'courses' | 'personal' | 'improvement' | 'cloud' | 'ai-appdev' | 'ai-security' | 'devsecops' | 'appsec';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onAddCourse: () => void;
  courseCounts?: {
    total: number;
    personal: number;
    improvement: number;
    cloud: number;
    aiAppDev: number;
    aiSecurity: number;
    devSecOps: number;
    appSec: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onAddCourse, courseCounts }) => {
  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-slate-700 bg-slate-900 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          SkillTrack
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === 'dashboard' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {/* Category Navigation */}
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider px-4 py-2">Categories</p>
          
          {[
            { id: 'personal' as const, icon: User, label: 'Personal', count: courseCounts?.personal },
            { id: 'improvement' as const, icon: TrendingUp, label: 'Improvement', count: courseCounts?.improvement },
            { id: 'cloud' as const, icon: Cloud, label: 'Cloud', count: courseCounts?.cloud },
            { id: 'ai-appdev' as const, icon: Bot, label: 'AI AppDev', count: courseCounts?.aiAppDev },
            { id: 'ai-security' as const, icon: ShieldAlert, label: 'AI Security', count: courseCounts?.aiSecurity },
            { id: 'devsecops' as const, icon: ShieldCheck, label: 'DevSecOps', count: courseCounts?.devSecOps },
            { id: 'appsec' as const, icon: Lock, label: 'AppSec', count: courseCounts?.appSec },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentView === item.id ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-700 mt-2">
          <button
            onClick={() => setView('courses')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              currentView === 'courses' 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BookOpen size={20} />
              <span>All Courses</span>
            </div>
            {courseCounts && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                currentView === 'courses' ? 'bg-indigo-500' : 'bg-slate-700'
              }`}>
                {courseCounts.total}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onAddCourse}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg transition-all transform active:scale-95"
        >
          <PlusCircle size={20} />
          <span>Add New Course</span>
        </button>
      </div>
    </div>
  );
};
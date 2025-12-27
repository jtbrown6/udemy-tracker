import React, { useState, useEffect, useMemo } from 'react';
import { Course, CourseStatus } from '../types';
import { CategoryManager } from './features/CategoryManager';
import { X } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialData?: Course | null;
  categories: string[];
  allCourses: Course[];
}

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSave, initialData, categories, allCourses }) => {
  const [formData, setFormData] = useState<Partial<Course>>({});

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    allCourses.forEach(course => {
      counts[course.category] = (counts[course.category] || 0) + 1;
    });
    return counts;
  }, [allCourses]);
  
  // UseEffect to reset or populate form when modal opens/changes
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        id: Date.now().toString(),
        title: '',
        category: categories[0] || 'Development',
        date: new Date().toLocaleDateString('en-US'),
        completionRatio: 0,
        status: CourseStatus.PENDING,
        notes: '',
        isFavorite: false,
        totalLessons: 0,
        completedLessons: 0,
      });
    }
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-update status based on completion
    let status = formData.status;
    if (formData.completionRatio === 100) status = CourseStatus.COMPLETED;
    else if (formData.completionRatio && formData.completionRatio > 0 && status === CourseStatus.PENDING) status = CourseStatus.IN_PROGRESS;
    
    onSave({ ...formData, status } as Course);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              required
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <CategoryManager
                  value={formData.category || ''}
                  categories={categories}
                  categoryCounts={categoryCounts}
                  onChange={(category) => setFormData({...formData, category})}
                />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status || CourseStatus.PENDING}
                  onChange={(e) => setFormData({...formData, status: e.target.value as CourseStatus})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {Object.values(CourseStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1">Notes / URL</label>
             <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="https://github.com/..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Completion %</label>
                 <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.completionRatio || 0}
                    onChange={(e) => setFormData({...formData, completionRatio: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
             <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Goal Date</label>
                 <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Lessons Completed</label>
                 <input
                    type="number"
                    min="0"
                    value={formData.completedLessons || 0}
                    onChange={(e) => setFormData({...formData, completedLessons: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
             <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Total Lessons</label>
                 <input
                    type="number"
                    min="0"
                    value={formData.totalLessons || 0}
                    onChange={(e) => setFormData({...formData, totalLessons: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinToDashboard"
                checked={formData.pinnedToDashboard || false}
                onChange={(e) => setFormData({...formData, pinnedToDashboard: e.target.checked})}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="pinToDashboard" className="text-sm text-slate-300 cursor-pointer">
                Pin to Dashboard (Active Learning section)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="archiveCourse"
                checked={formData.isArchived || false}
                onChange={(e) => setFormData({...formData, isArchived: e.target.checked})}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="archiveCourse" className="text-sm text-slate-300 cursor-pointer">
                Archive this course (hide from lists)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
            >
                Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
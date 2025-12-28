import React, { useState, useEffect, useMemo } from 'react';
import { Course, CourseStatus } from './types';
import { getInitialData, uniqueCategories, saveCourses, getMonthlyGoal, saveMonthlyGoal } from './utils';
import { useCourseFilters } from './hooks/useCourseFilters';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { CourseCard } from './components/CourseCard';
import { CourseModal } from './components/CourseModal';
import { Dashboard } from './components/Dashboard';
import { CategoryStats } from './components/features/CategoryStats';
import { Search, X, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'personal' | 'improvement' | 'cloud' | 'ai-appdev' | 'ai-security' | 'devsecops' | 'appsec'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Course | 'status'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  // Monthly goal state (persisted to API)
  const [monthlyGoal, setMonthlyGoal] = useState<number>(2);

  // Initialize Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getInitialData();
      setCourses(data);
      const goal = await getMonthlyGoal();
      setMonthlyGoal(goal);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Save to API on change (with debounce)
  useEffect(() => {
    if (!isLoading && courses.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCourses(courses);
      }, 500); // Debounce saves by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [courses, isLoading]);

  // Save monthly goal to API
  useEffect(() => {
    if (!isLoading) {
      saveMonthlyGoal(monthlyGoal);
    }
  }, [monthlyGoal, isLoading]);

  const categories = useMemo(() => ['All', ...uniqueCategories(courses)], [courses]);

  // Course counts for sidebar
  const courseCounts = useMemo(() => ({
    total: courses.filter(c => !c.isArchived).length,
    personal: courses.filter(c => c.category === 'Personal' && !c.isArchived).length,
    improvement: courses.filter(c => c.category === 'Improvement' && !c.isArchived).length,
    cloud: courses.filter(c => c.category === 'Cloud' && !c.isArchived).length,
    aiAppDev: courses.filter(c => c.category === 'AI AppDev' && !c.isArchived).length,
    aiSecurity: courses.filter(c => c.category === 'AI Security' && !c.isArchived).length,
    devSecOps: courses.filter(c => c.category === 'DevSecOps' && !c.isArchived).length,
    appSec: courses.filter(c => c.category === 'AppSec' && !c.isArchived).length,
  }), [courses]);

  // Use custom filter hook
  const { filteredCourses, activeFilterCount } = useCourseFilters(courses, {
    searchQuery,
    selectedCategory,
    selectedStatus,
    sortConfig
  });

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    setCourses(prev => {
      const exists = prev.find(c => c.id === updatedCourse.id);
      if (exists) {
        return prev.map(c => c.id === updatedCourse.id ? updatedCourse : c);
      }
      return [updatedCourse, ...prev];
    });
  };

  const toggleFavorite = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const toggleDashboardPin = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, pinnedToDashboard: !c.pinnedToDashboard } : c));
  };

  const updateCourseProgress = (id: string, newProgress: number) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        // Auto-update status based on progress
        let newStatus = c.status;
        if (newProgress === 100) newStatus = CourseStatus.COMPLETED;
        else if (newProgress > 0 && c.status === CourseStatus.PENDING) newStatus = CourseStatus.IN_PROGRESS;
        return { ...c, completionRatio: newProgress, status: newStatus };
      }
      return c;
    }));
  };

  // Reorder courses - move up or down
  const moveCourse = (courseId: string, direction: 'up' | 'down') => {
    setCourses(prev => {
      // Get current filtered and sorted list to find neighbors
      const currentList = [...filteredCourses];
      const currentIndex = currentList.findIndex(c => c.id === courseId);
      
      if (currentIndex === -1) return prev;
      if (direction === 'up' && currentIndex === 0) return prev;
      if (direction === 'down' && currentIndex === currentList.length - 1) return prev;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const currentCourse = currentList[currentIndex];
      const swapCourse = currentList[swapIndex];

      // Swap sortOrder values
      const tempOrder = currentCourse.sortOrder ?? currentIndex;
      const newOrder = swapCourse.sortOrder ?? swapIndex;

      return prev.map(c => {
        if (c.id === currentCourse.id) return { ...c, sortOrder: newOrder };
        if (c.id === swapCourse.id) return { ...c, sortOrder: tempOrder };
        return c;
      });
    });
  };

  // Handle navigation from dashboard stat cards
  const handleDashboardNavigation = (status: CourseStatus | 'all') => {
    setCurrentView('courses');
    if (status === 'all') {
      setSelectedStatus('All');
    } else {
      setSelectedStatus(status);
    }
    // Clear other filters for cleaner view
    setSearchQuery('');
    setSelectedCategory('All');
  };

  // Category mapping for views
  const viewToCategoryMap: Record<string, string> = {
    'personal': 'Personal',
    'improvement': 'Improvement',
    'cloud': 'Cloud',
    'ai-appdev': 'AI AppDev',
    'ai-security': 'AI Security',
    'devsecops': 'DevSecOps',
    'appsec': 'AppSec',
  };

  // Handle view changes - set category filter based on view
  const handleViewChange = (view: 'dashboard' | 'courses' | 'personal' | 'improvement' | 'cloud' | 'ai-appdev' | 'ai-security' | 'devsecops' | 'appsec') => {
    setCurrentView(view);
    
    // Set category filter based on view
    const category = viewToCategoryMap[view];
    if (category) {
      setSelectedCategory(category);
      setSelectedStatus('All');
      setSearchQuery('');
    } else if (view === 'courses') {
      // Clear all filters for "All Courses" view
      setSelectedCategory('All');
      setSelectedStatus('All');
      setSearchQuery('');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex pb-20 md:pb-0">
      <Sidebar 
        currentView={currentView} 
        setView={handleViewChange} 
        onAddCourse={handleAddCourse}
        courseCounts={courseCounts}
      />
      
      <MobileNav 
        currentView={currentView}
        setView={handleViewChange}
        onAddCourse={handleAddCourse}
      />
      
      <main className="flex-1 md:ml-64 p-6 overflow-hidden">
        {/* Top Header - Mobile compatible */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
                {currentView === 'dashboard' 
                  ? 'Overview' 
                  : currentView === 'courses'
                  ? 'My Library'
                  : `${viewToCategoryMap[currentView] || ''} Courses`}
            </h1>
            
            {/* Search and Filter Bar - Only visible in courses views */}
            {currentView !== 'dashboard' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-start sm:items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search courses..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 text-sm"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as CourseStatus | 'All')}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                    <option value="All">All Status</option>
                    {Object.values(CourseStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={14} />
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>
            )}
        </div>

        <div className="max-w-7xl mx-auto pb-10">
            {currentView === 'dashboard' ? (
                <Dashboard 
                  courses={courses} 
                  onNavigateToCourses={handleDashboardNavigation}
                  onEditCourse={handleEditCourse}
                  onMoveCourse={moveCourse}
                  monthlyGoal={monthlyGoal}
                  onGoalChange={setMonthlyGoal}
                />
            ) : (
                <>
                    {/* Category Stats - show when viewing specific category */}
                    {viewToCategoryMap[currentView] && (
                      <CategoryStats 
                        courses={courses} 
                        categoryName={viewToCategoryMap[currentView]} 
                      />
                    )}

                    {/* Library Controls */}
                    <div className="flex justify-between items-center mb-6 text-sm text-slate-400">
                        <span>Showing {filteredCourses.length} courses</span>
                        <div className="flex items-center gap-2">
                             <span className="hidden sm:inline">Sort by:</span>
                             <select 
                                onChange={(e) => setSortConfig({ key: e.target.value as any, direction: 'desc' })}
                                className="bg-transparent border-none text-indigo-400 font-medium focus:ring-0 cursor-pointer"
                             >
                                <option value="date">Date Added</option>
                                <option value="completionRatio">Progress</option>
                                <option value="title">Title</option>
                             </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredCourses.map((course, index) => (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                onEdit={handleEditCourse}
                                onToggleFavorite={toggleFavorite}
                                onToggleDashboardPin={toggleDashboardPin}
                                onUpdateProgress={updateCourseProgress}
                                variant="list"
                                onMoveCourse={moveCourse}
                                canMoveUp={index > 0}
                                canMoveDown={index < filteredCourses.length - 1}
                            />
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Filter size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">No courses found matching your criteria.</p>
                        </div>
                    )}
                </>
            )}
        </div>
      </main>

      <CourseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
        categories={categories.filter(c => c !== 'All')}
        allCourses={courses}
      />
    </div>
  );
};

export default App;
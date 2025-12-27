import { useMemo } from 'react';
import { Course, CourseStatus } from '../types';

interface FilterConfig {
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: CourseStatus | 'All';
  sortConfig: {
    key: keyof Course | 'status';
    direction: 'asc' | 'desc';
  };
}

export const useCourseFilters = (courses: Course[], filters: FilterConfig) => {
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter out archived courses by default
    result = result.filter(c => !c.isArchived);

    // Filter by Category
    if (filters.selectedCategory !== 'All') {
      result = result.filter(c => c.category === filters.selectedCategory);
    }

    // Filter by Status
    if (filters.selectedStatus !== 'All') {
      result = result.filter(c => c.status === filters.selectedStatus);
    }

    // Filter by Search
    if (filters.searchQuery) {
      const lowerQ = filters.searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(lowerQ) || 
        c.category.toLowerCase().includes(lowerQ)
      );
    }

    // Sort by manual sortOrder first (for prioritization)
    result.sort((a, b) => {
      const orderA = a.sortOrder ?? 999999;
      const orderB = b.sortOrder ?? 999999;
      return orderA - orderB;
    });

    // Then apply custom sorting if not using sortOrder
    if (filters.sortConfig.key !== 'sortOrder') {
      result.sort((a, b) => {
        let valA = a[filters.sortConfig.key as keyof Course];
        let valB = b[filters.sortConfig.key as keyof Course];

        if (filters.sortConfig.key === 'date') {
          // Basic date parser for MM/DD/YYYY
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (valA < valB) return filters.sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pinned/Favorites always on top
    result.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

    return result;
  }, [courses, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.selectedCategory !== 'All') count++;
    if (filters.selectedStatus !== 'All') count++;
    return count;
  }, [filters.searchQuery, filters.selectedCategory, filters.selectedStatus]);

  return {
    filteredCourses,
    activeFilterCount
  };
};


import { Course, CourseStatus } from './types';
import { RAW_CSV_DATA } from './constants';
import { api } from './api';

export const parseCSV = (csv: string): Course[] => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  // Basic regex to handle comma within quotes
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

  return lines.slice(1).map((line, index) => {
    const values = line.split(regex).map(val => val.replace(/^"|"$/g, '').trim());
    
    // Id,Date,Category,Title,Notes,Completion ratio
    const completion = parseInt(values[5] || '0', 10);
    
    let status = CourseStatus.PENDING;
    if (completion === 100) status = CourseStatus.COMPLETED;
    else if (completion > 0) status = CourseStatus.IN_PROGRESS;

    return {
      id: values[0],
      date: values[1],
      category: values[2],
      title: values[3],
      notes: values[4] || '',
      completionRatio: completion,
      status: status,
      isFavorite: false,
      completedLessons: 0,
      totalLessons: 0,
      sortOrder: index, // Initialize with original CSV order
    };
  });
};

export const getInitialData = async (): Promise<Course[]> => {
  // Try to get from API first
  try {
    const apiCourses = await api.getCourses();
    if (apiCourses && apiCourses.length > 0) {
      console.log('Loaded courses from API');
      return apiCourses;
    }
  } catch (error) {
    console.warn('Failed to load from API, falling back to localStorage/CSV');
  }

  // Fallback to localStorage
  const saved = localStorage.getItem('skilltrack_courses');
  if (saved) {
    let courses = JSON.parse(saved) as Course[];
    let needsSave = false;
    
    // Migration: Fix Slack course category from "Work" to "Personal"
    courses = courses.map(c => {
      if (c.id === '6834117' && c.category === 'Work') {
        needsSave = true;
        return { ...c, category: 'Personal' };
      }
      return c;
    });
    
    // Save the migrated data to API
    if (needsSave || courses.length > 0) {
      try {
        await api.saveCourses(courses);
        console.log('Migrated courses from localStorage to API');
      } catch (error) {
        console.warn('Failed to migrate to API');
        localStorage.setItem('skilltrack_courses', JSON.stringify(courses));
      }
    }
    
    return courses;
  }
  
  // Final fallback to CSV
  return parseCSV(RAW_CSV_DATA);
};

export const saveCourses = async (courses: Course[]): Promise<void> => {
  // Save to API
  try {
    await api.saveCourses(courses);
  } catch (error) {
    console.error('Failed to save to API, saving to localStorage as backup');
    localStorage.setItem('skilltrack_courses', JSON.stringify(courses));
  }
};

export const getMonthlyGoal = async (): Promise<number> => {
  try {
    const value = await api.getSetting('monthly_goal');
    return value ? parseInt(value) : 2;
  } catch (error) {
    const saved = localStorage.getItem('skilltrack_monthly_goal');
    return saved ? parseInt(saved) : 2;
  }
};

export const saveMonthlyGoal = async (goal: number): Promise<void> => {
  try {
    await api.saveSetting('monthly_goal', goal.toString());
  } catch (error) {
    localStorage.setItem('skilltrack_monthly_goal', goal.toString());
  }
};

export const calculateDaysRemaining = (deadline: string | undefined): number | null => {
  if (!deadline) return null;
  const today = new Date();
  const target = new Date(deadline);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const uniqueCategories = (courses: Course[]) => {
  return Array.from(new Set(courses.map(c => c.category))).sort();
};
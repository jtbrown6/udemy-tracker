import { Course } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Get all courses
  async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE}/api/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (error) {
      console.error('API Error (getCourses):', error);
      // Return empty array on error - app will use CSV fallback
      return [];
    }
  },

  // Save all courses
  async saveCourses(courses: Course[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courses),
      });
      if (!response.ok) throw new Error('Failed to save courses');
    } catch (error) {
      console.error('API Error (saveCourses):', error);
      throw error;
    }
  },

  // Get a setting
  async getSetting(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/${key}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error('API Error (getSetting):', error);
      return null;
    }
  },

  // Save a setting
  async saveSetting(key: string, value: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to save setting');
    } catch (error) {
      console.error('API Error (saveSetting):', error);
      // Don't throw - settings are not critical
    }
  },

  // Health check
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};


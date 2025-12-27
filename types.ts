export enum CourseStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  UP_NEXT = 'Up Next'
}

export interface Course {
  id: string;
  date: string; // Purchase date
  category: string;
  title: string;
  notes: string;
  completionRatio: number; // 0-100
  
  // Enhanced fields
  isFavorite: boolean;
  totalLessons?: number;
  completedLessons?: number;
  deadline?: string; // ISO Date string
  status: CourseStatus;
  sortOrder?: number; // For manual reordering/prioritization
  pinnedToDashboard?: boolean; // Show in Active Learning section
  isArchived?: boolean; // Hide from main views
}

export interface Stats {
  totalCourses: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageCompletion: number;
}
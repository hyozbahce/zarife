export interface Student {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  classId?: string;
  className?: string;
  totalBooksRead: number;
  totalReadingTimeSeconds: number;
  currentStreak: number;
  createdAt: string;
}

export interface ClassResponse {
  id: string;
  name: string;
  gradeLevel: number;
  teacherId: string;
  teacherName?: string;
  studentCount: number;
  createdAt: string;
}

export interface ProgressResponse {
  id: string;
  bookId: string;
  bookTitle?: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  completedAt?: string;
  readingTimeSeconds: number;
  interactionCount: number;
  createdAt: string;
}

export interface AnalyticsResponse {
  totalBooksRead: number;
  totalBooksInProgress: number;
  totalReadingTimeSeconds: number;
  totalInteractions: number;
  completionRate: number;
  recentActivity: ProgressResponse[];
}

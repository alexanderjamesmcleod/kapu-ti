// Progress tracking types
export interface UserProgress {
  id: string;
  userId: string;
  completedLessons: string[];
  completedModules: string[];
  currentModule: string;
  currentLesson: string;
  lessonScores: Record<string, number>;
  totalScore: number;
  streakDays: number;
  lastActiveDate: Date;
  totalTimeMinutes: number;
  achievements: string[];
  updatedAt: Date;
}

export interface LessonAttempt {
  id: string;
  userId: string;
  lessonId: string;
  moduleId: string;
  score: number;
  totalChallenges: number;
  timeSpentSeconds?: number;
  completed: boolean;
  masteryAchieved: boolean;
  mistakes: any[];
  createdAt: Date;
}

export interface DashboardStats {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  totalScore: number;
  rank: string;
  hoursLearned: number;
}

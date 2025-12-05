// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

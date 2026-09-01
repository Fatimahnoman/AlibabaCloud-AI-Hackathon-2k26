export type UserRole = 'user' | 'admin' | 'teacher';
export type PreferredLanguage = 'auto' | 'english' | 'roman_urdu' | 'urdu';

export interface User {
  id: string;
  email: string;
  name: string;
  country?: string;
  preferredLanguage: PreferredLanguage;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserProfile extends User {
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  dateOfBirth?: Date;
  phone?: string;
  educationLevel?: string;
  occupation?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  country?: string;
  preferredLanguage?: PreferredLanguage;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

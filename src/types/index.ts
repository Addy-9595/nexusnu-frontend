// User types
export const UserRole = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  major?: string;
  department?: string;
  profilePicture?: string;
  followers: string[];
  following: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio?: string;
  major?: string;
  department?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Post types
export interface Comment {
  _id?: string;
  user: User | string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  likes: string[];
  comments: Comment[];
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
}

// Event types
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: User;
  participants: User[];
  maxParticipants?: number;
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants?: number;
  tags?: string[];
  imageUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}
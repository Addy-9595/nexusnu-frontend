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
  skills?: string[];
certifications?: Array<{
  platform: string;
  certificate_name: string;
  issuer: string;
  completion_date: string;
  credential_id: string;
  credential_url: string;
  verified: boolean;
  notes?: string;
}>;
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
  parentCommentId?: string;
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
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
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
  images?: string[];
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
  images?: string[];
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Job {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  employer_website?: string;
  job_employment_type: string;
  job_title: string;
  job_apply_link: string;
  job_description: string;
  job_city?: string;
  job_state?: string;
  job_country: string;
  job_posted_at_datetime_utc?: string;
  job_posted_at_timestamp?: number;
  job_is_remote: boolean;
  job_salary?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_required_experience?: {
    no_experience_required: boolean;
    required_experience_in_months?: number;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  };
  job_required_skills?: string[];
  job_required_education?: {
    postgraduate_degree: boolean;
    professional_school: boolean;
    high_school: boolean;
    associates_degree: boolean;
    bachelors_degree: boolean;
    degree_mentioned: boolean;
    degree_preferred: boolean;
    professional_school_mentioned: boolean;
  };
}

export interface JobSearchParams {
  query: string;
  location?: string;
  employment_type?: string;
  page?: number;
}
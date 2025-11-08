import axios from 'axios';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Post,
  CreatePostData,
  Event,
  CreateEventData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get<{ users: User[] }>('/users'),
  getUserById: (id: string) => api.get<{ user: User; posts: Post[]; events: Event[] }>(`/users/${id}`),
  updateProfile: (data: Partial<User>) => api.put<{ user: User }>('/users/profile', data),
  followUser: (id: string) => api.post(`/users/${id}/follow`),
  unfollowUser: (id: string) => api.delete(`/users/${id}/unfollow`),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Post API
export const postAPI = {
  getAllPosts: () => api.get<{ posts: Post[] }>('/posts'),
  getPostById: (id: string) => api.get<{ post: Post }>(`/posts/${id}`),
  getPostsByUser: (userId: string) => api.get<{ posts: Post[] }>(`/posts/user/${userId}`),
  createPost: (data: CreatePostData) => api.post<{ post: Post }>('/posts', data),
  updatePost: (id: string, data: Partial<CreatePostData>) => api.put<{ post: Post }>(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  addComment: (id: string, text: string) => api.post(`/posts/${id}/comment`, { text }),
};

// Event API
export const eventAPI = {
  getAllEvents: () => api.get<{ events: Event[] }>('/events'),
  getEventById: (id: string) => api.get<{ event: Event }>(`/events/${id}`),
  getEventsByUser: (userId: string) => api.get<{ events: Event[] }>(`/events/user/${userId}`),
  createEvent: (data: CreateEventData) => api.post<{ event: Event }>('/events', data),
  updateEvent: (id: string, data: Partial<CreateEventData>) => api.put<{ event: Event }>(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  joinEvent: (id: string) => api.post(`/events/${id}/join`),
  leaveEvent: (id: string) => api.post(`/events/${id}/leave`),
};

export default api;
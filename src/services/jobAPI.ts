import axios from 'axios';
import type { Job, JobSearchParams } from '../types';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = 'jsearch.p.rapidapi.com';

if (!RAPID_API_KEY) {
  console.error('⚠️ VITE_RAPID_API_KEY is not set in .env file');
}

const jobAPI = axios.create({
  baseURL: `https://${RAPID_API_HOST}`,
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': RAPID_API_HOST,
  },
});

export interface JobSearchResponse {
  data: Job[];
  status: string;
  request_id: string;
  parameters: {
    query: string;
    page: number;
    num_pages: number;
  };
}

export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResponse> => {
  try {
    const { query, location, employment_type, page = 1 } = params;

    // Build search query
    let searchQuery = query;
    if (location) {
      searchQuery += ` in ${location}`;
    }

    const response = await jobAPI.get<JobSearchResponse>('/search', {
      params: {
        query: searchQuery,
        page: page,
        num_pages: 1,
        date_posted: 'all',
        employment_types: employment_type || undefined,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Job search error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to search jobs');
  }
};

export const getJobDetails = async (jobId: string): Promise<Job> => {
  try {
    const response = await jobAPI.get<{ data: Job[] }>('/job-details', {
      params: {
        job_id: jobId,
      },
    });

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('Job not found');
    }

    return response.data.data[0];
  } catch (error: any) {
    console.error('Get job details error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get job details');
  }
};

export default jobAPI;
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchJobs } from '../services/jobAPI';
import type { Job } from '../types';

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || 'software engineer');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('type') || '');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const params: any = { query: searchQuery };
      if (location) params.location = location;
      if (employmentType) params.employment_type = employmentType;

      // Update URL params
      const newSearchParams: any = { q: searchQuery };
      if (location) newSearchParams.location = location;
      if (employmentType) newSearchParams.type = employmentType;
      setSearchParams(newSearchParams);

      const response = await searchJobs(params);
      setJobs(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load jobs from URL params on mount
    const urlQuery = searchParams.get('q');
    const urlLocation = searchParams.get('location');
    const urlType = searchParams.get('type');
    
    // If URL has search params, restore state and trigger search
    if (urlQuery || urlLocation || urlType) {
      // State is already initialized from URL params in useState,
      // but we double-check here to ensure sync
      if (urlQuery && urlQuery !== searchQuery) setSearchQuery(urlQuery);
      if (urlLocation && urlLocation !== location) setLocation(urlLocation);
      if (urlType && urlType !== employmentType) setEmploymentType(urlType);
      
      // Small delay to ensure state is updated before search
      setTimeout(() => handleSearch(), 0);
    } else if (searchQuery) {
      // No URL params, but have default query - do initial search
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const formatSalary = (job: Job) => {
    if (job.job_min_salary && job.job_max_salary) {
      return `$${(job.job_min_salary / 1000).toFixed(0)}k - $${(job.job_max_salary / 1000).toFixed(0)}k`;
    }
    return job.job_salary || 'Salary not specified';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Date not available';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Job Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title or Keywords *
                </label>
                <input
                  type="text"
                  id="query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Software Engineer, Data Analyst"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Boston, MA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  id="type"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                >
                  <option value="">All Types</option>
                  <option value="FULLTIME">Full-time</option>
                  <option value="PARTTIME">Part-time</option>
                  <option value="CONTRACTOR">Contract</option>
                  <option value="INTERN">Internship</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-northeastern-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search Jobs'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        {!loading && jobs.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-600">
              Found <strong>{jobs.length}</strong> jobs for "{searchQuery}"
              {location && ` in ${location}`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-northeastern-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-semibold">Searching for jobs...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && jobs.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">No jobs found. Try different keywords or location.</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job.job_id}
                to={`/jobs/${job.job_id}`}
                state={{ job }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition card-hover"
              >
                {/* Company Logo */}
                <div className="flex items-start gap-4 mb-4">
                  {job.employer_logo ? (
                    <img
                      src={job.employer_logo}
                      alt={job.employer_name}
                      className="w-12 h-12 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-northeastern-red rounded flex items-center justify-center text-white font-bold text-xl">
                      {job.employer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">
                      {job.job_title}
                    </h3>
                    <p className="text-sm text-gray-600 font-semibold">{job.employer_name}</p>
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span className="line-clamp-1">
                      {job.job_is_remote
  ? 'Remote'
  : [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💼</span>
                    <span>{job.job_employment_type.replace('FULLTIME', 'Full-time').replace('PARTTIME', 'Part-time').replace('CONTRACTOR', 'Contract').replace('INTERN', 'Internship')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💰</span>
                    <span className="line-clamp-1">{formatSalary(job)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🕒</span>
                    <span>{formatDate(job.job_posted_at_timestamp)}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-northeastern-red font-semibold hover:underline">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
import { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { getJobDetails } from '../services/jobAPI';
import type { Job } from '../types';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      // If job is already in location state, no need to fetch
      if (job) return;

      setLoading(true);
      setError('');

      try {
        const jobData = await getJobDetails(id);
        setJob(jobData);
      } catch (err: any) {
        console.error('Fetch job details error:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const formatSalary = (job: Job) => {
    if (job.job_min_salary && job.job_max_salary) {
      return `$${(job.job_min_salary / 1000).toFixed(0)}k - $${(job.job_max_salary / 1000).toFixed(0)}k per year`;
    }
    return job.job_salary || 'Salary not specified';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Date not available';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-northeastern-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-gray-800 mb-4">{error || 'Job not found'}</p>
          <Link
            to="/jobs"
            className="inline-block bg-northeastern-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            ← Back to Job Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-northeastern-red hover:underline mb-6 font-semibold"
        >
          ← Back to Job Search
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                className="w-20 h-20 object-contain rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-northeastern-red rounded flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {job.employer_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.job_title}</h1>
              <p className="text-xl text-gray-700 font-semibold mb-4">{job.employer_name}</p>
              
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>
                    {job.job_is_remote
                      ? 'Remote'
                      : `${job.job_city || ''}${job.job_city && job.job_state ? ', ' : ''}${job.job_state || job.job_country}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💼</span>
                  <span>
                    {job.job_employment_type
                      .replace('FULLTIME', 'Full-time')
                      .replace('PARTTIME', 'Part-time')
                      .replace('CONTRACTOR', 'Contract')
                      .replace('INTERN', 'Internship')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🕒</span>
                  <span>Posted {formatDate(job.job_posted_at_timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full md:w-auto bg-northeastern-red text-white px-8 py-3 rounded-lg font-bold text-center hover:bg-red-700 transition text-lg"
          >
            🚀 Apply Now
          </a>
        </div>

        {/* Job Details Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Salary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-gray-800 mb-1">Salary</h3>
            <p className="text-gray-600">{formatSalary(job)}</p>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold text-gray-800 mb-1">Experience</h3>
            <p className="text-gray-600">
              {job.job_required_experience?.no_experience_required
                ? 'No experience required'
                : job.job_required_experience?.required_experience_in_months
                ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)} years`
                : 'Not specified'}
            </p>
          </div>

          {/* Remote */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-bold text-gray-800 mb-1">Work Location</h3>
            <p className="text-gray-600">{job.job_is_remote ? 'Remote' : 'On-site'}</p>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <div
              className="text-gray-700 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.job_description }}
            />
          </div>
        </div>

        {/* Required Skills */}
        {job.job_required_skills && job.job_required_skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.job_required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education Requirements */}
        {job.job_required_education && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Education Requirements</h2>
            <div className="space-y-2 text-gray-700">
              {job.job_required_education.bachelors_degree && (
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Bachelor's Degree</span>
                </div>
              )}
              {job.job_required_education.associates_degree && (
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Associate's Degree</span>
                </div>
              )}
              {job.job_required_education.postgraduate_degree && (
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Postgraduate Degree</span>
                </div>
              )}
              {job.job_required_education.high_school && (
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>High School Diploma</span>
                </div>
              )}
              {!job.job_required_education.degree_mentioned && (
                <p className="text-gray-600">Education requirements not specified</p>
              )}
            </div>
          </div>
        )}

        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {job.employer_name}</h2>
          <div className="space-y-3">
            {job.employer_website && (
              <div>
                <span className="font-semibold text-gray-800">Website:</span>{' '}
                <a
                  href={job.employer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-northeastern-red hover:underline"
                >
                  {job.employer_website}
                </a>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-800">Location:</span>{' '}
              <span className="text-gray-700">
                {job.job_city && job.job_state
                  ? `${job.job_city}, ${job.job_state}, ${job.job_country}`
                  : job.job_country}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Apply Button */}
        <div className="mt-8 text-center">
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-northeastern-red text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg"
          >
            🚀 Apply for this Position
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
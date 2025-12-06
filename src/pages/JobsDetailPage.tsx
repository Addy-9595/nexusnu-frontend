import { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobDetails } from '../services/jobAPI';
import { jobCommentAPI } from '../services/api';
import type { Job } from '../types';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(location.state?.job || null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [loading, setLoading] = useState(!job);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        if (!job) {
          const jobData = await getJobDetails(id);
          setJob(jobData);
        }
        const res = await jobCommentAPI.getByJob(id);
        setComments(res.data.comments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await jobCommentAPI.add(id, commentText, rating);
      setComments([res.data.comment, ...comments]);
      setCommentText('');
      setRating(undefined);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      await jobCommentAPI.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{error || 'Job not found'}</p>
          <Link to="/jobs" className="text-northeastern-red hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = (job: Job) => {
    if (job.job_min_salary && job.job_max_salary) {
      return `$${(job.job_min_salary / 1000).toFixed(0)}k - $${(job.job_max_salary / 1000).toFixed(0)}k per year`;
    }
    return job.job_salary || 'Not specified';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="text-northeastern-red hover:underline mb-6"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {job.employer_logo ? (
              <img src={job.employer_logo} alt={job.employer_name} className="w-20 h-20 object-contain rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
            ) : (
              <div className="w-20 h-20 bg-northeastern-red rounded flex items-center justify-center text-white font-bold text-3xl">
                {job.employer_name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.job_title}</h1>
              <p className="text-xl font-semibold text-gray-700 mb-4">{job.employer_name}</p>
              
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div>📍 {job.job_is_remote ? 'Remote' : `${job.job_city || ''}${job.job_city && job.job_state ? ', ' : ''}${job.job_state || job.job_country}`}</div>
                <div>💼 {job.job_employment_type.replace('FULLTIME', 'Full-time').replace('PARTTIME', 'Part-time')}</div>
                <div>🕒 {formatDate(job.job_posted_at_timestamp)}</div>
              </div>
            </div>
          </div>

          <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" className="inline-block bg-northeastern-red text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700">
            🚀 Apply Now
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold mb-1">Salary</h3>
            <p className="text-gray-600">{formatSalary(job)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold mb-1">Experience</h3>
            <p className="text-gray-600">
              {job.job_required_experience?.no_experience_required ? 'No experience' : 
               job.job_required_experience?.required_experience_in_months ? 
               `${Math.floor(job.job_required_experience.required_experience_in_months / 12)} years` : 'Not specified'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-bold mb-1">Work Location</h3>
            <p className="text-gray-600">{job.job_is_remote ? 'Remote' : 'On-site'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: job.job_description }} />
        </div>

        {job.job_required_skills && job.job_required_skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.job_required_skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Reviews & Comments ({comments.length})</h2>

          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Rating (optional)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(rating === n ? undefined : n)}
                      className={`text-2xl ${rating && rating >= n ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience or thoughts about this job..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-northeastern-red mb-2"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="bg-northeastern-red text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Please login to comment</p>
              <Link to="/login" className="text-northeastern-red hover:underline font-semibold">Login here</Link>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="border-l-4 border-northeastern-red pl-4">
                  <div className="flex items-center mb-2">
                    <Link to={`/profile/${c.user._id}`} className="flex items-center">
                      <div className="w-8 h-8 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold mr-2">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-sm">{c.user.name}</p>
                    </Link>
                    <span className="text-xs text-gray-500 ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  {c.rating && (
                    <div className="mb-1">
                      {Array.from({length: 5}, (_, i) => (
                        <span key={i} className={i < c.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700">{c.text}</p>
                  {user && (user._id === c.user._id || user.role === 'admin') && (
                    <button onClick={() => handleDelete(c._id)} className="text-xs text-red-600 hover:underline mt-2">Delete</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
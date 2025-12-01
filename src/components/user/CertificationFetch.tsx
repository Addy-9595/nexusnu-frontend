import { useState } from 'react';
import api from '../../services/api';

interface Certification {
  platform: string;
  certificate_name: string;
  issuer: string;
  completion_date: string;
  credential_id: string;
  credential_url: string;
  verified: boolean;
  notes?: string;
}

interface Props {
  certifications: Certification[];
  onChange: (certs: Certification[]) => void;
}

export default function CertificationFetch({ certifications, onChange }: Props) {
  const [platform, setPlatform] = useState('coursera');
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!credentialId.trim()) return;

    setLoading(true);
    setError('');

    try {
  const res = await api.get(`/certifications/fetch?platform=${platform}&id=${encodeURIComponent(credentialId)}`);
  console.log('🎓 Fetched cert:', res.data);
  const updated = [...certifications, res.data];
  console.log('🎓 All certs:', updated);
  onChange(updated);
  setCredentialId('');
} catch (err: any) {
  console.error('❌ Cert fetch error:', err);
  setError(err.response?.data?.message || 'Fetch failed');
}finally {
      setLoading(false);
    }
  };

  const handleRemove = (idx: number) => {
    onChange(certifications.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
      
      <div className="flex gap-2 mb-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="coursera">Coursera</option>
          <option value="microsoft">Microsoft</option>
          <option value="aws">AWS</option>
          <option value="udemy">Udemy</option>
          <option value="linkedin-learning">LinkedIn Learning</option>
        </select>

        <input
          type="text"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          placeholder="Certificate ID or URL"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />

        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !credentialId.trim()}
          className="px-4 py-2 bg-northeastern-red text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Add'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="space-y-2">
        {certifications.map((cert, idx) => (
          <div key={idx} className="border border-gray-200 rounded-md p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{cert.certificate_name}</p>
                <p className="text-sm text-gray-600">{cert.issuer} • {cert.platform}</p>
                {cert.completion_date && (
                  <p className="text-xs text-gray-500">{cert.completion_date}</p>
                )}
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View Certificate
                  </a>
                )}
                {cert.notes && (
                  <p className="text-xs text-orange-600 mt-1">{cert.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cert.verified && <span className="text-green-600 text-sm">✓ Verified</span>}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
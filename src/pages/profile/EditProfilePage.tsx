import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import SkillsAutocomplete from '../../components/user/SkillsAutocomplete';
import CertificationFetch from '../../components/user/CertificationFetch';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
  name: '',
  bio: '',
  major: '',
  department: '',
  skills: [] as string[],
  certifications: [] as any[],
});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  
  // Cropper state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        major: user.major || '',
        department: user.department || '',
        skills: user.skills || [],
        certifications: user.certifications || [],
      });
      
      if (user.profilePicture) {
        if (user.profilePicture.startsWith('http')) {
          setPreviewImage(user.profilePicture);
        } else {
          setPreviewImage(`${BASE_URL}${user.profilePicture}`);
        }
      }
    }
  }, [user, BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
    });
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !imageToCrop) return;
    
    const croppedBlob = await getCroppedImage(imageToCrop, croppedAreaPixels);
    const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
    
    setSelectedFile(croppedFile);
    setPreviewImage(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
  if (selectedFile) {
    setUploading(true);
    await userAPI.uploadProfilePicture(selectedFile);
    setUploading(false);
  }

  console.log('💾 Saving profile with certs:', formData.certifications);
  await userAPI.updateProfile(formData);
      
      if (refreshUser) {
        await refreshUser();
      }
      
      navigate(`/profile/${user?._id}`);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please log in to edit your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Cropper Modal */}
          {showCropper && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Crop Profile Picture</h3>
                <div className="relative h-96 bg-gray-100 rounded">
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm mb-2">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleCropSave}
                    className="flex-1 bg-northeastern-red text-white py-2 px-4 rounded-md hover:bg-red-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowCropper(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-northeastern-red rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-northeastern-red file:text-white hover:file:bg-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                placeholder="Tell us about yourself..."
              />
            </div>

            {user.role === 'student' && (
              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                  Major
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                  placeholder="e.g., Computer Science"
                />
              </div>
            )}

            {user.role === 'professor' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                  placeholder="e.g., Khoury College of Computer Sciences"
                />
              </div>
            )}

            <div>
{/* Skills Section */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Skills
  </label>
  <SkillsAutocomplete
    selected={formData.skills}
    onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
  />
</div>
{/* Certifications Section */}
<CertificationFetch
  certifications={formData.certifications}
  onChange={(certifications) => setFormData(prev => ({ ...prev, certifications }))}
/>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-northeastern-red text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/profile/${user._id}`)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
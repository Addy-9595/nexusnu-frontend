import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../../services/api';

const CreateEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
   const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxParticipants: '',
    tags: '',
    imageUrl: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchEvent = async () => {
        try {
          const response = await eventAPI.getEventById(id);
          const event = response.data.event;
          const localDate = new Date(event.date).toISOString().slice(0, 16);
          setFormData({
            title: event.title,
            description: event.description,
            date: localDate,
            location: event.location,
            maxParticipants: event.maxParticipants?.toString() || '',
            tags: event.tags?.join(', ') || '',
            imageUrl: event.imageUrl || '',
          });
        } catch (err: any) {
          setError('Failed to load event');
        }
      };
      fetchEvent();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      let imageUrls: string[] = [];
      
      // Upload images first if selected
      if (selectedImages.length > 0) {
        const uploadRes = await eventAPI.uploadEventImages(selectedImages);
        imageUrls = uploadRes.data.images;
      }

      const data = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        tags: tagsArray,
        imageUrl: formData.imageUrl,
        images: imageUrls,
      };

      if (isEditing) {
        await eventAPI.updateEvent(id, data);
      } else {
        await eventAPI.createEvent(data);
      }

      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{isEditing ? 'Edit' : 'Create New'} Event</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="e.g., Snell Library, Room 101"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="e.g., workshop, networking, study-group"
            />
          </div>

           <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Event Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="https://example.com/event-image.jpg"
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Multiple Event Images (optional)
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <img key={idx} src={preview} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-northeastern-red text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Event`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
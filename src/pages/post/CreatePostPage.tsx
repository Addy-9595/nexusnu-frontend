import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postAPI } from '../../services/api';

const CreatePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
    title: '',
    content: '',
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
      const fetchPost = async () => {
        try {
          const response = await postAPI.getPostById(id);
          const post = response.data.post;
          setFormData({
            title: post.title,
            content: post.content,
            tags: post.tags?.join(', ') || '',
            imageUrl: post.imageUrl || '',
          });
        } catch (err: any) {
          setError('Failed to load post');
        }
      };
      fetchPost();
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
        console.log('📤 Uploading images:', selectedImages.length);
        const uploadRes = await postAPI.uploadPostImages(selectedImages);
        console.log('✅ Upload response:', uploadRes.data);
        imageUrls = uploadRes.data.images;
        console.log('🖼️ Image URLs:', imageUrls);
      }

      const data = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        imageUrl: formData.imageUrl,
        images: imageUrls,
      };
      
      console.log('📝 Creating post with data:', data);
      if (isEditing) {
        await postAPI.updatePost(id, data);
      } else {
        await postAPI.createPost(data);
      }

      navigate('/posts');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{isEditing ? 'Edit' : 'Create New'} Post</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="Enter post title"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="Write your post content..."
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
              placeholder="e.g., react, javascript, webdev"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Multiple Images (optional)
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
              {loading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Post`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/posts')}
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

export default CreatePostPage;
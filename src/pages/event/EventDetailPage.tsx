import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventAPI } from '../../services/api';
import type { Event } from '../../types';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const response = await eventAPI.getEventById(id);
        setEvent(response.data.event);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login');
      return;
    }

    try {
      if (isParticipant) {
        await eventAPI.leaveEvent(id);
      } else {
        await eventAPI.joinEvent(id);
      }
      // Refresh event
      const response = await eventAPI.getEventById(id);
      setEvent(response.data.event);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventAPI.deleteEvent(id);
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Event not found</div>
      </div>
    );
  }

  const isParticipant = !!user && event.participants.some((p) => p._id === user._id);
  const isOrganizer = !!user && event.organizer._id === user._id;
  const isFull = !!event.maxParticipants && event.participants.length >= event.maxParticipants;
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-northeastern-red hover:underline mb-6"
        >
          ← Back to Events
        </Link>

        {/* Event Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Image */}
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          {event.images && event.images.length > 0 && (
            <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
              <img
                src={`http://localhost:5000${event.images[currentImageIndex]}`}
                alt={`${event.title} ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />

              {event.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + event.images!.length) % event.images!.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % event.images!.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {event.images!.length}
                  </div>
                </>
              )}
            </div>
          )}


          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
                <Link
                  to={`/profile/${event.organizer._id}`}
                  className="flex items-center text-gray-600 hover:text-northeastern-red"
                >
                  <span className="text-sm">
                    Organized by <strong>{event.organizer.name}</strong>
                  </span>
                </Link>
              </div>

              {isOrganizer && (
                <div className="flex space-x-2">
                  <Link
                    to={`/events/${id}/edit`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-semibold">
                      {event.participants.length}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                      {isFull && <span className="text-red-600 ml-2">(Full)</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">⏰</span>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">
                      {isPastEvent ? (
                        <span className="text-gray-500">Past Event</span>
                      ) : (
                        <span className="text-green-600">Upcoming</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Join/Leave Button */}
            {isAuthenticated && !isOrganizer && !isPastEvent && (
              <button
                onClick={handleJoinLeave}
                disabled={!isParticipant && isFull}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isParticipant
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : isFull
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-northeastern-red text-white hover:bg-red-700'
                }`}
              >
                {isParticipant ? 'Leave Event' : isFull ? 'Event Full' : 'Join Event'}
              </button>
            )}

            {!isAuthenticated && !isPastEvent && (
              <Link
                to="/login"
                className="block w-full py-3 text-center bg-northeastern-red text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Login to Join Event
              </Link>
            )}
          </div>
        </div>

        {/* Participants List */}
        {event.participants.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Participants ({event.participants.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.participants.map((participant) => (
                <Link
                  key={participant._id}
                  to={`/profile/${participant._id}`}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-northeastern-red transition"
                >
                  <div className="w-10 h-10 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.major}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
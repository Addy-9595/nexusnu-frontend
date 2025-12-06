import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventAPI } from '../../services/api';
import type { Event } from '../../types';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.getAllEvents();
        setEvents(response.data.events);
        
        // Filter by tag if present
        if (selectedTag) {
          const filtered = response.data.events.filter((event: Event) =>
            event.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
          );
          setFilteredEvents(filtered);
        } else {
          setFilteredEvents(response.data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedTag]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedTag ? (
                <>
                  Events tagged with <span className="text-northeastern-red">#{selectedTag}</span>
                </>
              ) : (
                'All Events'
              )}
            </h1>
            {selectedTag && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-600 hover:text-northeastern-red transition mt-2"
              >
                ✕ Clear filter
              </button>
            )}
          </div>
          {isAuthenticated && (
            <Link
              to="/events/create"
              className="bg-northeastern-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Create Event
            </Link>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              {selectedTag ? `No events found with tag #${selectedTag}` : 'No events yet. Create the first event!'}
            </p>
            {isAuthenticated && !selectedTag && (
              <Link
                to="/events/create"
                className="inline-block bg-northeastern-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Create First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {event.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👥</span>
                      <span>{event.participants.length} participants</span>
                      {event.maxParticipants && (
                        <span className="text-gray-500"> / {event.maxParticipants}</span>
                      )}
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <Link
                          key={index}
                          to={`/events?tag=${encodeURIComponent(tag)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-northeastern-red hover:text-white transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/events/${event._id}`}
                    className="block w-full text-center bg-northeastern-red text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
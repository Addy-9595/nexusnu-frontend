import { Link } from 'react-router-dom';
import type { Message } from '../../types';

interface Props {
  message: Message;
  isOwnMessage: boolean;
  onDelete?: (id: string) => void;
}

export default function MessageBubble({ message, isOwnMessage, onDelete }: Props) {
  const formatTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return msgDate.toLocaleDateString();
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        <Link to={`/profile/${message.sender._id}`} className="flex-shrink-0">
          {message.sender.profilePicture ? (
            <img
              src={message.sender.profilePicture}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-northeastern-red rounded-full flex items-center justify-center text-white text-xs font-bold">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex flex-col">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? 'bg-northeastern-red text-white rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm break-words">{message.content}</p>
          </div>

          <div className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
            {isOwnMessage && message.read && (
              <span className="text-xs text-gray-500">Read</span>
            )}
            {isOwnMessage && onDelete && (
              <button
                onClick={() => onDelete(message._id)}
                className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
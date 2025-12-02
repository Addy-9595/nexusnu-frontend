import type { Conversation } from '../../types';

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (userId: string, conversationId: string) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const formatTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return msgDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">No conversations yet</p>
          <p className="text-sm text-gray-400">Visit a user profile and click "Send Message" to start chatting</p>
        </div>
      ) : (
        <div>
          {conversations.map((conv) => {
            if (!conv.otherUser) {
              console.error('❌ INVALID CONVERSATION:', conv);
              return null;
            }
            return (
            <button
              key={conv._id}
              onClick={() => onSelect(conv.otherUser._id, conv._id)}
              className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                selectedId === conv._id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  {conv.otherUser.profilePicture ? (
                    <img
                      src={conv.otherUser.profilePicture}
                      alt={conv.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold">
                      {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-northeastern-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.otherUser.name}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conv.updatedAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
               </div>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
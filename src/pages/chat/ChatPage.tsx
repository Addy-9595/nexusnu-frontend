import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, userAPI } from '../../services/api';
import type { Conversation, Message} from '../../types';
import ConversationList from './ConversationList';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';

export default function ChatPage() {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      console.log('📥 CONVERSATIONS LOADED:', { count: res.data.conversations.length, conversations: res.data.conversations });
      setConversations(res.data.conversations);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const res = await chatAPI.getMessages(conversationId);
      setMessages(res.data.messages);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = async (otherUserId: string, conversationId: string) => {
    const conv = conversations.find((c) => c._id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      await loadMessages(conversationId);
      navigate(`/chat/${otherUserId}`);

      const unreadMessages = messages.filter(
        (m) => m.recipient._id === user?._id && !m.read
      );
      for (const msg of unreadMessages) {
        try {
          await chatAPI.markAsRead(msg._id);
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    const isTemp = selectedConversation._id.startsWith('temp_');
    console.log('📤 SEND MESSAGE:', { recipientId: selectedConversation.otherUser._id, isTemp });

    try {
      await chatAPI.sendMessage(selectedConversation.otherUser._id, content);

      if (isTemp) {
        console.log('🔄 RELOADING CONVERSATIONS AFTER FIRST MESSAGE');
        await loadConversations();
        const res = await chatAPI.getConversations();
        const newConv = res.data.conversations.find(
          c => c.otherUser._id === selectedConversation.otherUser._id
        );
        if (newConv) {
          console.log('✅ NEW CONVERSATION FOUND:', newConv._id);
          setSelectedConversation(newConv);
          await loadMessages(newConv._id);
        }
      } else {
        await loadMessages(selectedConversation._id);
        await loadConversations();
      }

      scrollToBottom();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(messages.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error('Delete message error:', error);
    }
  };

  const startNewConversation = async (otherUserId: string) => {
    try {
      const existingConv = conversations.find(
        (c) => c.otherUser._id === otherUserId
      );

      if (existingConv) {
        handleSelectConversation(otherUserId, existingConv._id);
        return;
      }

      const res = await userAPI.getUserById(otherUserId);
      const otherUser = res.data.user;

      const newConv: Conversation = {
        _id: 'temp_' + Date.now(),
        otherUser,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };

      setSelectedConversation(newConv);
      setMessages([]);
      navigate(`/chat/${otherUserId}`);
    } catch (error) {
      console.error('Start conversation error:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadConversations();
      setLoading(false);
    };
    init();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (urlUserId && !selectedConversation) {
      console.log('🔍 URL USER ID DETECTED:', { urlUserId, conversationsCount: conversations.length });
      const conv = conversations.find((c) => c.otherUser._id === urlUserId);
      if (conv) {
        console.log('✅ EXISTING CONVERSATION FOUND:', conv._id);
        handleSelectConversation(urlUserId, conv._id);
      } else if (conversations.length > 0 || loading === false) {
        console.log('🆕 NO CONVERSATION FOUND, STARTING NEW');
        startNewConversation(urlUserId);
      }
    }
  }, [urlUserId, conversations, loading]);

  useEffect(() => {
    if (selectedConversation && !selectedConversation._id.startsWith('temp_')) {
      pollInterval.current = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, 5000);

      return () => {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
        }
      };
    }
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            <div className="w-full md:w-1/3 hidden md:block">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?._id}
                onSelect={handleSelectConversation}
              />
            </div>

            <div className="w-full md:w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                    <button
                      onClick={() => navigate('/chat')}
                      className="md:hidden text-northeastern-red"
                    >
                      ← Back
                    </button>
                    {selectedConversation.otherUser.profilePicture ? (
                      <img
                        src={selectedConversation.otherUser.profilePicture}
                        alt={selectedConversation.otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {selectedConversation.otherUser.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.otherUser.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading messages...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">No messages yet</p>
                          <p className="text-sm text-gray-400">Start a conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message._id}
                            message={message}
                            isOwnMessage={message.sender._id === user?._id}
                            onDelete={message.sender._id === user?._id ? handleDeleteMessage : undefined}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <MessageInput onSend={handleSendMessage} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-600 mb-4">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
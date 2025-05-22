// StudentMessages.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios'; // Import Axios

// Assuming your backend runs on port 5000
const API_BASE_URL = 'http://localhost:5000/api';

interface Message {
  _id: string; // MongoDB uses _id
  sender_id: string;
  recipient_id: string | null;
  content: string;
  links: { url: string; text: string }[];
  createdAt: string; // Assuming your Mongoose schema uses 'createdAt'
  is_read: boolean;
  sender_name: string; // This will likely come from a populate or separate lookup on backend
}

const StudentMessages: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log('Fetching messages for student from backend...');
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      // Make GET request to your backend messages endpoint
      // This endpoint should filter messages by recipient_id === currentUser.id OR recipient_id === null
      const response = await axios.get(`${API_BASE_URL}/messages/student`, config);
      console.log('Backend response for student messages:', response.data);

      const fetchedMessages: Message[] = response.data.map((msg: any) => ({
        ...msg,
        // Ensure links is an array, even if null/undefined from backend
        links: msg.links || [],
        // If your backend populates sender_name, use it. Otherwise, default to 'Admin'.
        // You'll need to ensure your backend's message model and route logic handle this.
        sender_name: msg.sender_name || 'Admin',
      }));

      // Sort by createdAt in descending order (most recent first)
      fetchedMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(fetchedMessages);
      showToast('Messages loaded successfully', 'success');

      // --- Mark messages as read ---
      // This part requires a separate API call to update `is_read` status in MongoDB.
      // Only mark individual messages as read to avoid issues with broadcast messages.
      const unreadIndividualMessageIds = fetchedMessages
        .filter(m => !m.is_read && m.recipient_id === currentUser.id)
        .map(m => m._id); // Use _id for MongoDB

      if (unreadIndividualMessageIds.length > 0) {
        try {
          await axios.put(`${API_BASE_URL}/messages/mark-as-read`, { messageIds: unreadIndividualMessageIds }, config);
          // Optimistically update the UI after successful API call
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              unreadIndividualMessageIds.includes(msg._id) ? { ...msg, is_read: true } : msg
            )
          );
          console.log('Unread individual messages marked as read.');
        } catch (error) {
          console.error('Error marking messages as read:', error);
          showToast('Failed to mark some messages as read', 'warning');
        }
      }

    } catch (error: any) {
      console.error('Error fetching messages:', error);
      showToast(`Failed to load messages: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.token, showToast]); // Add showToast to useCallback dependencies

  useEffect(() => {
    fetchMessages();

    // --- Real-time updates (requires WebSockets/Socket.IO on backend) ---
    // Since you're moving away from Supabase, you'll need to set up
    // a WebSocket connection (e.g., using Socket.IO) on your Node.js backend
    // and emit events when new messages are created.
    // This is a placeholder for where that logic would go.

    /*
    // Example using a hypothetical Socket.IO client
    import io from 'socket.io-client';
    const socket = io(API_BASE_URL); // Connect to your backend's Socket.IO server

    socket.on('newMessageToStudent', (newMessage: Message) => {
        // Filter if the message is relevant to this student (individual or broadcast)
        if (newMessage.recipient_id === currentUser?.id || newMessage.recipient_id === null) {
            setMessages(prev => [{
                ...newMessage,
                sender_name: newMessage.sender_name || 'Admin', // Ensure sender_name is handled
                links: newMessage.links || []
            }, ...prev]);
            showToast('You have a new message!', 'info');
        }
    });

    return () => {
        socket.disconnect(); // Clean up on component unmount
    };
    */
    // For now, without a specific WebSocket setup, new messages won't appear until page refresh.
    // If you implement WebSockets, uncomment and adjust the above block.

  }, [fetchMessages]); // Re-run effect when fetchMessages changes (due to currentUser changes)

  const toggleExpand = (id: string) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Mail className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold">Your Messages</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No messages yet
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message._id} // Use _id
              className={`border rounded-lg overflow-hidden ${message.is_read || message.recipient_id === null ? 'border-gray-200' : 'border-blue-200 bg-blue-50'}`}
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleExpand(message._id)} // Use _id
              >
                <div>
                  <h3 className="font-medium">
                    {message.sender_name}
                    {message.recipient_id === null && <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">Broadcast</span>}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                {expandedMessage === message._id ? ( // Use _id
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>

              {expandedMessage === message._id && ( // Use _id
                <div className="p-4 pt-0 border-t">
                  <div className="whitespace-pre-line mb-4">{message.content}</div>

                  {message.links.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Links:</h4>
                      <ul className="space-y-1">
                        {message.links.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <span className="mr-1">•</span>
                              {link.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMessages;
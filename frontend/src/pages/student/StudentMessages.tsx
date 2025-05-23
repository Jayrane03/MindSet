// StudentMessages.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

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
  const { currentUser } = useAuth(); // We'll still use currentUser for ID, but not token for fetch
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchMessages = useCallback(async () => {
    // We no longer check for currentUser.token here, as you want to remove token requirement.
    // However, we still need currentUser.id for marking specific messages as read.
    // If you want even unauthenticated users to see broadcast messages, you might need
    // to adjust the initial return condition depending on backend's public access.
    // For now, if no currentUser.id, it implies user isn't fully identified, so don't mark as read.
    if (!currentUser?.id) { // Only check for ID if you need it for marking as read later
      setLoading(false);
      // If you want to fetch broadcast messages for *anyone*, even without a user ID,
      // then remove this 'if' block entirely. But then 'mark-as-read' logic needs thought.
      return;
    }

    setLoading(true);

    try {
      console.log('Fetching messages for student from backend...');
      
      // Removed the 'config' object with Authorization header
      // This makes the GET request unauthenticated from the client side.
      const response = await axios.get(`${API_BASE_URL}/messages/student`);
      
      console.log('Backend response for student messages:', response.data);

      const fetchedMessages: Message[] = response.data.map((msg: any) => ({
        ...msg,
        // Ensure links is an array, even if null/undefined from backend
        links: msg.links || [],
        // If your backend populates sender_name, use it. Otherwise, default to 'Admin'.
        sender_name: msg.sender_name || 'Admin',
      }));

      // Sort by createdAt in descending order (most recent first)
      fetchedMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(fetchedMessages);
      showToast('Messages loaded successfully', 'success');

      // --- Mark messages as read ---
      // This part still needs authentication on the backend side if marking individual messages.
      // If you've completely removed authentication for *all* message-related endpoints on backend,
      // then this `axios.put` might still work, but it's generally a security risk for PUT/POST.
      // For broadcast messages (recipient_id === null), you don't mark them as "read" for a specific user
      // in the database because they're general. The is_read flag is only relevant for individual messages.
      const unreadIndividualMessageIds = fetchedMessages
        .filter(m => !m.is_read && m.recipient_id === currentUser.id) // Only mark messages for THIS user
        .map(m => m._id);

      if (unreadIndividualMessageIds.length > 0) {
        try {
          // IMPORTANT: Your backend's /messages/mark-as-read endpoint *SHOULD*
          // still be protected by an authentication middleware if it's marking
          // individual messages as read for a specific user.
          // If you remove protection on backend for this, it's a security vulnerability.
          // For now, we'll send the token for this specific call, as it's an update action.
          // If currentUser.token is null here, this call will fail (which is good for security).
          const updateConfig = currentUser?.token ? { headers: { Authorization: `Bearer ${currentUser.token}` } } : {};
          
          await axios.put(`${API_BASE_URL}/messages/mark-as-read`, { messageIds: unreadIndividualMessageIds }, updateConfig);
          
          // Optimistically update the UI after successful API call
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              unreadIndividualMessageIds.includes(msg._id) ? { ...msg, is_read: true } : msg
            )
          );
          console.log('Unread individual messages marked as read.');
        } catch (error) {
          console.error('Error marking messages as read:', error);
          // showToast('Failed to mark some messages as read', 'warning'); // Commented out to avoid confusing toast
        }
      }

    } catch (error: any) {
      console.error('Error fetching messages:', error);
      // Refined error message to handle cases where response.data might be undefined
      showToast(`Failed to load messages: ${error.response?.data?.message || error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.token, showToast]); // Added currentUser.token back to dependencies for mark-as-read


  useEffect(() => {
    fetchMessages();

    // --- Real-time updates (requires WebSockets/Socket.IO on backend) ---
    // If you implement WebSockets, uncomment and adjust the example block from previous messages.
    // For now, without a specific WebSocket setup, new messages won't appear until page refresh.

  }, [fetchMessages]);

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
              key={message._id}
              className={`border rounded-lg overflow-hidden ${message.is_read || message.recipient_id === null ? 'border-gray-200' : 'border-blue-200 bg-blue-50'}`}
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleExpand(message._id)}
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
                {expandedMessage === message._id ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>

              {expandedMessage === message._id && (
                <div className="p-4 pt-0 border-t">
                  <div className="whitespace-pre-line mb-4">{message.content}</div>

                  {message.links.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Links:</h4>
                      <ul className="space-y-1">
                        {message.links.map((link, index) => (
  // Use a div or just the <a> directly, but avoid <li> inside <button>
  // The key should ideally be on the outermost repeating element.
  <div key={index} className="w-fit mb-2 "> {/* Added mb-2 for spacing between buttons */}
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      // Apply button-like styles directly to the anchor tag
      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
    >
      <span className="mr-1">•</span> {/* Keep your bullet if desired */}
      {link.text}
    </a>
  </div>
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
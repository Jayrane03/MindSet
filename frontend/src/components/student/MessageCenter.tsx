// components/student/MessageCenter.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext provides currentUser with an ID
import { Mail, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'; // Added Loader2

// Define types for data fetched from your MongoDB backend
interface Message {
  _id: string; // MongoDB's default primary key
  sender_id: string; // ID of the sender (e.g., Admin's User ID or a fixed Admin ID)
  recipient_id: string; // ID of the recipient (student's User ID)
  content: string;
  metadata?: { // Metadata can be optional, check your backend schema
    links?: { url: string; text: string }[];
  };
  created_at: string; // Store as ISO string in MongoDB, parse to Date for display
  is_read: boolean;
  sender_name?: string; // This will be populated on the frontend after fetching
}

// !!! IMPORTANT: Replace with your actual backend API base URL !!!
const YOUR_BACKEND_API_BASE_URL = 'http://localhost:5000/api'; // Example: your Node.js/Express backend

const MessageCenter: React.FC<{ initialMessages?: Message[] }> = ({ initialMessages = [] }) => {
  const { currentUser } = useAuth(); // Assumes currentUser has an 'id' property
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(!initialMessages.length);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    // If initialMessages are provided (e.g., from server-side rendering or parent component),
    // we don't need to fetch on initial mount.
    if (initialMessages.length > 0) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      if (!currentUser?.id) {
        setError("User not authenticated. Cannot fetch messages.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        console.log(`MessageCenter: Fetching messages for user ${currentUser.id}...`);
        // Endpoint to get messages for the current user (recipient_id)
        const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/messages/user/${currentUser.id}`, {
          headers: {
            'Content-Type': 'application/json',
            // Include authorization header if your API requires it
            // 'Authorization': `Bearer ${currentUser.token}` 
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch messages.');
        }

        const data: Message[] = await response.json();
        console.log('MessageCenter: Fetched messages:', data);

        // Map the sender_id to a display name (e.g., 'Admin')
        // In a real app, you might fetch sender details from a 'users' or 'profiles' collection
        const messagesWithSenderNames = data.map(msg => ({
          ...msg,
          sender_name: msg.sender_id === 'ADMIN_FIXED_ID' ? 'Admin' : 'Unknown Sender', // Replace 'ADMIN_FIXED_ID'
        }));
        setMessages(messagesWithSenderNames);

        // Mark unread messages as read in the backend
        const unreadMessageIds = messagesWithSenderNames
          .filter(m => !m.is_read)
          .map(m => m._id); // Use _id for MongoDB documents

        if (unreadMessageIds.length > 0) {
          console.log('MessageCenter: Marking messages as read:', unreadMessageIds);
          await markMessagesAsRead(unreadMessageIds);
        }

      } catch (err: any) {
        console.error('MessageCenter: Error fetching messages:', err);
        setError(`Failed to load messages: ${err.message || 'Unknown error'}`);
        setMessages([]); // Clear messages on error
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // --- Real-time Subscription (Conceptual for MongoDB/Express) ---
    // For real-time updates with Node.js/Express, you would typically use WebSockets (e.g., Socket.IO).
    // This part would involve setting up a Socket.IO client and listening for 'newMessage' events.
    /*
    const socket = io(YOUR_BACKEND_API_BASE_URL); // Assuming Socket.IO server is at your backend URL
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      // You might emit an event to join a room specific to the user, e.g., 'joinUserRoom', currentUser.id
      socket.emit('joinUserRoom', currentUser.id);
    });

    socket.on('newMessage', (newMessage: Message) => {
      // Check if the new message is for the current user
      if (newMessage.recipient_id === currentUser.id) {
        setMessages(prev => [{
          ...newMessage,
          sender_name: newMessage.sender_id === 'ADMIN_FIXED_ID' ? 'Admin' : 'Unknown Sender',
        }, ...prev]);
        // Optionally, mark this new message as read immediately if it's displayed
        markMessagesAsRead([newMessage._id]);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    return () => {
      socket.disconnect(); // Clean up on component unmount
    };
    */

    // If not using Socket.IO, you might periodically refetch messages, but that's less efficient.
    // The current return cleanup only applies to Supabase.
  }, [currentUser?.id, initialMessages]); // Re-run if currentUser.id or initialMessages changes

  // Function to mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/messages/mark-as-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if your API requires it
          // 'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark messages as read.');
      }

      // Update local state to reflect that messages are now read
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          messageIds.includes(msg._id) ? { ...msg, is_read: true } : msg
        )
      );
      console.log('MessageCenter: Messages marked as read successfully.');

    } catch (err) {
      console.error('MessageCenter: Error marking messages as read:', err);
      // You might want to display an error or retry
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMessage(expandedMessage === id ? null : id);
    // When a message is expanded, mark it as read if it's not already
    const messageToMark = messages.find(msg => msg._id === id);
    if (messageToMark && !messageToMark.is_read) {
      markMessagesAsRead([id]);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Mail className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold">Message Center</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-neutral-100 p-4 rounded-full mb-4">
            <Mail size={32} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-neutral-600">You'll see important announcements here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message._id} // Use _id for MongoDB documents
              className={`border rounded-lg overflow-hidden ${
                message.is_read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleExpand(message._id)} // Use _id here
              >
                <div>
                  <h3 className="font-medium">{message.sender_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                {expandedMessage === message._id ? ( // Use _id here
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>

              {expandedMessage === message._id && ( // Use _id here
                <div className="p-4 pt-0 border-t">
                  <div className="whitespace-pre-line mb-4">{message.content}</div>

                  {message.metadata?.links && message.metadata.links.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Links:</h4>
                      <ul className="space-y-1">
                        {message.metadata.links.map((link, index) => (
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

export default MessageCenter;
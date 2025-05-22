import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Send, Link as LinkIcon, Users, Clock } from 'lucide-react'; // Re-added Send, LinkIcon
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Assuming your backend runs on port 5000
const API_BASE_URL = 'http://localhost:5000/api';

// --- Contexts for demonstration (keep as is for functionality) ---

// Toast Context
const ToastContext = createContext<any>(null);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | null }>({ message: '', type: null });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000); // Hide after 3 seconds
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.type && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white
          ${toast.type === 'success' ? 'bg-green-500' : ''}
          ${toast.type === 'error' ? 'bg-red-500' : ''}
          ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
        `}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// Auth Context
const AuthContext = createContext<any>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string; token: string } | null>(null);

  useEffect(() => {
    // In a real application, you'd get the token and user details from localStorage
    // after a successful login. For this example, we're simulating a logged-in admin.
    // **IMPORTANT:** Replace 'YOUR_ADMIN_JWT_TOKEN' with an actual valid token
    // you receive from a successful admin login in your backend.
    // Replace '60c72b2f9b1d8e0015f8e2c7' with a real admin user ID from your database.
    const mockAdminId = '682ef3a9d1a9c82cae8e4b56'; // Replace with a real admin ID from your DB
    const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmVmM2E5ZDFhOWM4MmNhZThlNGI1NiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwMH0.mockAdminTokenForTesting'; // Replace with a valid JWT token for an admin (update expiry!)

    if (mockAdminId && mockAdminToken) {
        setCurrentUser({ id: mockAdminId, name: 'Admin User', role: 'admin', token: mockAdminToken });
    } else {
        console.warn("Mock admin ID or token missing. Please update AuthProvider for proper testing.");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

interface MessageInsert {
  sender_id: string;
  recipient_id: string | null;
  content: string;
  links?: { url: string; text: string }[];
}

// Define an interface for the student user data you expect from the API
interface StudentUser {
  _id: string; // MongoDB's default ID field
  name: string;
  email: string;
  role: 'student';
  // Add other fields if your User schema has them
}

// Interfaces for chart data
interface ChartDataPoint {
  name: string;
  [key: string]: number | string; // Allows for dynamic keys like 'students'
}

const AdminMessages: React.FC = () => {
  const { currentUser } = useAuth();
  const adminUserId = currentUser?.id;
  const authToken = currentUser?.token;

  // States for Message Sending Section (re-added)
  const [messageType, setMessageType] = useState<'broadcast' | 'individual'>('broadcast');
  const [recipient, setRecipient] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [links, setLinks] = useState<{ url: string; text: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkText, setNewLinkText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // States for Dashboard Cards and Chart
  const [allStudentUsers, setAllStudentUsers] = useState<StudentUser[]>([]); // To populate recipient dropdown and total students
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [avgChatbotUsageHours, setAvgChatbotUsageHours] = useState<number>(0);
  const [studentActivityChartData, setStudentActivityChartData] = useState<ChartDataPoint[]>([]);

  const { showToast } = useToast();

  // --- Real API Call to fetch student users ---
  useEffect(() => {
    const fetchStudents = async () => {
      if (!authToken) {
        // showToast('Authentication token not available for student data. Please log in.', 'error');
        // We'll skip showing toast here to avoid clutter if the mock token is just for testing
        return;
      }
      try {
        console.log('Fetching student data from backend...');
        const config = {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        };
        const response = await axios.get(`${API_BASE_URL}/admin/students-data`, config);
        console.log('Backend response for students:', response.data);

        const students = response.data.filter((user: StudentUser) => user.role === 'student');
        setAllStudentUsers(students); // Set this for the dropdown
        setTotalStudents(students.length);

        // showToast('Student data loaded successfully', 'success'); // Only show if genuinely successful and needed
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        // showToast(`Error fetching student data: ${error.response?.data?.message || error.message}`, 'error');
      }
    };
    fetchStudents();
  }, [authToken]); // Removed showToast from dependency for now, to avoid excessive toasts

  // --- Real API Call to fetch chatbot usage (for dashboard card) ---
  useEffect(() => {
    const fetchChatbotUsageForCard = async () => {
      if (!authToken) {
        return;
      }
      try {
        console.log('Fetching chatbot usage data for card from backend...');
        const config = {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        };
        // Ensure this endpoint returns { averageDailyHours: number }
        const response = await axios.get(`${API_BASE_URL}/admin/chatbot-usage`, config);
        console.log('Backend response for chatbot usage (card):', response.data);
        setAvgChatbotUsageHours(response.data.averageDailyHours || 0); // Default to 0 if not found

      } catch (error: any) {
        console.error('Error fetching chatbot usage data for card:', error);
      }
    };
    fetchChatbotUsageForCard();
  }, [authToken]);


  // --- API Call for Student Activity Chart Data (Students joining per month) ---
  useEffect(() => {
    const fetchStudentActivityChartData = async () => {
      if (!authToken) return;
      try {
        console.log('Fetching student activity chart data from backend...');
        const config = { headers: { Authorization: `Bearer ${authToken}` } };
        // This endpoint should return data formatted for the chart, e.g., { labels: ['Jan 2023', 'Feb 2023'], datasets: [{ data: [10, 15] }] }
        const response = await axios.get(`${API_BASE_URL}/admin/student-activity-chart-data`, config);
        console.log('Backend response for student activity chart:', response.data);
        // Ensure the data structure matches what Recharts expects: an array of objects
        // where each object has a 'name' (for X-axis) and a key matching dataKey (e.g., 'students')
        setStudentActivityChartData(response.data.datasets[0].data.map((value: number, index: number) => ({
            name: response.data.labels[index],
            students: value
        })));
      } catch (error: any) {
        console.error('Error fetching student activity chart data:', error);
      }
    };
    fetchStudentActivityChartData();
  }, [authToken]);


  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkText.trim()) {
      showToast('Please enter both URL and display text', 'error');
      return;
    }

    try {
      new URL(newLinkUrl);
    } catch (_) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    setLinks([...links, { url: newLinkUrl.trim(), text: newLinkText.trim() }]);
    setNewLinkUrl('');
    setNewLinkText('');
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    if (messageType === 'individual' && !recipient) {
      showToast('Please select a recipient', 'error');
      return;
    }

    if (!adminUserId || !authToken) { // Keeping authentication check
      showToast('Admin user not identified or authenticated. Message cannot be sent.', 'error');
      return;
    }

    setIsSending(true);

    const baseMessage: Omit<MessageInsert, 'recipient_id'> = {
      sender_id: adminUserId,
      content: messageContent.trim(),
      links: links.length > 0 ? links : [],
    };

    try {
      let messagesToInsert: MessageInsert[] = [];

      if (messageType === 'broadcast') {
        if (!Array.isArray(allStudentUsers) || allStudentUsers.length === 0) {
          showToast('No students found to send broadcast to.', 'warning');
          setIsSending(false);
          return;
        }

        messagesToInsert = allStudentUsers.map((profile: StudentUser) => ({
          ...baseMessage,
          recipient_id: profile._id, // Use _id from real data
        }));

      } else {
        const individualMessage: MessageInsert = {
          ...baseMessage,
          recipient_id: recipient,
        };
        messagesToInsert.push(individualMessage);
      }

      const messageSendConfig = {
        headers: {
          Authorization: `Bearer ${authToken}`, // Keeping authentication header
          'Content-Type': 'application/json',
        },
      };

      // Assuming your backend has distinct endpoints for broadcast vs. individual
      if (messageType === 'broadcast') {
          await axios.post(`${API_BASE_URL}/admin/messages/broadcast`, { messages: messagesToInsert }, messageSendConfig);
      } else {
          await axios.post(`${API_BASE_URL}/admin/messages/individual`, messagesToInsert[0], messageSendConfig);
      }

      const recipientName =
        messageType === 'broadcast'
          ? 'all students'
          : allStudentUsers.find(s => s._id === recipient)?.name || 'the selected student';

      showToast(`Message sent successfully to ${recipientName}`, 'success');

      setMessageContent('');
      setLinks([]);
      setNewLinkUrl('');
      setNewLinkText('');

    } catch (error: any) {
      console.error('Frontend: Error sending message:', error);
      showToast(`Failed to send message: ${error.response?.data?.message || error.message || 'Please try again.'}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Helper to correctly set newLinkText
  const setLinkText = (text: string) => setNewLinkText(text);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Admin Dashboard</h1>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <Users size={32} className="opacity-75" />
            <div>
              <p className="text-sm opacity-90 text-white">Total Students</p>
              <p className="text-3xl font-bold text-white">{totalStudents}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <Clock size={32} className="opacity-75" />
            <div>
              <p className="text-sm opacity-90 text-white">Avg. Chatbot Usage (Daily)</p>
              <p className="text-3xl font-bold text-white">{avgChatbotUsageHours.toFixed(1)} hrs</p>
            </div>
          </div>
        </div>

        {/* Message Sending Section */}
        <div className="bg-gray-50 p-8 rounded-xl shadow-md mb-10 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Send className="mr-3 text-blue-600" /> Send Messages
          </h2>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Message Type:</label>
            <div className="flex space-x-4">
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300
                  ${messageType === 'broadcast' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
                onClick={() => setMessageType('broadcast')}
              >
                Broadcast to All Students
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300
                  ${messageType === 'individual' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
                onClick={() => setMessageType('individual')}
              >
                Individual Message
              </button>
            </div>
          </div>

          {messageType === 'individual' && (
            <div className="mb-6">
              <label htmlFor="recipient" className="block text-gray-700 text-sm font-bold mb-2">
                Select Recipient:
              </label>
              <select
                id="recipient"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="">-- Select a student --</option>
                {allStudentUsers.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email}) {/* Showing email for clarity */}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="messageContent" className="block text-gray-700 text-sm font-bold mb-2">
              Message Content:
            </label>
            <textarea
              id="messageContent"
              className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y min-h-[120px]"
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={5}
            ></textarea>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <LinkIcon className="mr-2 text-gray-600" size={20} /> Add Links (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="newLinkUrl" className="block text-gray-700 text-xs font-bold mb-1">
                  URL:
                </label>
                <input
                  type="url"
                  id="newLinkUrl"
                  className="block w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="newLinkText" className="block text-gray-700 text-xs font-bold mb-1">
                  Display Text:
                </label>
                <input
                  type="text"
                  id="newLinkText"
                  className="block w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Click here for more info"
                  value={newLinkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
            </div>
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center text-sm font-medium shadow-sm"
              onClick={handleAddLink}
            >
              <LinkIcon size={18} className="mr-2" /> Add Link
            </button>

            {links.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm font-bold mb-2">Added Links:</p>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate mr-4">
                        {link.text} ({link.url})
                      </a>
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-medium"
                        onClick={() => handleRemoveLink(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition-all duration-300 flex items-center justify-center
              ${isSending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}
            `}
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send size={24} className="mr-3" /> Send Message
              </>
            )}
          </button>
        </div>

        {/* Charts and Analytics Section (only Student Activity) */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">New Students Joined (Monthly)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentActivityChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-sm text-gray-600" />
                <YAxis axisLine={false} tickLine={false} className="text-sm text-gray-600" />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="students" fill="#7ED321" name="Students" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component to wrap everything
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminMessages />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
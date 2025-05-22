import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Send, Link as LinkIcon, Loader2 } from 'lucide-react';

// Define types for data fetched from your backend
interface StudentProfile {
  _id: string; // MongoDB uses _id by default, could be ObjectId or a string UUID if you store it that way
  name: string | null;
}

// Define a type for the message data to be sent to your backend
interface MessageInsert {
  sender_id: string;
  recipient_id: string | null; // UUID from auth.users (student), or null for broadcast
  content: string;
  links?: { url: string; text: string }[];
}

// !!! IMPORTANT: Replace with your actual backend API base URL !!!
const YOUR_BACKEND_API_BASE_URL = 'http://localhost:5000/api'; // Example: your Node.js/Express backend

const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const adminUserId = currentUser?.id; // Assuming currentUser.id is the UUID from your auth system

  const [messageType, setMessageType] = useState<'broadcast' | 'individual'>('broadcast');
  const [recipient, setRecipient] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [links, setLinks] = useState<{ url: string; text: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkText, setNewLinkText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [studentsList, setStudentsList] = useState<StudentProfile[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setStudentsError(null);
      try {
        console.log('AdminMessages: Fetching student list from backend API...');
        // Make a GET request to your backend to get students
        const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/students`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch student list from backend.');
        }
        const data: StudentProfile[] = await response.json(); // Assuming your backend returns an array of StudentProfile

        setStudentsList(data);
        console.log(`AdminMessages: Successfully fetched ${data.length} student profile(s).`, data);
        if (messageType === 'individual' && data.length > 0) {
          setRecipient(data[0]._id); // Pre-select the first student's ID (which would be _id from MongoDB)
        }
      } catch (err: any) {
        console.error('AdminMessages: Error fetching student list:', err);
        setStudentsError(`Failed to load students: ${err.message || 'Unknown error'}`);
        setStudentsList([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [messageType]); // Added messageType to dependencies to refetch when type changes, useful if student list depends on broadcast vs individual

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

    if (messageType === 'broadcast' && studentsList.length === 0) {
      showToast('No students found to send broadcast to.', 'warning');
      return;
    }

    if (isLoadingStudents || studentsError) {
      showToast('Student list is still loading or has an error. Please wait or refresh.', 'info');
      return;
    }

    if (!adminUserId) {
      console.error('Admin user ID not available in useAuth. User might not be logged in.');
      showToast('Admin user not identified. Please log in.', 'error');
      return;
    }

    console.log('handleSendMessage: Recipient ID state value:', recipient);
    setIsSending(true);

    try {
      const messagePayload: MessageInsert = {
        sender_id: adminUserId,
        recipient_id: messageType === 'individual' ? recipient : null, // Set to null for broadcast
        content: messageContent.trim(),
        links: links.length > 0 ? links : [],
      };

      console.log('handleSendMessage: Sending payload to backend:', messagePayload);

      const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You'd typically send an Authorization header with a token here
          // 'Authorization': `Bearer ${currentUser.token}` // Assuming your AuthContext provides a token
        },
        body: JSON.stringify(messagePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message via backend API.');
      }

      const responseData = await response.json();
      console.log('AdminMessages: Message sent successfully (backend response):', responseData);

      const recipientName = messageType === 'broadcast'
        ? 'all students'
        : studentsList.find(s => s._id === recipient)?.name || 'the selected student';

      showToast(`Message sent successfully to ${recipientName}`, 'success');

      setMessageContent('');
      setLinks([]);
      setNewLinkUrl('');
      setNewLinkText('');

    } catch (error: any) {
      console.error('AdminMessages: Error sending message:', error);
      showToast(`Failed to send message: ${error.message || 'Please try again.'}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Message Center</h1>
        <p className="text-neutral-600">Send messages and share resources with students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">New Message</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Message Type
                </label>
                <div className="flex gap-4">
                  <button
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      messageType === 'broadcast'
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setMessageType('broadcast')}
                    disabled={isSending}
                  >
                    Broadcast to All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      messageType === 'individual'
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setMessageType('individual')}
                    disabled={isSending}
                  >
                    Individual Student
                  </button>
                </div>
              </div>

              {messageType === 'individual' && (
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Recipient
                  </label>
                  {isLoadingStudents ? (
                    <div className="flex items-center text-neutral-600">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Loading students...
                    </div>
                  ) : studentsError ? (
                    <div className="text-error-600">{studentsError}</div>
                  ) : studentsList.length === 0 ? (
                    <div className="text-neutral-500">No students found.</div>
                  ) : (
                    <select
                      id="recipient"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="input"
                      disabled={isSending || studentsList.length === 0}
                    >
                      <option value="">Select a student</option>
                      {studentsList.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name || `User ID: ${student._id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="messageContent" className="block text-sm font-medium text-neutral-700 mb-2">
                  Message Content
                </label>
                <textarea
                  id="messageContent"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="input min-h-32"
                  placeholder="Enter your message here..."
                  disabled={isSending}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    Add Links (Optional)
                  </label>
                </div>

                <div className="space-y-3 mb-4">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1 bg-neutral-50 p-2 rounded-lg border border-neutral-200 text-sm flex items-center">
                        <LinkIcon size={14} className="text-neutral-500 mr-2" />
                        <span className="line-clamp-1 flex-1">{link.text}</span>
                        <span className="text-neutral-400 truncate max-w-40">{link.url}</span>
                      </div>
                      <button
                        className="text-neutral-500 hover:text-error-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleRemoveLink(index)}
                        disabled={isSending}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={newLinkText}
                      onChange={(e) => setNewLinkText(e.target.value)}
                      placeholder="Link text to display"
                      className="input"
                      disabled={isSending}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="url"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="input"
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <button
                      className="btn-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAddLink}
                      disabled={isSending || !newLinkUrl.trim() || !newLinkText.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendMessage}
                  disabled={
                      isSending ||
                      !messageContent.trim() ||
                      (messageType === 'individual' && (!recipient || isLoadingStudents || studentsError || studentsList.length === 0)) ||
                      (messageType === 'broadcast' && (studentsList.length === 0 || isLoadingStudents || studentsError))
                  }
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the AdminMessages layout remains the same */}
        <div>
          <div className="card mb-6">
            <h3 className="font-semibold mb-4">Tips for Effective Communication</h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>Be clear and concise in your messages</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>Include specific action items when needed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>Add links to additional resources</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>Personalize messages for individual students</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>Provide clear deadlines for any requirements</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Message Templates</h3>
            <div className="space-y-3">
              <button
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setMessageContent("Welcome to the Mindset platform! This is where you'll upload your research documents for AI-powered analysis. If you have any questions, feel free to reach out.")}
                disabled={isSending}
              >
                Welcome Message
              </button>
              <button
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setMessageContent("Reminder: The deadline for submitting your research document is this Friday at 5 PM. Please ensure your submissions follow the guidelines provided.")}
                disabled={isSending}
              >
                Deadline Reminder
              </button>
              <button
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setMessageContent("We've scheduled a virtual workshop on research methodologies this Thursday at 3 PM. Attendance is optional but recommended for all students working on their research papers.")}
                disabled={isSending}
              >
                Workshop Announcement
              </button>
              <button
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setMessageContent("Thank you for your recent document submission. I've reviewed the AI analysis and have some additional feedback I'd like to share with you.")}
                disabled={isSending}
              >
                Feedback Introduction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
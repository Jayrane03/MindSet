import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, MessageCircle, User, Loader2 } from 'lucide-react';
// Assuming you have an AuthContext or similar to get the current user and their token
import { useAuth } from '../../contexts/AuthContext'; // ADJUST THIS PATH TO YOUR ACTUAL AUTH CONTEXT LOCATION

// Define types for data fetched from your MongoDB backend
interface Document {
  _id: string; // MongoDB's default _id
  title: string;
  uploadDate: string; // Store as ISO string, parse to Date for display
  status: 'analyzed' | 'analyzing' | 'failed';
}

interface Message {
  _id: string; // MongoDB's default _id
  sender_id: string; // ID of the sender (admin)
  recipient_id: string; // ID of the recipient (student)
  content: string;
  created_at: string; // Store as ISO string, parse to Date for display (equivalent to 'timestamp')
  // links?: { url: string; text: string }[]; // Include if messages have links
}

interface StudentProfile {
  _id: string; // MongoDB's default _id for the user
  name: string;
  email: string;
  avatar?: string; // Optional avatar URL
  documents: Document[]; // Nested array of documents
  messages: Message[]; // Nested array of messages (those sent to this student)
}

// !!! IMPORTANT: Replace with your actual backend API base URL !!!
const YOUR_BACKEND_API_BASE_URL = 'http://localhost:5000/api'; // Example: your Node.js/Express backend

const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'documents'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // New state for fetched data and loading/error
  const [studentsData, setStudentsData] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get currentUser from AuthContext
const { currentUser } = useAuth();
// Assuming useAuth hook provides currentUser

  // Fetch data on component mount
  useEffect(() => {
    const fetchStudentsAndData = async () => {
      setIsLoading(true);
      setError(null);

      // // Check if currentUser or token is available
      // if (!currentUser || !currentUser.token) {
      //   setError('Authentication token not available. Please log in.');
      //   setIsLoading(false);
      //   return;
      // }

      try {
        console.log('AdminStudents: Fetching all student data from backend API...');

        const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/admin/students-data`, {
          method: 'GET', // Or specify 'GET' explicitly if you prefer
          headers: {
            'Content-Type': 'application/json',
           
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch students data from backend.');
        }
        const data: StudentProfile[] = await response.json();
        setStudentsData(data);
        console.log(`AdminStudents: Successfully fetched ${data.length} student records.`, data);
      } catch (err: any) {
        console.error('AdminStudents: Error fetching student data:', err);
        setError(`Failed to load students: ${err.message || 'Unknown error'}`);
        setStudentsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentsAndData();
  }, [currentUser]); // Add currentUser to dependency array so fetch runs when it changes

  const handleSort = (field: 'name' | 'documents') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      // Sort by number of documents
      return sortDirection === 'asc'
        ? a.documents.length - b.documents.length
        : b.documents.length - a.documents.length;
    }
  });

  const toggleExpand = (studentId: string) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Student Management</h1>
        <p className="text-neutral-600">View and manage student accounts, documents, and activity</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 items-start sm:items-center">
          <h2 className="text-xl font-semibold">All Students</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students"
              className="input pl-9 py-2"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-neutral-600 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary-500 mb-3" size={24} />
            Loading student data...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-error-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-3 px-4 text-left font-medium text-neutral-700">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort('name')}
                    >
                      Student
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-700">Email</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-700">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort('documents')}
                    >
                      Documents
                      {sortField === 'documents' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center font-medium text-neutral-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.length > 0 ? (
                  sortedStudents.map((student) => (
                    <React.Fragment key={student._id}>
                      <tr className="border-b border-neutral-200 hover:bg-neutral-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 overflow-hidden">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <User size={18} />
                              )}
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-neutral-700">{student.email}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary-100 text-primary-700 p-1 rounded">
                              <FileText size={16} />
                            </div>
                            <span>{student.documents.length} documents</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              expandedStudent === student._id
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                            onClick={() => toggleExpand(student._id)}
                          >
                            {expandedStudent === student._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                      </tr>

                      {expandedStudent === student._id && (
                        <tr className="bg-neutral-50">
                          <td colSpan={4} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Documents</h4>
                                {student.documents.length > 0 ? (
                                  <div className="space-y-3">
                                    {student.documents.map((doc) => (
                                      <div key={doc._id} className="bg-white p-3 rounded-lg border border-neutral-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-primary-100 p-2 rounded-lg">
                                            <FileText size={16} className="text-primary-700" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm">{doc.title}</p>
                                            <p className="text-xs text-neutral-500">Uploaded {formatDate(doc.uploadDate)}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            doc.status === 'analyzed'
                                              ? 'bg-success-100 text-success-700'
                                              : doc.status === 'analyzing'
                                                ? 'bg-warning-100 text-warning-700'
                                                : 'bg-error-100 text-error-700'
                                          }`}>
                                            {doc.status === 'analyzed'
                                              ? 'Analyzed'
                                              : doc.status === 'analyzing'
                                                ? 'Analyzing'
                                                : 'Failed'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-neutral-600 text-sm">No documents uploaded yet</p>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Message History</h4>
                                {student.messages.length > 0 ? (
                                  <div className="space-y-3">
                                    {student.messages.map((msg) => (
                                      <div key={msg._id} className="bg-white p-3 rounded-lg border border-neutral-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <MessageCircle size={16} className="text-neutral-500" />
                                          <p className="text-sm font-medium">
                                            From Admin
                                          </p>
                                          <span className="text-xs text-neutral-500">
                                            {formatDate(msg.created_at)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-neutral-700 line-clamp-2">
                                          {msg.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-neutral-600 text-sm">No messages in history</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr className="border-b border-neutral-200">
                    <td colSpan={4} className="py-6 text-center">
                      <p className="text-neutral-600">No students found matching "{searchTerm}"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Book, Home, MessageCircle, Users, LogOut, Menu, X, User, BookOpen } from 'lucide-react';
import AdminCourses from '../../pages/admin/AdminCourses';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    // Check if the current path starts with the link path for highlighting parent routes (like /admin for /admin/dashboard)
    // Or if it's an exact match
    if (path === '/admin' && location.pathname.startsWith('/admin')) {
        // Special case for the admin dashboard link, highlight if any admin route is active
        // You might want to adjust this logic based on whether you want only exact match for dashboard
         return location.pathname.startsWith(path);
    }
     if (path === '/student' && location.pathname.startsWith('/student')) {
         // Similar logic for student dashboard
         return location.pathname.startsWith(path);
     }
    // For specific links like /admin/students, check for exact match
    return location.pathname === path;
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <Home size={20} /> },
    // Removed the 'Messages' link as requested
    // { name: 'Messages', path: '/admin/messages', icon: <MessageCircle size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <BookOpen></BookOpen> },
     // Add a link for detailed analytics if you created a separate component for it
     // { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> }, // Example with different icon
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: <Home size={20} /> },
     // Add other student specific links here
     // { name: 'My Documents', path: '/student/documents', icon: <FileText size={20} /> },
     // { name: 'Messages', path: '/student/messages', icon: <MessageCircle size={20} /> },
  ];


  // Determine which set of links to use based on the user's role
  const links = currentUser?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-neutral-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Book size={24} className="text-primary-600" />
              <span className="text-xl font-semibold text-neutral-900">Mindset</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="font-medium text-neutral-800">{currentUser?.name || 'User'}</p>
              <p className="text-sm text-neutral-500 capitalize">{currentUser?.role || 'Guest'}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              {currentUser?.avatar_url ? ( // Use avatar_url based on typical Supabase schema
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name || 'User Avatar'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-sm">
          <nav className="p-4 flex flex-col h-full">
            <div className="space-y-1 flex-1">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-neutral-100 rounded-lg mt-auto"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-64 h-full" onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Book size={24} className="text-primary-600" />
                    <span className="text-xl font-semibold text-neutral-900">Mindset</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                    <X size={24} className="text-neutral-500" />
                  </button>
                </div>

                {/* Mobile User Info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    {currentUser?.avatar_url ? ( // Use avatar_url
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.name || 'User Avatar'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{currentUser?.name || 'User'}</p>
                    <p className="text-sm text-neutral-500 capitalize">{currentUser?.role || 'Guest'}</p>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  {links.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setMobileMenuOpen(false); // Close menu on link click
                      }}
                      className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  ))}

                  {/* Mobile Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-neutral-100 rounded-lg mt-6"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}


        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Add container and animation back if desired */}
          <div className="container mx-auto animate-fade-in">
            {children} {/* This is where the actual page content (Dashboard, Students, etc.) is rendered */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
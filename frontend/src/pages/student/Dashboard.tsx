import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import type { StudentUser } from '../../types'; // Ensure StudentUser type is correctly defined here
import { Bot, X, ChevronRight, HelpCircle, ArrowLeft, MessageCircle, BookOpen } from 'lucide-react'; // Added MessageCircle
import ChatBot from '../../components/student/ChatBot';
import StudentMessages from "../student/StudentMessages"; // IMPORT YOUR NEW COMPONENT
import StudentCourse from "./StudentCourse"; // IMPORT YOUR NEW COMPONENT
const StudentDashboard: React.FC = () => {
  // const { currentUser } = useAuth();
  // We no longer need to assert `currentUser` as `StudentUser` here
  // unless you have other student-specific properties used directly in this file.
  // For `StudentMessages`, it will handle its own `currentUser` checks.
 const [activeTab, setActiveTab] = useState('articles'); 
  const [showChatBot, setShowChatBot] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

 const tabs = [
    {
      id: 'articles',
      label: 'AI Articles',
      icon: null, // No icon for articles
      onClick: () => {
        setActiveTab('articles');
        setSelectedArticle(null); // Reset selected article when going back to articles
      },
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle size={18} />, // MessageCircle icon for messages
      onClick: () => {
        setActiveTab('messages');
      },
      // You could add a badge property here if needed, e.g., unreadCount: 5
    },
    {
      id: 'courses',// BookOpen icon for courses
      label: 'Courses',
      icon: <BookOpen size={18} />, // Example: add an icon if you have one for courses
      onClick: () => {
        setActiveTab('courses');
      },
      
    },
  ];
  // AI Articles Data (unchanged)
  const aiArticles = [
    // ... your aiArticles data (keep them here as they belong to this dashboard)
    {
        id: 1,
        title: "Understanding AI Assistants in Education",
        excerpt: "Learn how AI assistants are transforming the way students interact with educational content and manage their studies.",
        category: "AI Basics",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        content: `
          <h2 class="text-2xl font-bold mb-4">The Rise of AI in Education</h2>
          <p class="mb-4">Artificial Intelligence has revolutionized the educational landscape, offering personalized learning experiences that adapt to individual student needs. AI assistants can now provide instant feedback, answer questions, and even predict learning challenges before they arise.</p>

          <h3 class="text-xl font-semibold mb-3">Key Benefits</h3>
          <ul class="list-disc pl-5 mb-4 space-y-2">
            <li>24/7 availability for learning support</li>
            <li>Personalized learning paths based on performance</li>
            <li>Instant feedback on assignments and quizzes</li>
            <li>Reduced administrative burden for educators</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3">Implementation in Classrooms</h3>
          <p class="mb-4">Many institutions are now integrating AI assistants into their learning management systems. These tools help students with:</p>
          <ol class="list-decimal pl-5 mb-4 space-y-2">
            <li>Research and citation assistance</li>
            <li>Grammar and writing improvement</li>
            <li>Concept explanation and problem solving</li>
            <li>Study schedule optimization</li>
          </ol>

          <p class="mb-4">As AI continues to evolve, we can expect even more sophisticated educational tools that will further enhance the learning experience for students worldwide.</p>
        `
      },
      {
        id: 2,
        title: "Maximizing Your AI Assistant's Potential",
        excerpt: "Discover advanced techniques to get the most out of your educational AI assistant for better learning outcomes.",
        category: "Advanced Tips",
        readTime: "7 min read",
        image: "/images.jpg",
        content: `
          <h2 class="text-2xl font-bold mb-4">Getting the Most from Your AI Assistant</h2>
          <p class="mb-4">While basic queries work well with AI assistants, there are several advanced techniques that can significantly improve the quality of responses you receive.</p>

          <h3 class="text-xl font-semibold mb-3">Prompt Engineering</h3>
          <p class="mb-4">The way you phrase your questions dramatically affects the results. Try these techniques:</p>
          <ul class="list-disc pl-5 mb-4 space-y-2">
            <li>Provide context before asking your question</li>
            <li>Specify the format you want the answer in</li>
            <li>Ask the assistant to think step-by-step</li>
            <li>Request multiple perspectives on complex topics</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3">Customization Options</h3>
          <p class="mb-4">Many AI assistants allow for some level of personalization:</p>
          <ol class="list-decimal pl-5 mb-4 space-y-2">
            <li>Set your knowledge level (beginner, intermediate, advanced)</li>
            <li>Specify preferred learning styles (visual, auditory, etc.)</li>
            <li>Adjust the verbosity of responses</li>
            <li>Save frequently used prompts</li>
          </ol>

          <p class="mb-4">By mastering these advanced techniques, you can transform your AI assistant from a simple question-answering tool into a powerful personalized learning companion.</p>
        `
      },
  ];

  // Check if user has seen tutorial before
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('chatbotTutorialSeen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    localStorage.setItem('chatbotTutorialSeen', 'true');
    setHasSeenTutorial(true);
  };

  const tutorialSteps = [
    {
      title: "Welcome to the AI Assistant!",
      content: "This tool helps you get answers to your academic questions and provides intelligent assistance.",
      position: "center"
    },
    {
      title: "Asking Questions",
      content: "Type your questions in natural language and get detailed, well-researched answers instantly.",
      position: "bottom-right"
    },
    {
      title: "Learning Resources",
      content: "The assistant can recommend articles and resources based on your interests and study needs.",
      position: "center"
    }
  ];

  const handleReadArticle = (articleId: number) => {
    setSelectedArticle(articleId);
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  // --- REMOVE THE MESSAGE FETCHING useEffect and useCallback as StudentMessages will handle it ---
  // const fetchStudentMessages = useCallback(...)
  // useEffect(() => { ... }, [activeTab, fetchStudentMessages]);
  // -------------------------------------------------------------------------------------------------

  return (
    <div className="relative">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={completeTutorial}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold">{tutorialSteps[tutorialStep].title}</h3>
            </div>

            <p className="text-gray-700 mb-6">{tutorialSteps[tutorialStep].content}</p>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Step {tutorialStep + 1} of {tutorialSteps.length}
              </div>

              <div className="flex gap-2">
                {tutorialStep > 0 && (
                  <button
                    onClick={() => setTutorialStep(tutorialStep - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}

                {tutorialStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={completeTutorial}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Finish Tutorial
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      {!showTutorial && !hasSeenTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="fixed bottom-6 left-6 bg-white p-3 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-gray-50 transition-colors"
          aria-label="Show tutorial"
        >
          <HelpCircle className="text-blue-600" size={24} />
        </button>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-neutral-600">Explore AI resources and messages</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-6">
           {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={tab.onClick}
        >
          <div className="flex items-center gap-2">
            {tab.icon} {/* Render icon if it exists */}
            {tab.label}
            {/* Optional: Add a badge based on a tab.badge property if you extend your tab data */}
            {/* {tab.badge && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{tab.badge}</span>} */}
          </div>
        </button>
      ))}
          </div>
        </div>
      </div>
        
      {activeTab === 'articles' && (
        <div>
          {selectedArticle === null ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">AI Learning Resources</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <HelpCircle size={18} />
                    <span>How to use</span>
                  </button>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => setShowChatBot(true)}
                  >
                    <Bot size={18} />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiArticles.map((article) => (
                  <div key={article.id} className="card hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                      <button
                        onClick={() => handleReadArticle(article.id)}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-800"
                      >
                        Read article <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={handleBackToArticles}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-4"
              >
                <ArrowLeft size={18} />
                <span>Back to articles</span>
              </button>

              <div className="px-6 pb-8">
                {(() => {
                  const article = aiArticles.find(a => a.id === selectedArticle);
                  if (!article) return null;

                  return (
                    <>
                      <div className="h-64 w-full mb-6 overflow-hidden rounded-lg">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-sm text-gray-500">{article.readTime}</span>
                      </div>

                      <h1 className="text-2xl font-bold mb-6">{article.title}</h1>

                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        // RENDER YOUR NEW STUDENTMESSAGES COMPONENT HERE
        <StudentMessages />
      )}
       {activeTab === 'courses' && (
        // RENDER YOUR NEW STUDENTMESSAGES COMPONENT HERE
        <StudentCourse />
      )}


      {/* Enhanced ChatBot Positioning */}
      {showChatBot && (
        <div className="fixed bottom-6 right-6 z-30">
          <ChatBot onClose={() => setShowChatBot(false)} />
        </div>
      )}

      {/* Quick Help Panel */}
      {!showChatBot && selectedArticle === null && (
        <div className="fixed bottom-6 right-6 z-20">
          <div
            className="bg-white rounded-xl shadow-lg p-4 w-64 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setShowChatBot(true)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Bot className="text-blue-600" size={20} />
              </div>
              <h4 className="font-medium text-gray-900">Need academic help?</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Our AI Assistant can answer your questions and recommend learning resources.</p>
            <button className="text-sm text-blue-600 font-medium flex items-center gap-1">
              Try it now <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
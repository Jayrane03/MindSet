import React from 'react';
import { Link } from 'react-router-dom';
import { Book, GraduationCap, Brain, FileText, Bot, ArrowRight, CheckCircle, Users, MessageCircle, BarChart2, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Book size={32} className="text-primary-600" />
              <span className="text-2xl font-bold text-neutral-900">Mindset</span>
            </div>
            <div className="flex items-center gap-3">
              {currentUser ? (
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : '/student'}
                  className="btn-primary"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-outline"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="btn-primary"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 bg-gradient-to-br from-primary-600 to-secondary-700">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your Learning with AI-Powered Document Analysis
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Upload your documents and let our AI assistant help you understand, analyze, and learn from them effectively.
            </p>
            <Link
              to="/login"
              className="btn-primary bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        <div className="h-16 bg-white transform -skew-y-3 origin-top-right"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features for Enhanced Learning
          </h2>
          <p className="text-xl text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with intuitive tools to revolutionize your learning experience.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-neutral-600">
                Advanced AI algorithms analyze your documents to extract key insights and generate comprehensive summaries.
              </p>
            </div>

            <div className="card text-center p-8 hover:shadow-lg transition-shadow">
              <div className="bg-secondary-100 text-secondary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Document Management</h3>
              <p className="text-neutral-600">
                Easily upload, organize, and access your educational materials in one centralized platform.
              </p>
            </div>

            <div className="card text-center p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Assistant</h3>
              <p className="text-neutral-600">
                Interactive AI chatbot that answers questions and helps you understand your documents better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose Mindset?
          </h2>
          <p className="text-xl text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            Experience the advantages of our AI-powered educational platform.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={24} />,
                title: "Fast Analysis",
                description: "Get instant insights from your documents with our advanced AI processing."
              },
              {
                icon: <Shield size={24} />,
                title: "Secure Platform",
                description: "Your documents are protected with enterprise-grade security measures."
              },
              {
                icon: <Users size={24} />,
                title: "Collaborative Learning",
                description: "Share insights and learn together with fellow students and educators."
              },
              {
                icon: <BarChart2 size={24} />,
                title: "Detailed Analytics",
                description: "Track your learning progress with comprehensive analytics and reports."
              },
              {
                icon: <MessageCircle size={24} />,
                title: "24/7 AI Support",
                description: "Get answers to your questions anytime with our AI assistant."
              },
              {
                icon: <CheckCircle size={24} />,
                title: "Easy Integration",
                description: "Seamlessly integrate with your existing learning workflow."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-neutral-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-secondary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Documents Analyzed" },
              { number: "10K+", label: "Active Users" },
              { number: "95%", label: "Satisfaction Rate" },
              { number: "24/7", label: "AI Availability" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using Mindset to enhance their educational journey.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-outline text-lg px-8 py-4"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Sign In
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Book size={32} className="text-primary-500" />
            <span className="text-2xl font-bold">Mindset</span>
          </div>
          <p className="text-center text-neutral-400">
            © {new Date().getFullYear()} Mindset Educational Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
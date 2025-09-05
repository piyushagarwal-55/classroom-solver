import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../hooks/useAssignments';
import GoogleAuthButton from '../components/GoogleAuthButton';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  courseId: string;
  courseName?: string;
  state: string;
  maxPoints?: number;
  formattedDueDate: string;
  formattedDueTime: string;
  isOverdue: boolean;
  daysUntilDue: number | null;
}

const Dashboard: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    assignments,
    loading,
    error,
    isGoogleLinked,
    totalAssignments,
    totalCourses,
    overdueCount,
    refresh
  } = useAssignments();

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle URL parameters from Google OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const googleAuth = searchParams.get('google_auth');
    const token = searchParams.get('token');

    if (googleAuth === 'success' && token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);
      // Trigger auth context to check and update user state
      checkAuth();
      setSuccessMessage('Google Classroom connected successfully!');
      refresh(); // Refresh assignments after successful connection
      // Clear URL parameters
      setSearchParams({});
    } else if (connected === 'true') {
      setSuccessMessage('Google Classroom connected successfully!');
      refresh(); // Refresh assignments after successful connection
      // Clear URL parameters
      setSearchParams({});
    }

    if (error) {
      const errorMessages: { [key: string]: string } = {
        'oauth_error': 'Google OAuth authorization was denied',
        'no_code': 'No authorization code received from Google',
        'auth_failed': 'Google authentication failed'
      };
      setErrorMessage(errorMessages[error] || `Google authentication error: ${error}`);
      // Clear URL parameters
      setSearchParams({});
    }

    // Clear messages after 5 seconds
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams, refresh, successMessage, errorMessage, checkAuth]);

  // Update stats when assignments change
  useEffect(() => {
    // Stats will be automatically updated through the hook
  }, [assignments]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.isOverdue) {
      return 'text-red-300 bg-red-500/20 border border-red-500/30';
    }
    
    switch (assignment.state) {
      case 'TURNED_IN':
        return 'text-green-300 bg-green-500/20 border border-green-500/30';
      case 'CREATED':
        return 'text-blue-300 bg-blue-500/20 border border-blue-500/30';
      case 'ASSIGNED':
        return 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30';
      default:
        return 'text-slate-300 bg-slate-500/20 border border-slate-500/30';
    }
  };

  const getPriorityColor = (assignment: Assignment) => {
    if (assignment.isOverdue) {
      return 'border-red-500';
    }
    
    if (assignment.daysUntilDue !== null) {
      if (assignment.daysUntilDue <= 1) return 'border-red-500';
      if (assignment.daysUntilDue <= 3) return 'border-yellow-500';
      return 'border-green-500';
    }
    
    return 'border-slate-500';
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.isOverdue) return 'Overdue';
    
    switch (assignment.state) {
      case 'TURNED_IN': return 'Submitted';
      case 'CREATED': return 'In Progress';
      case 'ASSIGNED': return 'Assigned';
      default: return 'Unknown';
    }
  };

  const handleGoogleAuthSuccess = (user: any) => {
    // Refresh assignments after successful authentication
    refresh();
  };

  const handleGoogleAuthError = (error: string) => {
    console.error('Google authentication failed:', error);
  };

  // If Google Classroom is not linked, show connection prompt
  if (!isGoogleLinked && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto p-8"
        >
          <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Connect Google Classroom</h2>
            <p className="text-slate-400 mb-8">
              To view your assignments, please connect your Google Classroom account. This will allow us to fetch your real assignment data.
            </p>
            
            <GoogleAuthButton
              onSuccess={handleGoogleAuthSuccess}
              onError={handleGoogleAuthError}
              className="w-full"
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 mx-6 pt-6 pb-4 px-4 rounded-b-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Assignment Solver</h1>
              <p className="text-slate-400 text-sm">Welcome back, {user?.firstName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <BellIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <CogIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={logout}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        className="relative z-10 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
          >
            <p className="text-green-300 text-center">{successMessage}</p>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <p className="text-red-300 text-center">{errorMessage}</p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Assignments</p>
                <p className="text-3xl font-bold text-white">{totalAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white">{assignments.filter(a => a.state === 'TURNED_IN').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-white">{assignments.filter(a => a.state === 'ASSIGNED').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-white">{overdueCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Courses</p>
                <p className="text-3xl font-bold text-white">{totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignments List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Assignments</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={refresh}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 text-sm rounded-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 text-sm rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <PlusIcon className="w-4 h-4" />
                    <span>New Assignment</span>
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-slate-400">Loading assignments...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-300 mb-4">{error}</p>
                  <button
                    onClick={refresh}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No assignments found</p>
                  <p className="text-slate-500 text-sm">Your Google Classroom assignments will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.slice(0, 6).map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-slate-800/50 border-l-4 ${getPriorityColor(assignment)} rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {assignment.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment)}`}>
                              {getStatusText(assignment)}
                            </span>
                            {assignment.isOverdue && (
                              <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs font-medium text-red-300">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                            {assignment.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <BookOpenIcon className="w-4 h-4" />
                              <span>Course ID: {assignment.courseId}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {assignment.dueDate 
                                  ? `Due ${assignment.formattedDueDate}${assignment.dueTime ? ` at ${assignment.formattedDueTime}` : ''}`
                                  : 'No due date'
                                }
                              </span>
                            </span>
                            {assignment.maxPoints && (
                              <span className="flex items-center space-x-1">
                                <span>Points: {assignment.maxPoints}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {assignments.length > 6 && (
                    <div className="text-center pt-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        View all {assignments.length} assignments →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions & AI Assistant */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Solve Assignment</p>
                      <p className="text-sm opacity-80">Get AI-powered solutions</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Upload Document</p>
                      <p className="text-sm opacity-80">Scan & analyze assignments</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">View Analytics</p>
                      <p className="text-sm opacity-80">Track your progress</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">AI Assistant</h3>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <p className="text-white text-sm mb-2">
                      I'm ready to help you solve your assignments! Upload a document or describe your problem.
                    </p>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      Start conversation →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Completed Shakespeare Essay</span>
                  <span className="text-slate-500 ml-auto">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Started Biology Lab Report</span>
                  <span className="text-slate-500 ml-auto">5h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300">Uploaded Math Assignment</span>
                  <span className="text-slate-500 ml-auto">1d ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

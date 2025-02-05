import React, { useState } from 'react';
import Dialog from './Dialog';
import { Tabs, TabsList, TabTrigger, TabContent } from './Tabs';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

const LoginModalContent = ({ isOpen, onClose, onSignUpClick }) => {
  const [activeTab, setActiveTab] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      role: activeTab
    };

    try {
      const response = await axios.post('http://localhost:3001/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      if (response.data && response.data.token) {
        const { user, token } = response.data;
        const userInfo = {
          email: user.email,
          username: user.username,
          token,
          avatar: user.avatar,
          role: activeTab,
          _id: user._id
        };
        
        localStorage.setItem('user-info', JSON.stringify(userInfo));
        onClose();
        // Redirect based on role
        if (activeTab === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      console.error('Login error:', error);
    }
  };

  const googleAuth = async (code) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/auth/google?code=${code}&role=${activeTab}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        
        if (result.data && result.data.token) {
          const { email, username, avatar, _id } = result.data.user;
          const token = result.data.token;
          const userInfo = { 
            email, 
            username, 
            token, 
            avatar,
            role: activeTab,
            _id
          };
          
          localStorage.setItem('user-info', JSON.stringify(userInfo));
          onClose();
          // Redirect based on role
          if (activeTab === 'teacher') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          throw new Error('No token received from server');
        }
      } else {
        throw new Error('No authorization code present');
      }
    } catch (e) {
      console.error('Error during Google Login:', e);
      setError(e.message || 'Failed to login with Google');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error('Google Login Error:', error);
    },
    flow: "auth-code",
    scope: "email profile",
    redirect_uri: window.location.origin,
  });

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {error && (
        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
          Welcome to QuickLearnAI
        </h2>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <TabTrigger value="student" selected={activeTab === 'student'} onClick={() => setActiveTab('student')}>
            Student
          </TabTrigger>
          <TabTrigger value="teacher" selected={activeTab === 'teacher'} onClick={() => setActiveTab('teacher')}>
            Teacher
          </TabTrigger>
        </TabsList>

        <TabContent value="student" selected={activeTab === 'student'}>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email and Password fields */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex justify-between items-center">
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-colors"
            >
              Login as Student
            </button>
            
            {/* Google Login Button */}
            <div className="text-center">
              <button
                onClick={googleLogin}
                type="button"
                className="w-full py-2 px-4 bg-white text-gray-800 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  onClose();
                  onSignUpClick();
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                Sign up
              </button>
            </div>
          </form>
        </TabContent>

        <TabContent value="teacher" selected={activeTab === 'teacher'}>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex justify-between items-center">
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-colors"
            >
              Login as Teacher
            </button>
            
            {/* Google Login Button */}
            <div className="text-center">
              <button
                onClick={googleLogin}
                type="button"
                className="w-full py-2 px-4 bg-white text-gray-800 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  onClose();
                  onSignUpClick();
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                Sign up
              </button>
            </div>
          </form>
        </TabContent>
      </Tabs>
    </Dialog>
  );
};

// Wrapper component that provides Google OAuth context
const LoginModal = (props) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginModalContent {...props} />
    </GoogleOAuthProvider>
  );
};

export default LoginModal;


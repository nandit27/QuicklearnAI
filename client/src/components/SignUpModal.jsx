import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Dialog from './Dialog';
import { Tabs, TabsList, TabTrigger, TabContent } from './Tabs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.role = activeTab;

    // Generate avatar URL using username
    data.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}`;

    try {
      const response = await axios.post('http://localhost:3001/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      // Store user info in localStorage
      localStorage.setItem('user-info', JSON.stringify(response.data));
      
      // Close modal and redirect
      onClose();
      if (activeTab === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }
      
      // Trigger page reload to update UI
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      console.error('Registration error:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
          Create Your Account
        </h2>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <TabTrigger value="student" selected={activeTab === 'student'} onClick={setActiveTab}>
            Student
          </TabTrigger>
          <TabTrigger value="teacher" selected={activeTab === 'teacher'} onClick={setActiveTab}>
            Teacher
          </TabTrigger>
        </TabsList>

        <TabContent value="student" selected={activeTab === 'student'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Student Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="1234567890"
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Student Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Student Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-colors"
            >
              Sign Up as Student
            </button>
          </form>
        </TabContent>

        <TabContent value="teacher" selected={activeTab === 'teacher'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Teacher Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                placeholder="Dr. Jane Smith"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Teacher Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="teacher@example.com"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Teacher Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="1234567890"
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Highest Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Highest Qualification
              </label>
              <select
                name="highestQualification"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Qualification</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">Ph.D.</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Certificate Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Certificate
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate"
                  required
                />
                <label
                  htmlFor="certificate"
                  className="flex items-center gap-2 w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">
                    {fileName || 'Upload Certificate (PDF, JPG, PNG)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Teaching Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Teaching Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                max="50"
                placeholder="5"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Preferred Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Preferred Subject
              </label>
              <select
                name="subject"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Subject</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="computer_science">Computer Science</option>
                <option value="english">English</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-[#1a2234] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-colors"
            >
              Sign Up as Teacher
            </button>
          </form>
        </TabContent>
      </Tabs>
      <div className="text-center text-sm text-gray-400 mt-4">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-purple-400 hover:text-purple-300"
        >
          Log in
        </button>
      </div>
    </Dialog>
  );
};

export default SignUpModal;
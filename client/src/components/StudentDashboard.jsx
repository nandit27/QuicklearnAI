import React from 'react';
import { Menu } from 'lucide-react';

const StudentDashboard = () => {
  const sampleTopics = [
    'Introduction to AI',
    'Machine Learning Basics',
    'Neural Networks',
    'Deep Learning',
    'Natural Language Processing',
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20">
      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 min-h-screen border-r border-gray-800">
          <div className="p-4">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
              LOGO
            </div>
            <h3 className="text-lg font-semibold mb-4">Previous Topics</h3>
            <nav>
              {sampleTopics.map((topic, index) => (
                <button
                  key={index}
                  className="w-full text-left py-2 px-3 rounded hover:bg-gray-800 mb-2 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Section */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>

            {/* Content Area */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Topic</h2>
              <div className="space-y-4">
                <p className="text-gray-300">Something Displayable</p>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-12 bg-gray-800 rounded" />
                  ))}
                </div>
                <button className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  Submit
                </button>
              </div>
            </div>

            {/* Progress Table */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-lg" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Your Progress</h3>
                  <p className="text-gray-400">Track your learning journey</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">Topic</th>
                      <th className="text-left py-3 px-4">URL</th>
                      <th className="text-left py-3 px-4">Score in Quiz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTopics.map((topic, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 px-4">{topic}</td>
                        <td className="py-3 px-4">topic-{index + 1}</td>
                        <td className="py-3 px-4">{Math.floor(Math.random() * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
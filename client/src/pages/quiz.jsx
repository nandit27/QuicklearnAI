import React, { useState } from 'react';
import { Youtube } from 'lucide-react';
import QuizResponsePage from './QuizResponsePage'; // Import the quiz response component
import { useNavigate } from 'react-router-dom';

const QuizGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  
  // Form state
  const [youtubeLink, setYoutubeLink] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty.toLowerCase());
    setIsDropdownOpen(false);
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!youtubeLink) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYoutubeUrl(youtubeLink)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (!selectedDifficulty) {
      setError('Please select a difficulty level');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: youtubeLink,
          qno: questionCount,
          difficulty: selectedDifficulty,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuizData(data);
      
    } catch (error) {
      setError('Failed to generate quiz. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // If quiz data is available, show the quiz response page
  if (quizData) {
    return <QuizResponsePage quizData={quizData} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-white mt-12">
            Quick<span className="text-[#00FF9D]">Learn</span>AI
          </h1>
          <p className="text-xl text-gray-400">
            AI Powered YouTube Quiz Generator
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <h2 className="text-2xl font-semibold text-center mb-8 text-[#00FF9D]">
            Create Your Quiz
          </h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube Link Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                YouTube Video Link
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9D]/50 focus:ring-2 focus:ring-[#00FF9D]/20 transition-all duration-300"
                />
                <Youtube className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Number of Questions
              </label>
              <input 
                type="number" 
                min="1" 
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9D]/50 focus:ring-2 focus:ring-[#00FF9D]/20 transition-all duration-300"
              />
            </div>

            {/* Difficulty Level Dropdown */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-400">
                Difficulty Level
              </label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-left text-white hover:border-[#00FF9D]/50 hover:ring-2 hover:ring-[#00FF9D]/20 transition-all duration-300"
              >
                {selectedDifficulty || 'Select difficulty'}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute w-full mt-1 bg-black/90 border border-white/10 rounded-xl overflow-hidden z-10">
                  {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => handleDifficultySelect(difficulty)}
                      className="w-full px-4 py-3 text-left hover:bg-[#00FF9D]/10 hover:text-[#00FF9D] transition-all duration-300"
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 hover:border-[#00FF9D]/50 transition-all duration-300 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00FF9D] mr-2"></div>
                  Generating Quiz...
                </div>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
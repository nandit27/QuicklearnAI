import React, { useState } from 'react';
import { Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizDisplay from '../components/QuizDisplay';
import { quizService } from '../services/api';
import FlashCard from '../components/FlashCard';
import { useToast } from "@/components/ui/use-toast";
import { statisticsService } from '../services/api';

const QuizGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
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
      const response = await quizService.generateQuiz(
        youtubeLink,
        questionCount,
        selectedDifficulty
      );
      
      console.log('Quiz Response:', response);
      
      if (!response || !response.quiz || !response.summary) {
        throw new Error('Invalid quiz data format');
      }
      
      setQuizData({
        quiz: response.quiz,
        userAnswers: new Array(response.quiz.length).fill(null)
      });
      setSummaryData(response.summary);
      setShowSummary(true);
      
    } catch (error) {
      setError(error.message || 'Failed to generate quiz. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowSummary(false);
    setShowQuiz(true);
  };

  const handleQuizFinish = async (score, timeSpent, userAnswers) => {
    setQuizStats({
      score,
      totalQuestions: quizData.quiz.length,
      timeSpent,
      questions: quizData.quiz,
      userAnswers: userAnswers
    });

    try {
      // Log the data being sent
      const statisticsData = {
        pasturl: youtubeLink,
        score: score,
        totalscore: quizData.quiz.length,
        topic: summaryData.title || 'General Knowledge',
        student: 'Nandit'
      };
      console.log('Sending statistics data:', statisticsData);

      const response = await statisticsService.storeStatistics(statisticsData);
      console.log('Statistics stored successfully:', response);
      
      toast({
        title: "Success",
        description: "Quiz results saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to store quiz statistics:', error.response?.data || error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
    }

    setShowStats(true);
    setShowQuiz(false);
  };

  // Add this function to handle summary regeneration
  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      const response = await quizService.generateQuiz(
        youtubeLink,
        questionCount,
        selectedDifficulty
      );
      
      if (!response || !response.summary) {
        throw new Error('Invalid summary data format');
      }
      
      setSummaryData(response.summary);
      
    } catch (error) {
      setError(error.message || 'Failed to regenerate summary. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show quiz if active
  if (showQuiz && quizData) {
    return <QuizDisplay 
      quizData={quizData}
      onFinish={handleQuizFinish} 
    />;
  }

  // Show summary if available
  if (showSummary && summaryData) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Video <span className="text-[#00FF9D]">Summary</span>
            </h1>
            <p className="text-gray-400">
              Here's what we learned from the video
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {Object.entries(summaryData).map(([key, value]) => (
              <FlashCard 
                key={key}
                title={key}
                content={value}
              />
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setShowSummary(false)}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300"
            >
              Back to Quiz Generator
            </button>
            <button
              onClick={handleStartQuiz}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300"
            >
              Start Quiz
            </button>
            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00FF9D] mr-2"></div>
                  Regenerating...
                </div>
              ) : (
                'Regenerate Summary'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show stats if available
  if (showStats && quizStats) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h2 className="text-6xl font-bold mb-4">
              YOUR SCORE: <span className="text-[#00FF9D]">{quizStats.score}/{quizStats.totalQuestions}</span>
            </h2>
            <p className="text-2xl text-gray-400">
              Time utilised: {quizStats.timeSpent}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-4 text-xl font-bold">
              <div>Questions</div>
              <div>Your Answer</div>
              <div>Correct Answer</div>
            </div>
            
            {quizStats.questions.map((question, index) => (
              <div 
                key={index}
                className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
                  quizStats.userAnswers[index] === question.answer 
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div>{question.question}</div>
                <div>{quizStats.userAnswers[index] || 'Not answered'}</div>
                <div>{question.answer}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowStats(false);
              setQuizData(null);
              setYoutubeLink('');
              setSelectedDifficulty('');
              setQuestionCount(5);
            }}
            className="mt-8 w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300"
          >
            Back to Quiz Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="flex flex-col items-center px-4 py-8">
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
import React, { useState, useEffect } from 'react';
import { Timer, ChevronRight } from 'lucide-react';

const QuizDisplay = ({ quizData, onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  // Validate quiz data structure
  useEffect(() => {
    if (!quizData || !Array.isArray(quizData.quiz)) {
      setError('Invalid quiz data format');
      return;
    }

    const invalidQuestions = quizData.quiz.some(
      q => !q.question || !Array.isArray(q.options) || !q.answer
    );

    if (invalidQuestions) {
      setError('Invalid question format in quiz data');
    }
  }, [quizData]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestion]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const currentQuiz = quizData.quiz[currentQuestion];
      if (currentQuiz.options[selectedAnswer] === currentQuiz.answer) {
        setScore(score + 1);
      }
    }

    if (currentQuestion < quizData.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
          <h2 className="text-2xl font-semibold text-center mb-4 text-red-400">Error Loading Quiz</h2>
          <p className="text-center text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => onFinish()}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300"
          >
            Return to Quiz Generator
          </button>
        </div>
      </div>
    );
  }

  // Show completion state
  if (isFinished) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#00FF9D]">Quiz Completed!</h2>
          <p className="text-xl text-center mb-8">
            Your score: {score} out of {quizData.quiz.length}
          </p>
          <button
            onClick={() => onFinish(score)}
            className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300"
          >
            Finish Quiz
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have valid quiz data before rendering
  if (!quizData?.quiz?.[currentQuestion]) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF9D] mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizData.quiz[currentQuestion];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl font-semibold">
            Quiz
          </div>
          <div className="flex items-center gap-2 text-[#00FF9D]">
            <Timer className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>
          <div className="text-xl">
            <span className="text-[#00FF9D]">{currentQuestion + 1}</span>/{quizData.quiz.length}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Question {currentQuestion + 1}</h2>
            <p className="text-gray-300">{currentQuiz.question}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  selectedAnswer === index
                    ? 'border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D]'
                    : 'border-white/10 hover:border-[#00FF9D]/50 hover:bg-[#00FF9D]/5'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {currentQuestion === quizData.quiz.length - 1 ? 'Submit' : 'Next Question'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;
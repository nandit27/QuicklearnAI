import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CircularTimer from '@/components/CircularTimer';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import socket from '../utils/socket';

const QuizSession = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));
  const isTeacher = userInfo?.role === 'teacher';

  useEffect(() => {
    if (!userInfo || !roomId) return;

    // If questions exist in location state, set them
    if (location.state?.questions) {
      setQuestions(location.state.questions);
    }

    // Listen for quiz questions from socket
    socket.on('quiz_questions', (quizData) => {
      console.log('Received quiz data:', quizData);
      setQuestions(quizData);
    });

    // Listen for score updates
    socket.on('update_scores', ({ scores }) => {
      setScores(scores);
    });

    // Listen for final scores
    socket.on('final_scores', ({ scores }) => {
      if (isTeacher) {
        navigate('/quiz-results', { state: { scores } });
      } else {
        navigate('/student-results', { state: { 
          score: scores[userInfo._id],
          total: questions.length 
        }});
      }
    });

    return () => {
      socket.off('quiz_questions');
      socket.off('update_scores');
      socket.off('final_scores');
    };
  }, [roomId, userInfo, location.state]);

  const handleSubmitAnswer = () => {
    if (!selectedOption || currentQuestion >= questions.length) return;
    
    socket.emit('submit_answer', {
      roomId,
      userId: userInfo._id,
      question: questions[currentQuestion],
      selectedOption
    });
    
    setSelectedOption(null);
    setCurrentQuestion(prev => prev + 1);
  };

  // Teacher waiting screen
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
            <h2 className="text-2xl font-semibold mb-4">Quiz in Progress</h2>
            <p className="text-gray-400 mb-6">Waiting for students to complete the quiz...</p>
            <div className="space-y-4">
              {Object.entries(scores).map(([studentId, score]) => (
                <div key={studentId} className="flex justify-between border-b border-white/10 pb-2">
                  <span>Student {studentId}</span>
                  <span>Score: {score}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Student quiz interface
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF9D]"></div>
      </div>
    );
  }

  if (currentQuestion >= questions.length) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Quiz Completed!</h2>
          <p className="text-gray-400">Waiting for final results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <CircularTimer duration={30} onComplete={handleSubmitAnswer} />
            </div>
            
            <p className="text-lg">{questions[currentQuestion].question}</p>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-4 text-left rounded-lg border 
                    ${selectedOption === option 
                      ? 'border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D]' 
                      : 'border-white/10 hover:bg-white/5'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] 
                hover:bg-[#00FF9D]/20 h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizSession; 
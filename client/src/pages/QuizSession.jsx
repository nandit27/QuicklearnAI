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
  const [questions] = useState(location.state?.questions || []);
  const [scores, setScores] = useState({});
  const userInfo = JSON.parse(localStorage.getItem('user-info'));
  const totalTimeInSeconds = questions.length * 30;
  const minutes = Math.floor(totalTimeInSeconds / 60);
  const seconds = totalTimeInSeconds % 60;

  useEffect(() => {
    if (!userInfo || !roomId) return;

    // Listen for score updates
    socket.on('update_scores', ({ scores }) => {
      setScores(scores);
    });

    // Listen for final scores
    socket.on('final_scores', ({ scores }) => {
      if (userInfo.role === 'teacher') {
        navigate('/quiz-results', { state: { scores } });
      } else {
        navigate('/student-results', { state: { 
          score: scores[userInfo._id],
          total: questions.length 
        }});
      }
    });

    // Auto-end quiz after time limit
    const timeLimit = questions.length * 30 * 1000; // Convert to milliseconds
    const timer = setTimeout(() => {
      socket.emit('quiz_end', { roomId });
    }, timeLimit);

    return () => {
      socket.off('update_scores');
      socket.off('final_scores');
      clearTimeout(timer);
    };
  }, [roomId, userInfo, questions]);

  const handleSubmitAnswer = (selectedOption) => {
    socket.emit('submit_answer', {
      roomId,
      userId: userInfo._id,
      question: questions[currentQuestion],
      selectedOption
    });
    setCurrentQuestion(prev => prev + 1);
  };

  const handleTimeUp = () => {
    socket.emit('quiz_end', { roomId });
  };

  const handleBack = () => {
    navigate('/teacher-dashboard');
  };

  if (Object.keys(scores).length > 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
            <h2 className="text-2xl font-semibold mb-8">RESULTS:</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xl">Top scorer</th>
                    <th className="text-left py-3 px-4 text-xl">Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scores).map(([studentId, score]) => (
                    <tr key={studentId} className="border-b border-white/5">
                      <td className="py-4 px-4">{studentId}</td>
                      <td className="py-4 px-4">{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={handleBack}
              className="mt-8 w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 h-12 rounded-lg"
            >
              BACK
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-semibold text-gray-400">
              PLEASE WAIT, THE STUDENTS ARE APPEARING FOR THE QUIZ
            </h2>
            
            <div className="flex justify-center">
              <CircularTimer 
                duration={totalTimeInSeconds}
                onTimeUp={handleTimeUp}
              />
            </div>

            <p className="text-gray-500">
              Quiz duration: {minutes}:{seconds.toString().padStart(2, '0')} minutes
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizSession; 
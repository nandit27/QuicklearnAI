import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CircularTimer from '@/components/CircularTimer';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

const QuizSession = ({ questionCount = 5 }) => {
  const navigate = useNavigate();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState([]);
  const totalTimeInSeconds = questionCount * 30;
  const minutes = Math.floor(totalTimeInSeconds / 60);
  const seconds = totalTimeInSeconds % 60;

  const handleTimeUp = () => {
    setQuizCompleted(true);
    // Here you would typically fetch the results from your backend
    // For now, using mock data
    setResults([
      { student: "Top scorer", score: "10/10" }
    ]);
  };

  const handleBack = () => {
    navigate('/teacher-dashboard');
  };

  if (quizCompleted) {
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
                  {results.map((result, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-4 px-4">{result.student}</td>
                      <td className="py-4 px-4">{result.score}</td>
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
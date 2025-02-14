import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores } = location.state || {};

  const handleExportResults = () => {
    const csvContent = `Student ID,Score\n${
      Object.entries(scores)
        .map(([id, score]) => `${id},${score}`)
        .join('\n')
    }`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_results.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Quiz Results</h1>
            <Button
              onClick={handleExportResults}
              className="bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Student ID</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scores).map(([studentId, score]) => (
                  <tr key={studentId} className="border-b border-white/5">
                    <td className="py-4 px-4">{studentId}</td>
                    <td className="py-4 px-4">{score}</td>
                    <td className="py-4 px-4">
                      <span className={
                        score >= 7 ? 'text-green-400' :
                        score >= 5 ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        {score >= 7 ? 'Excellent' :
                         score >= 5 ? 'Good' :
                         'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={() => navigate('/teacher-dashboard')}
            className="mt-8 flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults; 
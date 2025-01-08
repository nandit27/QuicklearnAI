import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, CheckCircle, XCircle } from 'lucide-react';

const QuizResponsePage = ({ quizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const questions = quizData?.questions?.easy || [];
  
  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    let totalScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        totalScore += 1;
      }
    });
    setScore(totalScore);
    setShowResults(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Card className="max-w-2xl mx-auto bg-black border border-gray-800">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Quiz Results</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                <span className="font-semibold text-white">Final Score:</span>
                <span className="text-xl font-bold text-green-400">{score}/{questions.length}</span>
              </div>
              <Progress value={(score / questions.length) * 100} className="h-2 bg-gray-800" indicatorClassName="bg-green-400" />
              <div className="mt-4">
                {questions.map((question, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="font-medium text-white">{question.question}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-400">
                        Your answer: {selectedAnswers[index] || "Not answered"}
                      </span>
                      {selectedAnswers[index] === question.answer ? (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="ml-2 h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-green-400 mt-1">
                      Correct answer: {question.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <Card className="max-w-2xl mx-auto bg-black border border-gray-800">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-medium text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Timer className="h-4 w-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <Progress 
            value={((currentQuestion + 1) / questions.length) * 100} 
            className="h-2 mb-6 bg-gray-800" 
            indicatorClassName="bg-green-400"
          />

          {questions[currentQuestion] && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-white">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="grid gap-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === option ? "default" : "outline"}
                    className={`w-full justify-start px-4 py-6 text-left border border-gray-800 
                      ${selectedAnswers[currentQuestion] === option 
                        ? 'bg-green-400 text-black hover:bg-green-500' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  className="border-gray-800 text-white hover:bg-gray-800"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-green-400 text-black hover:bg-green-500"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                    className="bg-green-400 text-black hover:bg-green-500"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResponsePage;
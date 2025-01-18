import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';

const FlashCard = ({ content, title }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-xl h-64 cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute w-full h-full bg-black/30 backdrop-blur-md rounded-xl p-6 flex flex-col justify-center items-center backface-hidden border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/70">Click to flip</p>
        </div>
        <div className="absolute w-full h-full bg-black/30 backdrop-blur-md rounded-xl p-6 rotate-y-180 backface-hidden border border-white/10">
          <p className="text-white/90">{content}</p>
        </div>
      </div>
    </div>
  );
};

const Summary = ({ summaryData }) => {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Generated Summary</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(summaryData).map(([title, content], index) => (
            <FlashCard key={index} title={title} content={content} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Quiz = ({ quizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = () => {
    if (selectedAnswer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-2xl mx-auto">
        {!showResults ? (
          <Card className="p-6 bg-black/30 backdrop-blur-md border border-white/10">
            <Progress 
              value={(currentQuestion / quizData.length) * 100} 
              className="mb-6"
            />
            <h2 className="text-2xl font-bold text-white mb-4">
              Question {currentQuestion + 1} of {quizData.length}
            </h2>
            <p className="text-white/90 mb-6">{quizData[currentQuestion].question}</p>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {quizData[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-white/80">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button 
              onClick={handleAnswer}
              disabled={!selectedAnswer}
              className="w-full mt-4"
            >
              {currentQuestion === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 bg-black/30 backdrop-blur-md border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Results</h2>
            <p className="text-2xl text-white/90 mb-6">
              You scored {score} out of {quizData.length}
            </p>
            <Progress 
              value={(score / quizData.length) * 100} 
              className="mb-6"
            />
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default { Quiz, Summary };
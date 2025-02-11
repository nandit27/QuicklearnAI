import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import  socket  from '../utils/socket';
import ChatRoom from './ChatRoom';

const TeacherDashboard = () => {
  // Hardcoded teacher data
  const teacherName = "John Doe";
  const rating = "4/5";
  
  // Hardcoded doubts data
  const [newDoubts, setNewDoubts] = useState([
    { id: 1, question: "What is Stemming in NLP ?" },
    { id: 2, question: "How does BackPropagation work?" },
    { id: 3, question: "Explain CNN architecture" }
  ]);

  const solvedDoubts = [
    { id: 1, question: "What is Gradient Descent?" },
    { id: 2, question: "What is Deep Learning" },
    { id: 3, question: "Explain LSTM networks" }
  ];

  const [activeDoubt, setActiveDoubt] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    
    socket.emit('join_chat', {
      userId: userInfo._id,
      role: 'teacher'
    });

    socket.on('new_doubt', (doubt) => {
      setNewDoubts(prev => [...prev, doubt]);
    });

    return () => {
      socket.off('new_doubt');
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Teacher Profile Card */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/default-avatar.png" />
                <AvatarFallback className="bg-emerald-400/10 text-emerald-400">TD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold">Namaste {teacherName}!</h2>
                <p className="text-xl text-gray-400">Your Rating is {rating}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* New Doubts Section */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-400">New Doubts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newDoubts.map((doubt) => (
              <div 
                key={doubt.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20"
              >
                <span className="text-gray-300">{doubt.question}</span>
                <Button 
                  className="px-4 py-2 bg-[#00FF9D]/10 text-l font-medium rounded-full border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 hover:border-[#00FF9D]/50 transition-all duration-300"
                >
                  Solve →
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Previously Solved Doubts */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-400">Previously Solved Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solvedDoubts.map((doubt) => (
                <div 
                  key={doubt.id}
                  className="p-4 rounded-lg border border-white/10 bg-black/20 text-gray-300"
                >
                  {doubt.question}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;

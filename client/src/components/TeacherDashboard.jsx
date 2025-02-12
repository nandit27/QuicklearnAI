import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import socket from '../utils/socket.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [newDoubts, setNewDoubts] = useState([]);
  const [solvedDoubts, setSolvedDoubts] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    // Fetch teacher's assigned doubts on mount
    const fetchDoubts = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/doubt/teacher/${userInfo._id}/doubts`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        
        const doubts = response.data;
        setNewDoubts(doubts.filter(d => d.status !== 'resolved'));
        setSolvedDoubts(doubts.filter(d => d.status === 'resolved'));
      } catch (error) {
        console.error('Error fetching doubts:', error);
      }
    };

    fetchDoubts();
    
    // Connect to socket
    socket.emit('join_chat', {
      userId: userInfo._id,
      role: 'teacher'
    });

    // Listen for new doubts
    socket.on('new_doubt', (doubt) => {
      setNewDoubts(prev => [...prev, doubt]);
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Doubt Assigned', {
          body: `New doubt in ${doubt.topic.join(' › ')}`,
        });
      }
    });

    return () => {
      socket.off('new_doubt');
    };
  }, []);

  const handleJoinChat = (doubtId) => {
    navigate(`/doubt/${doubtId}/chat`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Teacher Profile Card */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userInfo.avatar} />
                <AvatarFallback className="bg-emerald-400/10 text-emerald-400">
                  {userInfo.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold">Namaste {userInfo.username}!</h2>
                <p className="text-xl text-gray-400">Your Rating: {userInfo.rating}/5</p>
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
                key={doubt._id} 
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20"
              >
                <div>
                  <span className="text-gray-300">{doubt.name}</span>
                  <p className="text-sm text-gray-500">{doubt.topics.join(' › ')}</p>
                </div>
                <Button 
                  onClick={() => handleJoinChat(doubt._id)}
                  className="px-4 py-2 bg-[#00FF9D]/10 text-l font-medium rounded-full border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20"
                >
                  Join Chat →
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Previously Solved Doubts */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-400">Solved Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solvedDoubts.map((doubt) => (
                <div 
                  key={doubt._id}
                  className="p-4 rounded-lg border border-white/10 bg-black/20 text-gray-300"
                >
                  <p>{doubt.name}</p>
                  <p className="text-sm text-gray-500">{doubt.topics.join(' › ')}</p>
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

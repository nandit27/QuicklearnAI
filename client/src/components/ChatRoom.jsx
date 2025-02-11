import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5002');

const ChatRoom = ({ doubtId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    // Join chat room
    socket.emit('join_chat', {
      doubtId,
      userId: userInfo._id,
      role: userInfo.role
    });

    // Load chat history
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/chat/history/${doubtId}`, {
          withCredentials: true
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();

    // Listen for new messages
    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, [doubtId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('chat_message', {
      doubtId,
      sender: userInfo._id,
      message: newMessage
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-black/40 rounded-lg border border-white/10">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === userInfo._id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-lg ${
              msg.sender === userInfo._id 
                ? 'bg-[#00FF9D]/10 text-[#00FF9D]' 
                : 'bg-gray-700 text-white'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#00FF9D]/10 text-[#00FF9D] rounded-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;

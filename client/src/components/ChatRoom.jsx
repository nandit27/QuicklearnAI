import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/api';

const socket = io('http://localhost:5002');

const ChatRoom = ({ doubtId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    const initializeChat = async () => {
      if (!doubtId) {
        setError('Doubt ID is required');
        return;
      }

      if (!userInfo || !userInfo._id) {
        setError('User information is missing');
        return;
      }

      try {
        // Join chat room via API
        const joinResponse = await chatService.joinChat(doubtId, userInfo._id, userInfo.role);
        console.log('Join response:', joinResponse);
        
        // Join chat room via socket
        socket.emit('join_chat', {
          doubtId,
          userId: userInfo._id,
          role: userInfo.role
        });

        // Load chat history
        const chatHistory = await chatService.getChatHistory(doubtId);
        setMessages(chatHistory);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError(error.message);
      }
    };

    initializeChat();

    // Listen for new messages
    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, [doubtId, userInfo]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Send message via API
      await chatService.sendMessage(doubtId, userInfo._id, newMessage);

      // Emit socket event
      socket.emit('chat_message', {
        doubtId,
        sender: userInfo._id,
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
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

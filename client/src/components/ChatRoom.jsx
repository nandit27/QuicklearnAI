import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';
import { chatService } from '../services/api';

const ChatRoom = () => {
  const { doubtId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    const initializeChat = async () => {
      if (!doubtId || !userInfo?._id) {
        setError('Missing required information');
        return;
      }

      try {
        // Join chat room via API
        await chatService.joinChat(doubtId, userInfo._id, userInfo.role);
        
        // Join socket room
        socket.emit('join_chat', {
          doubtId,
          userId: userInfo._id,
          role: userInfo.role
        });

        // Load chat history
        const chatHistory = await chatService.getChatHistory(doubtId);
        setMessages(chatHistory);

        // Listen for new messages
        socket.on('chat_message', (message) => {
          setMessages(prev => [...prev, message]);
        });

        socket.on('error', (error) => {
          setError(error.message);
        });

      } catch (error) {
        console.error('Error initializing chat:', error);
        setError(error.message);
      }
    };

    initializeChat();

    return () => {
      socket.off('chat_message');
      socket.off('error');
    };
  }, [doubtId, userInfo]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(doubtId, userInfo._id, newMessage);
      socket.emit('chat_message', {
        doubtId,
        sender: userInfo._id,
        message: newMessage
      });
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-8">
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          
          <div className="h-[60vh] overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.sender === userInfo._id ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === userInfo._id
                      ? 'bg-[#00FF9D]/10 text-[#00FF9D]'
                      : 'bg-white/10'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00FF9D]"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#00FF9D] text-black rounded-lg hover:bg-[#00FF9D]/90"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

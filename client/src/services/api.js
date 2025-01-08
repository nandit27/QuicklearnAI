// src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Flask server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quizService = {
  // Generate quiz from YouTube video
  generateQuiz: async (link, qno, difficulty) => {
    try {
      const response = await api.post('/quiz', {
        link,
        qno,
        difficulty,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.error || 'Failed to generate quiz');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server');
      } else {
        // Other errors
        throw new Error('Error setting up request');
      }
    }
  },

  // Health check endpoint
  checkHealth: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Server health check failed');
    }
  },
};
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const summaryService = {
  generateSummary: async (link) => {
    try {
      const response = await api.post('/quiz', {
        link,
        qno: 1,  // Default minimum questions since we only need summary
        difficulty: 'easy'  // Default difficulty
      });
      
      if (response.data && response.data.summary) {
        // Convert the summary object into an array of sentences
        const summaryPoints = Object.entries(response.data.summary).map(([topic, content]) => {
          return `${topic}: ${content}`;
        });
        
        return summaryPoints;
      } else {
        throw new Error('Summary not found in response');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to generate summary');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Error setting up request');
      }
    }
  }
};

export const quizService = {
  generateQuiz: async (link, qno, difficulty) => {
    try {
      const response = await api.post('/quiz', {
        link,
        qno,
        difficulty,
      });
      
      if (!response.data || !response.data.questions || !response.data.summary) {
        throw new Error('Invalid response format from server');
      }

      // Return both summary and quiz data in the expected format
      return {
        summary: response.data.summary,
        quiz: response.data.questions[difficulty]
      };
      
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to generate quiz');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Error setting up request');
      }
    }
  }
};
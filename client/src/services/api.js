import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const api2 = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Modify the interceptor to handle both token types
api2.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem('user-info');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          document.cookie = `authtoken=${token}; path=/`;
        }
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  },
};

export const statisticsService = {
  storeStatistics: async (statisticsData) => {
    try {
      const userInfo = localStorage.getItem('user-info');
      const headers = {};
      
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        console.log('Token:', token); // Ensure token is present and valid
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await api2.post('/user/user/statistics', statisticsData, { 
        headers,
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error('Store statistics error:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const userInfo = localStorage.getItem('user-info');
      const headers = {};
  
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        console.log('Token:', token); 
        if (token) {
          headers.Authorization = `Bearer ${token}`; // Set the token in the Authorization header
        }
      }
  
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://localhost:3000/user/user/showhistory', // Adjust URL if needed
        headers,
      };
      console.log('Config:', config);
  
      const response = await axios.request(config);

      console.log('Get statistics response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  },
};

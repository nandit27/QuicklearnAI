import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5001',
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
        difficulty
      });
      
      if (!response.data || !response.data.questions || !response.data.summary) {
        throw new Error('Invalid response format from server');
      }

      // Handle all possible ways to get the topic
      const rawResponse = response.data;
      let topicName = rawResponse.topic_name || rawResponse.topic;
      
      // If no direct topic field, try to extract from summary
      if (!topicName && rawResponse.summary) {
        // Get the first topic key from summary (e.g., "Topic Life Guidance")
        const firstTopicKey = Object.keys(rawResponse.summary)[0];
        // Extract the topic name after "Topic " prefix
        topicName = firstTopicKey?.replace('Topic ', '') || 'Unknown Topic';
      }

      return {
        summary: rawResponse.summary,
        quiz: rawResponse.questions[difficulty],
        title: topicName
      };
    } catch (error) {
      console.error('Error in generateQuiz:', error);
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
      if (!userInfo) {
        throw new Error('User not authenticated');
      }

      const { _id, token } = JSON.parse(userInfo);
      if (!_id) {
        throw new Error('User ID not found');
      }

      // Added token to headers
      const response = await api2.post('/user/user/statistics', {
        pasturl: statisticsData.pasturl,
        score: statisticsData.score,
        totalscore: statisticsData.totalscore,
        topic: statisticsData.topic
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Store statistics error:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      // Use api2 instance which already handles the auth header
      const response = await api2.get('/user/user/showhistory');
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  },
};

export const recommendationService = {
  getRecommendations: async () => {
    try {
      const userInfo = localStorage.getItem('user-info');
      if (!userInfo) {
        throw new Error('User not authenticated');
      }

      const { token } = JSON.parse(userInfo);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use api2 instance with the correct endpoint
      const response = await api2.get('/gen/getonly', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `authtoken=${token}`
        },
        withCredentials: true
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch recommendations');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error(error.message || 'Error setting up request');
      }
    }
  },
};

export const documentService = {
  uploadPdf: async (file) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Get user token
      const userInfo = localStorage.getItem('user-info');
      let token = null;
      if (userInfo) {
        const { token: userToken } = JSON.parse(userInfo);
        token = userToken;
      }

      // Make request using api2 instance (which points to localhost:3000)
      const response = await api2.post('/gen/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to upload file');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Error setting up request');
      }
    }
  },
  
  queryDocument: async (query) => {
    try {
      const response = await api2.post('/gen/query', {
        query: query
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to process query');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Error setting up request');
      }
    }
  }
};
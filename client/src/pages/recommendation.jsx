import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { recommendationService } from '../services/api';
import FlashCard from '../components/FlashCard';

const RecommendationPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract YouTube video IDs
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Extract YouTube links from the response text
  const extractYoutubeLinks = (text) => {
    const youtubeRegex = /\*\*URL:\*\* \[(.*?)\]\((https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+)\)/g;
    const videos = [];
    let match;

    while ((match = youtubeRegex.exec(text)) !== null) {
      const videoId = extractVideoId(match[2]);
      if (videoId) {
        videos.push({
          title: match[1],
          url: match[2],
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        });
      }
    }
    return videos;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await recommendationService.getRecommendations();
        const extractedVideos = extractYoutubeLinks(response.recommendations);
        setVideos(extractedVideos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF9D]"></div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-red-500">{error}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex space-x-6 w-max">
            {videos.map((video, index) => (
              <a 
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none w-[320px] hover:scale-105 transition-transform duration-200"
              >
                <Card className="overflow-hidden bg-zinc-900/50 border-zinc-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-[180px] object-cover"
                    onError={(e) => {
                      e.target.src = '/default-thumbnail.jpg';
                    }}
                  />
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPage; 
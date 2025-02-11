import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { recommendationService } from '../services/api';
import FlashCard from '../components/FlashCard';

const RecommendationPage = () => {
  const [videos, setVideos] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract YouTube video IDs
  const extractVideoId = (url) => {
    // Remove any quotes and get the raw URL
    const cleanUrl = url.replace(/['"]/g, '');
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(regex);
    return match ? match[1] : null;
  };

  // Updated regex pattern to match the actual URL format in the response
  const extractYoutubeLinks = (text) => {
    // Find the YouTube Video Recommendations section
    const lines = text.split('\n');
    const videos = [];
    
    let currentTitle = '';
    let currentDescription = '';
    
    lines.forEach(line => {
      if (line.match(/^\d+\./)) {
        // This is a title line with description in parentheses
        const titleMatch = line.match(/^\d+\.\s+"([^"]+)"/);
        const descMatch = line.match(/\(([^)]+)\)/);
        
        if (titleMatch) {
          currentTitle = titleMatch[1];
          currentDescription = descMatch ? descMatch[1] : '';
        }
      } else if (line.includes('youtube.com/watch?v=')) {
        // Extract URL from the line
        const urlMatch = line.match(/(https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+)/);
        if (urlMatch && currentTitle) {
          const url = urlMatch[1];
          const videoId = extractVideoId(url);
          if (videoId) {
            videos.push({
              title: currentTitle,
              url: url,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              description: currentDescription
            });
          }
        }
      }
    });
    
    return videos;
  };

  // Extract text content excluding video section
  const extractTextContent = (text) => {
    const videoIndex = text.indexOf('Recommended YouTube Videos');
    return videoIndex !== -1 ? text.substring(0, videoIndex) : text;
  };

  // New function to parse and structure the text content
  const parseTextContent = (text) => {
    const sections = {};
    let currentSection = '';
    
    text.split('\n\n').forEach(paragraph => {
      // Check if paragraph is a section header
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        currentSection = paragraph.replace(/\*\*/g, '');
        sections[currentSection] = [];
      } else if (currentSection) {
        // Clean up bullet points and formatting
        const cleanParagraph = paragraph
          .replace(/\*\*/g, '')
          .split('\n')
          .map(line => {
            // Replace * with custom markers
            if (line.trim().startsWith('*')) {
              return '→' + line.trim().substring(1);
            }
            return line.trim();
          })
          .filter(line => line.length > 0);
        
        sections[currentSection].push(...cleanParagraph);
      }
    });
    
    return sections;
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await recommendationService.getRecommendations();
        const extractedVideos = extractYoutubeLinks(response.recommendations);
        const extractedText = extractTextContent(response.recommendations);
        setVideos(extractedVideos);
        setTextContent(extractedText);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF9D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#00FF9D] mb-4">Knowledge Hub</h1>
          <p className="text-xl text-gray-400">Curated recommendations to expand your knowledge</p>
        </div>

        {/* Text Content Sections */}
        <div className="grid gap-8">
          {Object.entries(parseTextContent(textContent)).map(([section, points], index) => (
            <div key={index} className="bg-zinc-900/50 rounded-xl p-8 backdrop-blur-sm border border-zinc-800/50">
              <h2 className="text-2xl font-bold text-[#00FF9D] mb-6">{section}</h2>
              <div className="space-y-4">
                {points.map((point, idx) => {
                  if (point.startsWith('→')) {
                    return (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="text-[#00FF9D]">→</div>
                        <p className="text-gray-300 leading-relaxed">{point.substring(1)}</p>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-gray-300 leading-relaxed">{point}</p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Video Recommendations */}
        {videos.length > 0 && (
          <div className="bg-zinc-900/50 rounded-xl p-8 backdrop-blur-sm border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-[#00FF9D] mb-8">Recommended Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="group hover:scale-105 transition-all duration-300"
                >
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <div className="bg-black/50 rounded-xl overflow-hidden border border-zinc-800/50">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-video object-cover"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${extractVideoId(video.url)}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-[#00FF9D]/10 group-hover:bg-transparent transition-colors duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-200 group-hover:text-[#00FF9D] transition-colors duration-300 line-clamp-2">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage; 
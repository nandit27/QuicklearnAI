import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import FlashCard from '../components/FlashCard';
import { summaryService } from '../services/api';
import { useToast } from "@/components/ui/use-toast";

const SummaryPage = () => {
  const [url, setUrl] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const summaryPoints = await summaryService.generateSummary(url);
      setSummaries(summaryPoints);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Video<span className="text-emerald-400">Summary</span>
          </h1>
          <p className="text-gray-400">AI Powered YouTube Summary Generator</p>
        </div>
        
        <Card className="p-8 bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-emerald-400">Create Your Summary</h2>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">YouTube Video Link</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black/50 border-white/10 text-white h-12 pl-4 rounded-lg focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
            </div>
            
            <Button
              onClick={handleGenerateSummary}
              disabled={loading || !url}
              className="w-full h-14 bg-[#0A2818] hover:bg-[#0A2818]/90 text-emerald-400 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Summary...</span>
                </div>
              ) : (
                'Generate Summary'
              )}
            </Button>
          </div>
        </Card>

        {summaries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {summaries.map((summary, index) => (
              <FlashCard key={index} content={summary} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;
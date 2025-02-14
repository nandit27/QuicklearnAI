import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateQuiz = () => {
  const [activeTab, setActiveTab] = useState("llm");
  const [difficulty, setDifficulty] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Create <span className="text-[#00FF9D]">Quiz</span>
          </h1>
          <p className="text-xl text-gray-400">
            Generate quiz questions using AI
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 gap-4 bg-transparent mb-6">
              <TabsTrigger 
                value="llm"
                className={`py-3 rounded-lg transition-all duration-300 ${
                  activeTab === "llm" 
                    ? 'bg-[#00FF9D] text-black font-medium'
                    : 'bg-black/50 text-gray-400 hover:text-white'
                }`}
              >
                Interact with LLM
              </TabsTrigger>
              <TabsTrigger 
                value="youtube"
                className={`py-3 rounded-lg transition-all duration-300 ${
                  activeTab === "youtube" 
                    ? 'bg-[#00FF9D] text-black font-medium'
                    : 'bg-black/50 text-gray-400 hover:text-white'
                }`}
              >
                From YT URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="llm" className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Describe the topic you want quiz for
                </label>
                <Input 
                  placeholder="Enter topic description"
                  className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Number of questions
                  </label>
                  <Input 
                    type="number" 
                    min="1"
                    max="20"
                    defaultValue="5"
                    className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Difficulty
                  </label>
                  <Select 
                    value={difficulty} 
                    onValueChange={handleDifficultyChange}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 h-11">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-white/10">
                      <SelectItem value="easy" className="text-white hover:bg-[#00FF9D]/20">Easy</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-[#00FF9D]/20">Medium</SelectItem>
                      <SelectItem value="hard" className="text-white hover:bg-[#00FF9D]/20">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 h-11">
                Generate Quiz
              </Button>
            </TabsContent>

            <TabsContent value="youtube" className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  YouTube URL
                </label>
                <div className="relative">
                  <Input 
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 pl-10 h-11"
                  />
                  <Youtube className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Number of questions
                  </label>
                  <Input 
                    type="number" 
                    min="1"
                    max="20"
                    defaultValue="5"
                    className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Difficulty
                  </label>
                  <Select 
                    value={difficulty} 
                    onValueChange={handleDifficultyChange}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 h-11">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-white/10">
                      <SelectItem value="easy" className="text-white hover:bg-[#00FF9D]/20">Easy</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-[#00FF9D]/20">Medium</SelectItem>
                      <SelectItem value="hard" className="text-white hover:bg-[#00FF9D]/20">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 h-11">
                Generate Quiz
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CreateQuiz;

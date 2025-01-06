import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

function SearchBar() {
  const [isListening, setIsListening] = useState(false)

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute inset-0 bg-gradient-border rounded-2xl p-[1px] animate-pulse">
        <div className="h-full w-full bg-black rounded-2xl" />
      </div>
      
      <div className="relative flex items-center bg-black/50 backdrop-blur-sm rounded-2xl p-4">
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-purple-400 animate-float">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.417 0L12 4.5l2.583-4.5L19.5 2.583 15 5.167l4.5 2.583L17.417 12 15 9.5l-3 5-3-5-2.417 2.5L4.5 7.75 9 5.167 4.5 2.583 9.417 0z"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Describe Earth to aliens"
            className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'}`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors group">
            <PaperAirplaneIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
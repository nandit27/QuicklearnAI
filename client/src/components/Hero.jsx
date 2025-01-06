import SearchBar from "./SearchBar"

function Hero() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1 mb-8">
          <span className="h-2 w-2 bg-secondary rounded-full"></span>
          <span className="text-sm">Powered by AI/OCR engine</span>
        </div>
        
        <h1 className="text-5xl font-bold mb-6">
          Summarising your<br />content with AI
        </h1>
        
        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          An open source content management system that uses AI to automate
          various aspects of content creation, optimization, and distribution.
        </p>
        
        <div className="relative max-w-2xl mx-auto">
          {/* <input 
            type="text"
            placeholder="Search..." 
            className="w-full px-6 py-4 bg-black/40 backdrop-blur-md border border-[#00FF9D] rounded-2xl text-white placeholder:text-gray-400 transition-all duration-300 hover:border-[#00FF9D]/50 hover:ring-4 hover:ring-[#00FF9D]/20 hover:bg-black/60"
          />
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF9D] transition-colors duration-300"
            aria-label="Search"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>*/}
          <SearchBar />
        </div> 
      </div>
    </div>
  )
}

export default Hero
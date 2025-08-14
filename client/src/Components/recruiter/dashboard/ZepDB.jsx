import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ZepDB = () => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle prompt submission
    console.log('Prompt submitted:', prompt);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 w-full">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">ZEPDB</h1>
          <p className="text-gray-400 text-base md:text-lg lg:text-xl px-4 max-w-3xl">
            Your AI-powered recruitment assistant. Ask for resumes, filter candidates, and find the perfect match.
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl px-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                                            <input
                 type="text"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Ask anything..."
                 className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-xl px-4 py-3 md:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
               />
               
               {/* Send button */}
               <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                 <button
                   type="submit"
                   className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                   disabled={!prompt.trim()}
                 >
                   <Send className="w-5 h-5 text-gray-400" />
                 </button>
               </div>
            </div>
          </form>
          
                     {/* Example prompts */}
           <div className="mt-6 text-center">
             <p className="text-gray-500 text-xs md:text-sm mb-3">Try asking:</p>
             <div className="flex flex-wrap justify-center gap-2 px-2">
               <button
                 onClick={() => setPrompt("Give me resumes for software developers with experience greater than 1 year")}
                 className="text-xs bg-gray-800 text-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 Software developers > 1 year
               </button>
               <button
                 onClick={() => setPrompt("Show me candidates with React experience")}
                 className="text-xs bg-gray-800 text-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 React developers
               </button>
               <button
                 onClick={() => setPrompt("Find candidates with 3+ years of experience")}
                 className="text-xs bg-gray-800 text-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 3+ years experience
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ZepDB;

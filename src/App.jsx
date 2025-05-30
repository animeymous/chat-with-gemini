import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import { Moon, Sun, Send, Trash2, Copy, RotateCcw, MessageSquare, Settings, Info } from 'lucide-react';
import bgLight from './assets/gemini1.jpg';
import bgDark from './assets/gemini2.jpg';

const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a creative story about a time traveler",
  "What are the best practices for React development?",
  "How does artificial intelligence work?",
];

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  async function generateResponse(message = inputMessage) {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    const userMessage = {
      type: 'user',
      content: message.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        method: "post",
        data: {
          contents: [
            { parts: [{ text: message }] }
          ]
        }
      });

      const aiResponse = response?.data?.candidates[0]?.content?.parts[0]?.text || "I apologize, but I couldn't generate a response.";
      
      setMessages(prev => [...prev, {
        type: 'ai',
        content: aiResponse
      }]);

      toast({
        title: "Response generated",
        description: "The AI has responded to your message.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while fetching the response",
      });
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(event) {
    setInputMessage(event.target.value);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      generateResponse();
    }
  }

  function clearChat() {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    });
  }

  function handleSuggestionClick(suggestion) {
    generateResponse(suggestion);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    });
  }

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Enhanced background decoration with new images */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Primary background image */}
        <img
          src={bgLight}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            isDarkMode ? 'opacity-0' : 'opacity-50'
          }`}
          alt="Background Light"
        />
        
        {/* Secondary background image */}
        <img
          src={bgDark}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            isDarkMode ? 'opacity-50' : 'opacity-0'
          }`}
          alt="Background Dark"
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-background/20 to-background/40" />
        
        {/* Animated decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_800px_300px] h-screen relative">
        {/* Left sidebar - Enhanced glassmorphism */}
        <div className="hidden lg:flex flex-col gap-4 p-6 border-r border-border/50 bg-background/30 backdrop-blur-md">
          <div className="flex flex-col gap-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Gemini Chat</h1>
              <p className="text-sm text-muted-foreground">Powered by Google's Advanced AI</p>
            </div>
            <Button
              variant="ghost"
              className="justify-start gap-2 hover:bg-primary/20 h-12"
              onClick={clearChat}
            >
              <MessageSquare className="h-5 w-5" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 hover:bg-primary/20 h-12"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 hover:bg-primary/20 h-12"
            >
              <Info className="h-5 w-5" />
              About
            </Button>
          </div>
        </div>

        {/* Main chat area - Enhanced design */}
        <div className="flex flex-col h-screen border-x border-border/50 bg-background/40 backdrop-blur-md">
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-primary">AI Assistant</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-background/50 backdrop-blur-sm hover:bg-primary/20 w-10 h-10"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/50 backdrop-blur-sm hover:bg-primary/20 w-10 h-10"
                  onClick={clearChat}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-semibold mb-4 text-primary">Welcome to Gemini Chat</h2>
                <p className="text-lg mb-8">Start a conversation or try one of our suggested prompts</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
                  {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full h-auto p-4 text-left bg-background/50 backdrop-blur-sm hover:bg-primary/20 group transition-all duration-300"
                      onClick={() => handleSuggestionClick(prompt)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <span className="flex-1 line-clamp-2">{prompt}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.type === 'user'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'bg-background/50'
                    } rounded-lg p-6 relative group shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-primary-foreground/20' : 'bg-primary/20'
                      }`}>
                        {message.type === 'user' ? (
                          <MessageSquare className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium mb-1">
                          {message.type === 'user' ? 'You' : 'Gemini AI'}
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/20"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <span>Generating response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border/50 p-6 bg-background/50 backdrop-blur-md">
            <div className="flex gap-3">
              <textarea
                className="flex-1 min-h-[60px] max-h-[200px] p-4 rounded-lg border bg-background/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
                placeholder="Type your message here... (Press Enter to send)"
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
              />
              <Button
                className="self-end px-8 py-6 bg-primary/90 hover:bg-primary shadow-lg"
                onClick={() => generateResponse()}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar - Enhanced design */}
        <div className="hidden lg:block border-l border-border/50 p-6 bg-background/30 backdrop-blur-md">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Suggested Prompts
              </h2>
              <div className="space-y-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-4 text-left bg-background/50 backdrop-blur-sm hover:bg-primary/20 group transition-all duration-300"
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <span className="flex-1 line-clamp-2">{prompt}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                <Info className="h-5 w-5" />
                Chat Information
              </h2>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-lg">
                <p className="flex justify-between items-center">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="font-semibold text-primary">{messages.length}</span>
                </p>
                <p className="flex justify-between items-center">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-semibold text-primary">Gemini 1.5 Flash</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Keyboard Shortcuts
              </h2>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 space-y-3 shadow-lg">
                <p className="flex justify-between items-center">
                  <span className="text-muted-foreground">Send message</span>
                  <kbd className="font-mono bg-background/70 px-2 py-1 rounded text-xs">Enter</kbd>
                </p>
                <p className="flex justify-between items-center">
                  <span className="text-muted-foreground">New line</span>
                  <kbd className="font-mono bg-background/70 px-2 py-1 rounded text-xs">Shift + Enter</kbd>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

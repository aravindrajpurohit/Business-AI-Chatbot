
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import ChatHeader from "./ChatHeader";
import MessageBubble, { TypingIndicator } from "./MessageBubble";
import ChatInput from "./ChatInput";
import QuickReply from "./QuickReply";
import WelcomeScreen from "./WelcomeScreen";
import AnimatedTransition from "./AnimatedTransition";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const { 
    messages, 
    isTyping, 
    sendMessage, 
    showWelcome, 
    setShowWelcome,
    fileStatus,
    updateFileStatus,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const isComplete = 
      fileStatus.csv && 
      fileStatus.privacy && 
      fileStatus.terms && 
      localStorage.getItem("gemini_api_key") !== null;
    
    setSetupComplete(isComplete);
  }, [fileStatus]);

  const handleSendMessage = (content: string) => {
    if (!setupComplete) {
      navigate('/setup');
      return;
    }
    sendMessage(content);
  };

  const handleQuickReplySelect = (reply: string) => {
    if (!setupComplete) {
      navigate('/setup');
      return;
    }
    sendMessage(reply);
  };

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const navigateToSetup = () => {
    navigate('/setup');
  };

  return (
    <div className="chatbot-container h-screen flex flex-col">
      {showWelcome ? (
        <WelcomeScreen onStartChat={handleStartChat} />
      ) : (
        <AnimatedTransition show={true} animation="fade" className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <ChatHeader />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={navigateToSetup}
              title="Go to Setup"
              aria-label="Go to Setup"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="message-list scrollbar-thin flex-1 overflow-y-auto p-4">
            {!setupComplete && messages.length <= 1 && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg mb-4 text-sm">
                <p className="font-medium">Setup required</p>
                <p>Please go to the Setup page to upload required files and save your API key.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={navigateToSetup} 
                  className="mt-2"
                >
                  Go to Setup
                </Button>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                showAvatar 
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length > 0 && !isTyping && (
            <QuickReply onSelect={handleQuickReplySelect} />
          )}
          
          <div className="message-input-container px-4 pb-4">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={!setupComplete}
            />
          </div>
        </AnimatedTransition>
      )}
    </div>
  );
};

export default ChatInterface;


import React from "react";
import ChatInterface from "@/components/ChatInterface";

const Index: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <ChatInterface />
    </div>
  );
};

export default Index;

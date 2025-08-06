
import React from "react";
import { cn } from "@/lib/utils";
import { BOT_NAME, BOT_AVATAR } from "@/lib/constants";
import { MessageCircle } from "lucide-react";
import AnimatedTransition from "./AnimatedTransition";

type WelcomeScreenProps = {
  onStartChat: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  return (
    <AnimatedTransition
      show={true}
      animation="fade"
      className="h-full flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
        <img
          src={BOT_AVATAR}
          alt={BOT_NAME}
          className="w-24 h-24 relative z-10"
        />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Welcome to {BOT_NAME}</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        I'm here to help you with information, assistance, and answers to your questions.
      </p>
      
      <button
        onClick={onStartChat}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-full",
          "bg-primary text-primary-foreground",
          "transform transition-all hover:scale-105 active:scale-95",
          "shadow-md hover:shadow-lg"
        )}
      >
        <MessageCircle size={20} />
        <span>Start Chatting</span>
      </button>
    </AnimatedTransition>
  );
};

export default WelcomeScreen;

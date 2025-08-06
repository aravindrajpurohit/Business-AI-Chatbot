
import React from "react";
import { cn } from "@/lib/utils";
import { MessageType, BOT_AVATAR, USER_AVATAR } from "@/lib/constants";
import AnimatedTransition from "./AnimatedTransition";

type MessageBubbleProps = {
  message: MessageType;
  showAvatar?: boolean;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true,
}) => {
  const isUser = message.sender === "user";
  const avatar = isUser ? USER_AVATAR : BOT_AVATAR;
  
  return (
    <AnimatedTransition
      show={true}
      animation="slide"
      className={cn(
        "flex items-end gap-2 max-w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar && (
        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt={isUser ? "User" : "Bot"}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
      
      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[80%] shadow-sm",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-none"
            : "bg-chat-bot text-chat-bot-foreground rounded-tl-none",
          !isUser && "glass-morphism"
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </AnimatedTransition>
  );
};

// Typing indicator component
export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 max-w-full">
      <div className="flex-shrink-0">
        <img
          src={BOT_AVATAR}
          alt="Bot"
          className="w-8 h-8 rounded-full"
        />
      </div>
      
      <div className="px-4 py-3 rounded-2xl max-w-[80%] shadow-sm bg-chat-bot text-chat-bot-foreground rounded-tl-none glass-morphism">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "200ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "400ms" }}></div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

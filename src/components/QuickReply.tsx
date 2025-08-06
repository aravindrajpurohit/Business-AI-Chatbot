
import React from "react";
import { cn } from "@/lib/utils";
import { QUICK_REPLIES } from "@/lib/constants";
import AnimatedTransition from "./AnimatedTransition";

type QuickReplyProps = {
  onSelect: (reply: string) => void;
};

const QuickReply: React.FC<QuickReplyProps> = ({ onSelect }) => {
  return (
    <div className="pb-4 px-4 overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-2">Suggested replies</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {QUICK_REPLIES.map((reply, index) => (
          <AnimatedTransition
            key={index}
            show={true}
            animation="scale"
            duration="slow"
            className="flex-shrink-0"
            // Stagger the animations
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <button
              onClick={() => onSelect(reply)}
              className={cn(
                "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                "bg-chat-quick-reply text-chat-quick-reply-foreground",
                "hover:opacity-90 transition-all",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              {reply}
            </button>
          </AnimatedTransition>
        ))}
      </div>
    </div>
  );
};

export default QuickReply;

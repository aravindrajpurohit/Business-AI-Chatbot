
import React from "react";
import { cn } from "@/lib/utils";
import { BOT_NAME, BOT_AVATAR } from "@/lib/constants";

const ChatHeader: React.FC = () => {
  return (
    <div className="sticky top-0 z-10">
      <div className={cn(
        "flex items-center px-4 py-3",
        "bg-background/80 backdrop-blur-md",
        "border-b border-border"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={BOT_AVATAR}
              alt={BOT_NAME}
              className="w-10 h-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </div>
          <div>
            <h3 className="font-medium">{BOT_NAME}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;


export const BOT_NAME = "Smartphone Assistant";
export const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Zoey";
export const USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

export const QUICK_REPLIES = [
  "What smartphones do you have?",
  "Tell me about your privacy policy",
  "What are your terms and conditions?",
  "Compare phones in my price range",
  "What's your return policy?",
  "How do I contact support?"
];

export const WELCOME_MESSAGES = [
  "Hello! I'm your smartphone assistant. How can I help you today?",
  "Hi there! I can help you find the perfect smartphone. What are you looking for?",
  "Welcome! I'm here to answer questions about our smartphones, privacy policy, and terms. How can I assist you?"
];

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export type QuickReplyType = string;

export type FileStatus = {
  csv: boolean;
  privacy: boolean;
  terms: boolean;
};

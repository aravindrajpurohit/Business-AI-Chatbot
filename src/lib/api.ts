import { MessageType, FileStatus } from "./constants";

// Define the base URL for your Python backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const jsonHeaders = {
  "Content-Type": "application/json",
};

// Cache backend status
let cachedBackendStatus: { isAvailable: boolean; lastChecked: number } | null = null;
const CACHE_DURATION_MS = 30000; // 30 seconds

// Function to check if the backend is available (with caching)
export async function checkBackendStatus(): Promise<boolean> {
  // Return cached status if it's still valid
  if (cachedBackendStatus && (Date.now() - cachedBackendStatus.lastChecked < CACHE_DURATION_MS)) {
    return cachedBackendStatus.isAvailable;
  }
  
  try {
    const response = await fetch(`${API_URL}/health`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Short timeout for quick check
      signal: AbortSignal.timeout(2000)
    });
    
    const isAvailable = response.ok;
    
    // Cache the result
    cachedBackendStatus = {
      isAvailable,
      lastChecked: Date.now()
    };
    
    return isAvailable;
  } catch (error) {
    console.log("Backend not available:", error);
    
    // Cache the negative result
    cachedBackendStatus = {
      isAvailable: false,
      lastChecked: Date.now()
    };
    
    return false;
  }
}

// Function to send a message to the Python backend
export async function sendMessageToBackend(
  content: string,
  apiKey?: string
): Promise<string> {
  try {
    // If we're in development mode with no backend, return a mock response
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Using mock response for development");
      return "This is a mock response as the backend is not available. In production, this would come from your Python backend with LangChain and Google Gemini.";
    }
    
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ message: content }),
    });
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error communicating with backend:", error);
    return "Sorry, there was an error connecting to the assistant. Please try again later.";
  }
}

// Function to get conversation history from the backend
export async function getConversationHistory(): Promise<MessageType[]> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Using mock history for development");
      return [];
    }
    
    const response = await fetch(`${API_URL}/history`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert backend history format to our MessageType format
    if (data.history && Array.isArray(data.history)) {
      const messages: MessageType[] = [];
      for (const item of data.history) {
        if (typeof item === 'string') {
          if (item.startsWith('User: ')) {
            messages.push({
              id: Date.now().toString() + Math.random(),
              content: item.substring(6),
              sender: "user",
              timestamp: new Date(),
            });
          } else if (item.startsWith('Bot: ')) {
            messages.push({
              id: Date.now().toString() + Math.random(),
              content: item.substring(5),
              sender: "bot",
              timestamp: new Date(),
            });
          }
        }
      }
      return messages;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

// Function to upload files to the backend
export async function uploadFile(
  file: File, 
  type: "csv" | "privacy" | "terms"
): Promise<boolean> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log(`Mock file upload for ${type} in development mode`);
      // Simulate successful upload in development
      localStorage.setItem(`file_${type}`, file.name);
      return true;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error(`Error uploading ${type} file:`, error);
    return false;
  }
}

// Function to set CSV URL
export async function setCSVUrl(url: string): Promise<boolean> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Mock CSV URL setting in development mode");
      localStorage.setItem("csv_url", url);
      return true;
    }
    
    const response = await fetch(`${API_URL}/set-csv-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("Error setting CSV URL:", error);
    return false;
  }
}

// Function to save API key
export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Mock API key saving in development mode");
      localStorage.setItem("gemini_api_key", apiKey);
      return true;
    }
    
    const response = await fetch(`${API_URL}/api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ api_key: apiKey }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
}

// Function to clear API key
export async function clearApiKey(): Promise<boolean> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Mock API key clearing in development mode");
      localStorage.removeItem("gemini_api_key");
      return true;
    }
    
    const response = await fetch(`${API_URL}/clear-api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("Error clearing API key:", error);
    return false;
  }
}

// Function to check if all required files are uploaded
export async function checkFilesStatus(): Promise<{
  csv: boolean;
  privacy: boolean;
  terms: boolean;
}> {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendStatus();
    if (!backendAvailable) {
      console.log("Using mock file status for development");
      // Check localStorage for mock uploads in development
      return {
        csv: !!localStorage.getItem("csv_url") || !!localStorage.getItem("file_csv"),
        privacy: !!localStorage.getItem("file_privacy"),
        terms: !!localStorage.getItem("file_terms"),
      };
    }
    
    const response = await fetch(`${API_URL}/files-status`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      csv: data.csv || false,
      privacy: data.privacy || false,
      terms: data.terms || false,
    };
  } catch (error) {
    console.error("Error checking files status:", error);
    // Return mock data in case of error
    return {
      csv: !!localStorage.getItem("csv_url") || !!localStorage.getItem("file_csv"),
      privacy: !!localStorage.getItem("file_privacy"),
      terms: !!localStorage.getItem("file_terms"),
    };
  }
}

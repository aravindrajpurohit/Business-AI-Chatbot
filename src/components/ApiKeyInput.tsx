
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Key } from "lucide-react";
import { saveApiKey, clearApiKey } from "@/lib/api";

interface ApiKeyInputProps {
  onSaveComplete?: () => void;
  disableAutoNavigation?: boolean;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  onSaveComplete,
  disableAutoNavigation = false
}) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if API key already exists in localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setSaved(true);
    }
  }, []);
  
  const handleSaveApiKey = async () => {
    if (apiKey.trim()) {
      setIsLoading(true);
      try {
        const success = await saveApiKey(apiKey.trim());
        if (success) {
          setSaved(true);
          toast({
            title: "API Key Saved",
            description: "Your Google Gemini API key has been saved.",
          });
          
          // Call the onSaveComplete callback if provided and not disabled
          if (onSaveComplete && !disableAutoNavigation) {
            onSaveComplete();
          }
        } else {
          toast({
            variant: "destructive",
            title: "Failed to Save API Key",
            description: "There was an error saving your API key.",
          });
        }
      } catch (error) {
        console.error("Error saving API key:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while saving your API key.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Empty API Key",
        description: "Please enter a valid API key.",
      });
    }
  };
  
  const handleClearApiKey = async () => {
    setIsLoading(true);
    try {
      const success = await clearApiKey();
      if (success) {
        setApiKey("");
        setSaved(false);
        toast({
          title: "API Key Removed",
          description: "Your Google Gemini API key has been removed.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Remove API Key",
          description: "There was an error removing your API key.",
        });
      }
    } catch (error) {
      console.error("Error clearing API key:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while removing your API key.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Key size={16} className="text-primary" />
        <label htmlFor="api-key" className="text-sm font-medium">
          Google Gemini API Key
        </label>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setSaved(false);
          }}
          placeholder="Enter your Google Gemini API key"
          className="flex-1"
          disabled={isLoading}
        />
        {saved ? (
          <Button variant="outline" onClick={handleClearApiKey} size="sm" disabled={isLoading}>
            Clear
          </Button>
        ) : (
          <Button onClick={handleSaveApiKey} size="sm" disabled={isLoading}>
            Save
          </Button>
        )}
      </div>
      
      {saved ? (
        <div className="text-green-500 flex items-center text-xs">
          <CheckCircle size={12} className="mr-1" /> API key saved
        </div>
      ) : (
        <div className="text-amber-500 flex items-center text-xs">
          <AlertCircle size={12} className="mr-1" /> API key not saved
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>
      </div>
    </div>
  );
};

export default ApiKeyInput;

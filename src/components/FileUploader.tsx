
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileType, CheckCircle, X, AlertCircle } from "lucide-react";
import { uploadFile, setCSVUrl, checkFilesStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileStatus } from "@/lib/constants";

type FileUploaderProps = {
  onStatusChange: (status: FileStatus) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onStatusChange }) => {
  const { toast } = useToast();
  const [csvUrl, setCsvUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileStatus, setFileStatus] = useState<FileStatus>({
    csv: false,
    privacy: false,
    terms: false,
  });

  // Check files status on load
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await checkFilesStatus();
      setFileStatus(status);
      onStatusChange(status);
    };
    
    fetchStatus();
  }, [onStatusChange]);
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "csv" | "privacy" | "terms"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const success = await uploadFile(file, type);
      
      if (success) {
        toast({
          title: "File uploaded successfully",
          description: `${type.toUpperCase()} file has been uploaded.`,
        });
        
        // Update file status
        setFileStatus(prev => ({ ...prev, [type]: true }));
        onStatusChange({ ...fileStatus, [type]: true });
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "There was an error uploading your file.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSetCsvUrl = async () => {
    if (!csvUrl.trim()) return;
    
    setIsUploading(true);
    
    try {
      const success = await setCSVUrl(csvUrl);
      
      if (success) {
        toast({
          title: "CSV URL set successfully",
          description: "The CSV data has been loaded from the URL.",
        });
        
        // Update file status
        setFileStatus(prev => ({ ...prev, csv: true }));
        onStatusChange({ ...fileStatus, csv: true });
      } else {
        toast({
          variant: "destructive",
          title: "Error setting CSV URL",
          description: "There was an error loading data from the URL.",
        });
      }
    } catch (error) {
      console.error("Error setting CSV URL:", error);
      toast({
        variant: "destructive",
        title: "Error setting CSV URL",
        description: "There was an error loading data from the URL.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Upload Required Files</CardTitle>
        <CardDescription>
          Please upload or provide URLs for all required files to use the chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="csv-url" className="text-sm font-medium">
              CSV Data (URL or File)
            </label>
            {fileStatus.csv && (
              <span className="text-green-500 flex items-center text-xs">
                <CheckCircle size={14} className="mr-1" /> Uploaded
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              id="csv-url"
              placeholder="Enter CSV URL"
              value={csvUrl}
              onChange={e => setCsvUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSetCsvUrl}
              disabled={isUploading || !csvUrl.trim()}
              size="sm"
            >
              Load
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground my-1">- OR -</div>
          
          <div className="relative">
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={e => handleFileUpload(e, "csv")}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-4 text-center cursor-pointer",
                "hover:bg-muted/50 transition-colors"
              )}
            >
              <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">
                Click to upload CSV file
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="privacy-file" className="text-sm font-medium">
              Privacy Policy (PDF or TXT)
            </label>
            {fileStatus.privacy && (
              <span className="text-green-500 flex items-center text-xs">
                <CheckCircle size={14} className="mr-1" /> Uploaded
              </span>
            )}
          </div>
          
          <div className="relative">
            <input
              type="file"
              id="privacy-file"
              accept=".txt,.pdf"
              onChange={e => handleFileUpload(e, "privacy")}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-4 text-center cursor-pointer",
                "hover:bg-muted/50 transition-colors"
              )}
            >
              <FileType className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">
                Click to upload Privacy Policy
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="terms-file" className="text-sm font-medium">
              Terms & Conditions (PDF or TXT)
            </label>
            {fileStatus.terms && (
              <span className="text-green-500 flex items-center text-xs">
                <CheckCircle size={14} className="mr-1" /> Uploaded
              </span>
            )}
          </div>
          
          <div className="relative">
            <input
              type="file"
              id="terms-file"
              accept=".txt,.pdf"
              onChange={e => handleFileUpload(e, "terms")}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-4 text-center cursor-pointer",
                "hover:bg-muted/50 transition-colors"
              )}
            >
              <FileType className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">
                Click to upload Terms & Conditions
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center text-sm">
          {Object.values(fileStatus).every(Boolean) ? (
            <span className="text-green-500 flex items-center text-xs">
              <CheckCircle size={14} className="mr-1" /> All files uploaded
            </span>
          ) : (
            <span className="text-amber-500 flex items-center text-xs">
              <AlertCircle size={14} className="mr-1" /> Missing required files
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FileUploader;

"use client";

import { useState, useRef, useEffect } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Interface for OCR result
 */
interface OCRResult {
  status: string;
  message?: string;
  data?: {
    text?: string;
    confidence?: number;
    [key: string]: unknown;
  };
  error?: string;
}

/**
 * StravaOCRPage - A page component that allows users to upload Strava screenshots
 * and process them through OCR to extract information.
 * 
 * @returns {JSX.Element} The rendered Strava OCR upload page
 */
export default function StravaOCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file change when a user selects a file
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  /**
   * Handles file drop when a user drags and drops a file
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Prevents default behavior when a file is dragged over the drop area
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * Processes the uploaded file by sending it to the OCR API
   */
  const processFile = async (fileToProcess: File) => {
    if (!fileToProcess) {
      toast.error("Please select a Strava screenshot first");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileToProcess);
      formData.append('language', 'eng');
      formData.append('engine', 'tesseract');

      // Using our Next.js API route instead of the external endpoint directly
      const response = await fetch('/api/strava-ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process image: ${response.status}`);
      }

      const data = await response.json();
      setOcrResult(data);
      toast.success("Successfully processed Strava screenshot!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process the image");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle click on the select files button
   */
  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process file automatically when it changes
  useEffect(() => {
    if (file && !isLoading) {
      processFile(file);
    }
  }, [file]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Strava Screenshot OCR</h1>
      
      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          Upload your Strava screenshot to extract the data. We&apos;ll process it automatically.
        </p>
        
        {/* Upload area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <CloudArrowUpIcon className="h-16 w-16 text-gray-400" />
            
            <p className="text-lg text-gray-600">
              Drag and drop your Strava screenshot or click the button below to select files
            </p>
            
            {file ? (
              <div className="mt-2 text-sm text-gray-500">
                Selected file: {file.name}
              </div>
            ) : null}
            
            <Button 
              variant="default" 
              className="w-36"
              onClick={handleSelectFilesClick}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Select Files"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      
      {/* Results section */}
      {ocrResult && (
        <div className="mt-8 border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">OCR Results</h2>
          <pre className="bg-white p-4 rounded border overflow-x-auto">
            {JSON.stringify(ocrResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 